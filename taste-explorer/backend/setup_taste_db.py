import os
import psycopg2

from seed_data import seed_signature_foods

DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PORT = os.getenv('DB_PORT', '5434')
DB_NAME = os.getenv('DB_NAME', 'taste_explorer')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'secret')

print(f'Preparing Taste DB on {DB_HOST}:{DB_PORT} ({DB_NAME}) for {DB_USER}')

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

cur.execute('TRUNCATE TABLE signature_food_library, users_profile, signature_foods RESTART IDENTITY CASCADE')

cur.execute("ALTER TABLE signature_foods ADD COLUMN IF NOT EXISTS image TEXT NOT NULL DEFAULT ''")
cur.execute("ALTER TABLE signature_foods ADD COLUMN IF NOT EXISTS image_blob BYTEA")
cur.execute("ALTER TABLE signature_foods ADD COLUMN IF NOT EXISTS image_mime TEXT NOT NULL DEFAULT 'image/jpeg'")
cur.execute("ALTER TABLE signature_food_library ADD COLUMN IF NOT EXISTS image TEXT NOT NULL DEFAULT ''")

seed_signature_foods(cur, reset=False)
success, failed = 0, 0

conn.commit()
cur.close()
conn.close()

print('Taste DB setup completed. Image download skipped for fast reset.')

