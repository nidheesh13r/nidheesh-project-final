import os
import psycopg2

from seed_data import seed_hotels

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5433')
DB_NAME = os.getenv('DB_NAME', 'hotels')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'secret')

print(f'Preparing Hotels DB on {DB_HOST}:{DB_PORT} ({DB_NAME}) for {DB_USER}')

conn = psycopg2.connect(
		host=DB_HOST,
		port=int(DB_PORT),
		dbname=DB_NAME,
		user=DB_USER,
		password=DB_PASSWORD,
)
cur = conn.cursor()

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
			total_price NUMERIC(10,2) NOT NULL,
			status TEXT NOT NULL DEFAULT 'CONFIRMED'
		);
		'''
)

seed_hotels(cur)

conn.commit()
cur.close()
conn.close()

print('Hotels DB setup completed.')
