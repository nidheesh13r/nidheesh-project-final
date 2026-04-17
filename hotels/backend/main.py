import os
from contextlib import contextmanager

import psycopg2
import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi import HTTPException
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor

from seed_data import seed_hotels

load_dotenv()

DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PORT = int(os.getenv('DB_PORT', '5432'))
DB_NAME = os.getenv('DB_NAME', 'hotels')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'secret')
TASTE_API_URL = os.getenv('TASTE_API_URL', 'http://localhost:8002')

app = FastAPI(title='Hotels BFF')


class ProfilePayload(BaseModel):
    full_name: str
    email: str
    phone: str = ''


class BookingPayload(BaseModel):
    hotel_name: str
    city: str
    room_type: str
    check_in: str
    check_out: str
    total_price: float
    num_rooms: int = 1
    num_guests: int = 1
    gov_id: str = ''
    email: str = 'guest@example.com'


@contextmanager
def db_cursor(commit: bool = False):
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        yield cur
        if commit:
            conn.commit()
    finally:
        cur.close()
        conn.close()


def ensure_schema() -> None:
    with db_cursor(commit=True) as cur:
        cur.execute(
            '''
            CREATE TABLE IF NOT EXISTS hotels (
              hotel_id SERIAL PRIMARY KEY,
              hotel_name TEXT NOT NULL,
              city TEXT NOT NULL,
              room_type TEXT NOT NULL,
              rating NUMERIC(3,1) NOT NULL,
              price_per_night NUMERIC(10,2) NOT NULL,
              image TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS users_profile (
              email TEXT PRIMARY KEY,
              full_name TEXT NOT NULL,
              phone TEXT NOT NULL DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS bookings (
              booking_id SERIAL PRIMARY KEY,
              email TEXT NOT NULL,
              hotel_name TEXT NOT NULL,
              city TEXT NOT NULL,
              room_type TEXT NOT NULL,
              check_in DATE NOT NULL,
              check_out DATE NOT NULL,
              num_rooms INTEGER NOT NULL DEFAULT 1,
              num_guests INTEGER NOT NULL DEFAULT 1,
              gov_id TEXT NOT NULL DEFAULT '',
              total_price NUMERIC(10,2) NOT NULL,
              status TEXT NOT NULL DEFAULT 'CONFIRMED'
            );
            '''
        )
        cur.execute('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS num_rooms INTEGER NOT NULL DEFAULT 1')
        cur.execute('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS num_guests INTEGER NOT NULL DEFAULT 1')
        cur.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS gov_id TEXT NOT NULL DEFAULT ''")
        seed_hotels(cur)


@app.on_event('startup')
def on_startup():
    ensure_schema()


@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'hotels'}


@app.get('/users/profile')
def get_profile(email: str = 'guest@example.com'):
    with db_cursor(commit=True) as cur:
        cur.execute('SELECT * FROM users_profile WHERE email = %s', (email,))
        row = cur.fetchone()
        if row:
            return row
        cur.execute(
            'INSERT INTO users_profile (email, full_name, phone) VALUES (%s, %s, %s) RETURNING *',
            (email, 'Guest User', ''),
        )
        return cur.fetchone()


@app.put('/users/profile')
def update_profile(payload: ProfilePayload):
    with db_cursor(commit=True) as cur:
        cur.execute(
            '''
            INSERT INTO users_profile (email, full_name, phone)
            VALUES (%s, %s, %s)
            ON CONFLICT (email)
            DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone
            RETURNING *
            ''',
            (payload.email, payload.full_name, payload.phone),
        )
        return cur.fetchone()


@app.get('/cities')
def get_cities():
    with db_cursor() as cur:
        cur.execute('SELECT DISTINCT city FROM hotels ORDER BY city')
        rows = cur.fetchall()
        return {'cities': [row['city'] for row in rows]}


@app.get('/hotels/search')
def search_hotels(city: str | None = None):
    with db_cursor() as cur:
        if city:
            cur.execute('SELECT * FROM hotels WHERE lower(city) = lower(%s) ORDER BY rating DESC', (city,))
        else:
            cur.execute('SELECT * FROM hotels ORDER BY rating DESC')
        return cur.fetchall()


@app.get('/bookings/my')
def my_bookings(email: str = 'guest@example.com'):
    with db_cursor() as cur:
        cur.execute('SELECT * FROM bookings WHERE email = %s ORDER BY booking_id DESC', (email,))
        return cur.fetchall()


@app.post('/bookings')
def create_booking(payload: BookingPayload):
    if payload.num_rooms < 1:
        raise HTTPException(status_code=400, detail='num_rooms must be at least 1')
    if payload.num_guests < 1:
        raise HTTPException(status_code=400, detail='num_guests must be at least 1')
    if len(payload.gov_id.strip()) < 6:
        raise HTTPException(status_code=400, detail='gov_id is required and must be at least 6 characters')

    with db_cursor(commit=True) as cur:
        cur.execute(
            '''
            INSERT INTO bookings (email, hotel_name, city, room_type, check_in, check_out, num_rooms, num_guests, gov_id, total_price, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'CONFIRMED')
            RETURNING *
            ''',
            (
                payload.email,
                payload.hotel_name,
                payload.city,
                payload.room_type,
                payload.check_in,
                payload.check_out,
                payload.num_rooms,
                payload.num_guests,
                payload.gov_id.strip(),
                payload.total_price,
            ),
        )
        return cur.fetchone()


@app.post('/bookings/{booking_id}/cancel')
def cancel_booking(booking_id: int):
    with db_cursor(commit=True) as cur:
        cur.execute(
            "UPDATE bookings SET status = 'CANCELLED' WHERE booking_id = %s RETURNING *",
            (booking_id,),
        )
        row = cur.fetchone()
        return row or {'booking_id': booking_id, 'status': 'NOT_FOUND'}


@app.get('/widget/taste')
def taste_widget(city: str):
    try:
        res = requests.get(f'{TASTE_API_URL}/taste/search', params={'city': city}, timeout=2.5)
        if res.ok:
            items = res.json()
            mapped = [
                {
                    'title': item.get('food', ''),
                    'restaurant': item.get('restaurant', ''),
                    'availability': f"{item.get('location', city)}",
                }
                for item in items
            ]
            return {'city': city, 'items': mapped}
    except Exception:
        pass
    return {'city': city, 'items': []}
