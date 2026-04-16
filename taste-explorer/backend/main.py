import os
import base64
from contextlib import contextmanager

import psycopg2
import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor

from seed_data import seed_signature_foods

load_dotenv()

DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PORT = int(os.getenv('DB_PORT', '5434'))
DB_NAME = os.getenv('DB_NAME', 'taste_explorer')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'secret')
HOTELS_API_URL = os.getenv('HOTELS_API_URL', 'http://localhost:8001')

app = FastAPI(title='Taste BFF')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*'],
)


class ProfilePayload(BaseModel):
    full_name: str
    email: str
    phone: str = ''


class LibraryPayload(BaseModel):
    food: str
    restaurant: str
    location: str
    email: str = 'guest@example.com'
    image: str = ''


class DeleteLibraryPayload(BaseModel):
    food: str
    restaurant: str
    email: str


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
            CREATE TABLE IF NOT EXISTS users_profile (
                email TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                phone TEXT NOT NULL DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS signature_foods (
                food_id SERIAL PRIMARY KEY,
                city TEXT NOT NULL,
                food TEXT NOT NULL,
                restaurant TEXT NOT NULL,
                image TEXT NOT NULL DEFAULT '',
                image_blob BYTEA,
                image_mime TEXT NOT NULL DEFAULT 'image/jpeg'
            );

            CREATE TABLE IF NOT EXISTS signature_food_library (
                id SERIAL PRIMARY KEY,
                email TEXT NOT NULL,
                city TEXT NOT NULL,
                food TEXT NOT NULL,
                restaurant TEXT NOT NULL,
                image TEXT NOT NULL DEFAULT '',
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
            '''
        )
        cur.execute("ALTER TABLE signature_foods ADD COLUMN IF NOT EXISTS image TEXT NOT NULL DEFAULT ''")
        cur.execute("ALTER TABLE signature_foods ADD COLUMN IF NOT EXISTS image_blob BYTEA")
        cur.execute("ALTER TABLE signature_foods ADD COLUMN IF NOT EXISTS image_mime TEXT NOT NULL DEFAULT 'image/jpeg'")
        cur.execute("ALTER TABLE signature_food_library ADD COLUMN IF NOT EXISTS image TEXT NOT NULL DEFAULT ''")
        seed_signature_foods(cur, reset=False)


def to_image_value(row: dict) -> str:
    blob = row.get('image_blob')
    if blob:
        raw = bytes(blob)
        mime = row.get('image_mime') or 'image/jpeg'
        return f"data:{mime};base64,{base64.b64encode(raw).decode('ascii')}"
    return row.get('image') or ''


@app.on_event('startup')
def on_startup():
    ensure_schema()


@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'taste'}


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
        cur.execute('SELECT DISTINCT city FROM signature_foods ORDER BY city')
        rows = cur.fetchall()
        return {'cities': [row['city'] for row in rows]}


@app.get('/taste/search')
def taste_search(city: str):
    with db_cursor() as cur:
        cur.execute(
            '''
            SELECT food, restaurant, city AS location, image, image_blob, image_mime
            FROM signature_foods
            WHERE lower(city)=lower(%s)
            ''',
            (city,),
        )
        rows = cur.fetchall()
        return [
            {
                'food': row['food'],
                'restaurant': row['restaurant'],
                'location': row['location'],
                'image': to_image_value(row),
            }
            for row in rows
        ]


@app.get('/taste/library')
def taste_library(email: str = 'guest@example.com'):
    with db_cursor() as cur:
        cur.execute(
            'SELECT food, restaurant, city AS location, image FROM signature_food_library WHERE email=%s ORDER BY created_at DESC',
            (email,),
        )
        return cur.fetchall()


@app.post('/taste/library')
def save_to_library(payload: LibraryPayload):
    with db_cursor(commit=True) as cur:
        image = getattr(payload, 'image', '')
        cur.execute(
            '''
            INSERT INTO signature_food_library (email, city, food, restaurant, image)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING food, restaurant, city AS location, image
            ''',
            (payload.email, payload.location, payload.food, payload.restaurant, image),
        )
        return cur.fetchone()


@app.delete('/taste/library')
def remove_from_library(payload: DeleteLibraryPayload):
    with db_cursor(commit=True) as cur:
        cur.execute(
            'DELETE FROM signature_food_library WHERE email=%s AND food=%s AND restaurant=%s',
            (payload.email, payload.food, payload.restaurant),
        )
        return {'ok': cur.rowcount > 0}


@app.get('/widget/hotels')
def hotels_widget(city: str):
    try:
        res = requests.get(f'{HOTELS_API_URL}/hotels/search', params={'city': city}, timeout=2.5)
        if res.ok:
            hotels = res.json()
            return {'city': city, 'hotels': hotels[:2]}
    except Exception:
        pass
    return {'city': city, 'hotels': []}
