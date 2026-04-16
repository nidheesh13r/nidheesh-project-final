import os
import psycopg2

from seed_data import make_food_svg

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5434')
DB_NAME = os.getenv('DB_NAME', 'taste_explorer')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'secret')

print(f'Downloading Taste food images into DB on {DB_HOST}:{DB_PORT} ({DB_NAME})', flush=True)

conn = psycopg2.connect(
    host=DB_HOST,
    port=int(DB_PORT),
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
)
cur = conn.cursor()

cur.execute('SELECT food_id, food FROM signature_foods ORDER BY food_id')
rows = cur.fetchall()
success = 0
failed = 0
for idx, (food_id, food) in enumerate(rows, start=1):
    try:
        cur.execute(
            '''
            UPDATE signature_foods
            SET image_blob = %s,
                image_mime = %s
            WHERE food_id = %s
            ''',
            (make_food_svg(food), 'image/svg+xml', food_id),
        )
        success += 1
    except Exception:
        failed += 1
    if idx % 25 == 0:
        conn.commit()
        print(f'Processed {idx}/{len(rows)} foods; success={success}, failed={failed}', flush=True)

conn.commit()
cur.close()
conn.close()

print(f'Image download completed. Success: {success}, Failed: {failed}', flush=True)