import requests
from urllib.parse import quote

REQUEST_HEADERS = {'User-Agent': 'TasteExplorerSeeder/1.0 (local dev)'}


CITY_RESTAURANTS = {
    'Mumbai': {
        'Britannia & Co.': ['Berry Pulao', 'Mutton Cutlet', 'Sali Boti', 'Caramel Custard', 'Dhansak'],
        'Leopold Cafe': ['Chicken Tikka', 'Keema Pav', 'Prawn Curry', 'Fish and Chips', 'Chicken Stroganoff'],
        'Bademiya': ['Chicken Seekh Kebab', 'Mutton Seekh Roll', 'Baida Roti', 'Rumali Roti', 'Chicken Tikka Roll'],
        'Trishna': ['Butter Garlic Crab', 'Tandoori Pomfret', 'Prawn Koliwada', 'Bombil Fry', 'Seafood Biryani'],
        'Cafe Madras': ['Rava Idli', 'Mysore Masala Dosa', 'Pongal', 'Filter Coffee', 'Upma'],
    },
    'Delhi': {
        "Karim's": ['Mutton Korma', 'Chicken Jahangiri', 'Seekh Kebab', 'Roomali Roti', 'Mutton Biryani'],
        'Indian Accent': ['Blue Cheese Naan', 'Galawat Lamb', 'Doda Barfi Treacle Tart', 'Meetha Achaar Ribs', 'Daulat Ki Chaat'],
        'Saravana Bhavan': ['Ghee Roast Dosa', 'Mini Tiffin', 'Idli Vada', 'Pongal', 'Filter Coffee'],
        'Moti Mahal Delux': ['Butter Chicken', 'Dal Makhani', 'Tandoori Chicken', 'Paneer Tikka', 'Butter Naan'],
        'Sita Ram Diwan Chand': ['Chole Bhature', 'Masala Chole', 'Aloo Bhature', 'Lassi', 'Gulab Jamun'],
    },
    'Bengaluru': {
        'MTR 1924': ['Rava Idli', 'Bisi Bele Bath', 'Masala Dosa', 'Badam Halwa', 'Filter Coffee'],
        'Vidyarthi Bhavan': ['Masala Dosa', 'Khara Bath', 'Kesari Bath', 'Vada', 'Filter Coffee'],
        'Nagarjuna': ['Andhra Chicken Curry', 'Gongura Mutton', 'Nellore Fish Curry', 'Chicken Fry', 'Andhra Meals'],
        'CTR Shri Sagar': ['Benne Masala Dosa', 'Vada', 'Kesari Bath', 'Khara Bath', 'Filter Coffee'],
        'Meghana Foods': ['Boneless Chicken Biryani', 'Andhra Chilli Chicken', 'Apollo Fish', 'Chicken 65', 'Mutton Biryani'],
    },
    'Chennai': {
        'Murugan Idli Shop': ['Idli with Podi', 'Ghee Pongal', 'Onion Uthappam', 'Medu Vada', 'Filter Coffee'],
        'Ratna Cafe': ['Sambar Idli', 'Rava Dosa', 'Pongal', 'Poori Masala', 'Badam Milk'],
        'Buhari Hotel': ['Chicken 65', 'Mutton Biryani', 'Pepper Chicken', 'Parotta', 'Mutton Chukka'],
        'Nair Mess': ['Vanjaram Fry', 'Mutton Curry', 'Nethili Fry', 'Chicken Varuval', 'Egg Masala'],
        'Sangeetha Veg': ['Mini Tiffin', 'Paper Roast Dosa', 'Curd Rice', 'Lemon Rice', 'Filter Coffee'],
    },
    'Hyderabad': {
        'Paradise Biryani': ['Hyderabadi Chicken Biryani', 'Mutton Biryani', 'Haleem', 'Double Ka Meetha', 'Mirchi Ka Salan'],
        'Shah Ghouse': ['Chicken Biryani', 'Mutton Marag', 'Chicken 65', 'Talawa Gosht', 'Qubani Ka Meetha'],
        'Chutneys': ['Pesarattu Dosa', 'Idli', 'Pongal', 'Filter Coffee', 'Rava Dosa'],
        'Bawarchi': ['Chicken Biryani', 'Mutton Biryani', 'Apollo Fish', 'Chicken Majestic', 'Chicken Kebab'],
        'Peshawar': ['Pathar Ka Gosht', 'Mutton Kebab', 'Chicken Kebab', 'Roomali Roti', 'Mutton Biryani'],
    },
    'Kolkata': {
        'Arsalan': ['Kolkata Mutton Biryani', 'Chicken Chaap', 'Mutton Rezala', 'Firni', 'Raita'],
        'Peter Cat': ['Chelo Kebab', 'Sizzler', 'Chicken A La Kiev', 'Devilled Crab', 'Brownie with Ice Cream'],
        '6 Ballygunge Place': ['Kosha Mangsho', 'Chingri Malai Curry', 'Bhetki Paturi', 'Mochar Ghonto', 'Mishti Doi'],
        "Flurys": ['English Breakfast', 'Chicken Patties', 'Rum Ball', 'Black Forest Pastry', 'Tea Cakes'],
        'Kusum Rolls': ['Chicken Roll', 'Mutton Roll', 'Egg Chicken Roll', 'Paneer Roll', 'Double Egg Roll'],
    },
    'Pune': {
        'Vaishali': ['Mysore Dosa', 'Set Dosa', 'Idli Vada', 'Sabudana Khichdi', 'Filter Coffee'],
        'Shabree': ['Maharashtrian Thali', 'Puran Poli', 'Bharli Vangi', 'Solkadhi', 'Shrikhand'],
        'Bedekar Misal': ['Misal Pav', 'Batata Bhaji', 'Kanda Bhaji', 'Dahi Misal', 'Tak'],
        'George Restaurant': ['Chicken Biryani', 'Mutton Curry', 'Kheema Pav', 'Chicken Cutlet', 'Caramel Custard'],
        'Kayani Bakery': ['Shrewsbury Biscuit', 'Mawa Cake', 'Puff', 'Fruit Cake', 'Bun Maska'],
    },
    'Ahmedabad': {
        'Agashiye': ['Gujarati Thali', 'Undhiyu', 'Dal Dhokli', 'Handvo', 'Basundi'],
        'Swati Snacks': ['Panki', 'Khaman', 'Patra', 'Sev Puri', 'Handvo'],
        'Gordhan Thal': ['Gujarati Thali', 'Dhokla', 'Fafda', 'Kadhi Khichdi', 'Shrikhand'],
        'Das Khaman': ['Khaman', 'Nylon Khaman', 'Patra', 'Dhokla Sandwich', 'Jalebi'],
        'Manek Chowk Food Market': ['Bhaji Pav', 'Ghotala Dosa', 'Chocolate Sandwich', 'Kulfi', 'Pulao'],
    },
    'Jaipur': {
        'Laxmi Mishthan Bhandar': ['Pyaz Kachori', 'Ghewar', 'Rajasthani Thali', 'Mawa Kachori', 'Rabri'],
        'Rawat Mishtan Bhandar': ['Pyaz Kachori', 'Mawa Kachori', 'Mirchi Vada', 'Dhokla', 'Lassi'],
        'Handi Restaurant': ['Laal Maas', 'Jungli Maas', 'Butter Chicken', 'Tandoori Roti', 'Chicken Biryani'],
        'Niros': ['Chicken Tikka', 'Mutton Rogan Josh', 'Fish Tikka', 'Shami Kebab', 'Caramel Custard'],
        'Spice Court': ['Laal Maas', 'Ker Sangri', 'Dal Baati Churma', 'Gatte Ki Sabzi', 'Malpua'],
    },
    'Kochi': {
        'Kashi Art Cafe': ['French Toast', 'Pancakes', 'Eggs Benedict', 'Cold Coffee', 'Banana Cake'],
        'Dhe Puttu': ['Puttu and Kadala', 'Beef Puttu', 'Chemmeen Puttu', 'Fish Curry', 'Kappa'],
        'Paragon': ['Malabar Biryani', 'Fish Mango Curry', 'Prawn Roast', 'Appam', 'Chicken Fry'],
        'Kayees Rahmathulla Cafe': ['Mutton Biryani', 'Alsa', 'Mutton Curry', 'Pathiri', 'Falooda'],
        'Grand Pavilion': ['Kerala Meals', 'Fish Molee', 'Appam', 'Kappa and Fish Curry', 'Payasam'],
    },
    'Lucknow': {
        'Tunday Kababi': ['Galouti Kebab', 'Kakori Kebab', 'Biryani', 'Sheermal', 'Korma'],
        'Idris Biryani': ['Mutton Biryani', 'Chicken Biryani', 'Korma', 'Seekh Kebab', 'Raita'],
        'Dastarkhwan': ['Nihari', 'Kulcha Nihari', 'Mutton Biryani', 'Rumali Roti', 'Phirni'],
        'Moti Mahal Lucknow': ['Butter Chicken', 'Dal Makhani', 'Paneer Tikka', 'Tandoori Roti', 'Gulab Jamun'],
        'Royal Sky': ['Awadhi Thali', 'Lucknowi Kebabs', 'Shahi Tukda', 'Lucknowi Pulao', 'Falooda'],
    },
    'Kanpur': {
        'Thaggu Ke Laddu': ['Motichoor Laddu', 'Kaju Katli', 'Gulab Jamun', 'Rasgulla', 'Peda'],
        'Chatorey': ['Aloo Tikki', 'Pani Puri', 'Dahi Bhalla', 'Samosa Chaat', 'Raj Kachori'],
        'Sagar Ratna Kanpur': ['Masala Dosa', 'Idli', 'Uttapam', 'Pongal', 'Filter Coffee'],
        'Milan Restaurant': ['Chicken Curry', 'Mutton Curry', 'Paneer Butter Masala', 'Naan', 'Biryani'],
        'The Royale Kitchen': ['Kanpuri Thali', 'Tandoori Platter', 'Paratha', 'Lassi', 'Kheer'],
    },
    'Nagpur': {
        'Nanking': ['Schezwan Noodles', 'Fried Rice', 'Chilli Paneer', 'Manchurian', 'Spring Rolls'],
        'Haldiram Nagpur': ['Samosa', 'Kachori', 'Pav Bhaji', 'Chole Bhature', 'Gulab Jamun'],
        'Barbeque Nation': ['Tandoori Chicken', 'Seekh Kebab', 'Paneer Tikka', 'Mutton Seekh', 'Brownie'],
        'Hotel Centre Point': ['Nagpuri Saoji Chicken', 'Saoji Mutton', 'Biryani', 'Roti', 'Kharvas'],
        'Zam Zam': ['Biryani', 'Chicken 65', 'Kebab Platter', 'Naan', 'Falooda'],
    },
    'Indore': {
        'Sarafa Bazaar': ['Poha Jalebi', 'Bhutte Ka Kees', 'Kachori', 'Malpua', 'Rabri'],
        'Chhappan Dukan': ['Dahi Bada', 'Garadu', 'Pani Puri', 'Shikanji', 'Kulfi'],
        'Vijay Chaat House': ['Aloo Tikki', 'Samosa Chaat', 'Sev Puri', 'Dahi Puri', 'Bhel Puri'],
        'Chokhi Dhani Indore': ['Dal Baati', 'Laal Maas', 'Gatte Ki Sabzi', 'Ker Sangri', 'Churma'],
        'The Square Indore': ['Paneer Tikka', 'Veg Platter', 'Naan', 'Brownie', 'Mocktail'],
    },
    'Surat': {
        'Gwalia Sweets': ['Locho', 'Khaman', 'Dhokla', 'Sev Khamani', 'Fafda'],
        'Kansar Gujarati Thali': ['Gujarati Thali', 'Undhiyu', 'Handvo', 'Rotla', 'Basundi'],
        'Palladium Surat': ['Pav Bhaji', 'Masala Dosa', 'Veg Platter', 'Manchurian', 'Kulfi'],
        'Sugar N Spice': ['Pizza', 'Pasta', 'Sandwich', 'Burger', 'Milkshake'],
        'The Grand Bhagwati Surat': ['Surti Locho', 'Rajasthani Thali', 'Kachori', 'Jalebi', 'Lassi'],
    },
}


def image_url(food: str) -> str:
    query = food.lower().replace(' ', '-').replace('&', 'and')
    return f'https://source.unsplash.com/1200x800/?{query},indian-food'


TASTE_SEED = [
    (city, food, restaurant, image_url(food))
    for city, restaurants in CITY_RESTAURANTS.items()
    for restaurant, foods in restaurants.items()
    for food in foods
]


def seed_signature_foods(cur, reset: bool = True) -> None:
    if reset:
        cur.execute('TRUNCATE TABLE signature_foods RESTART IDENTITY')

    if reset:
        cur.executemany(
            '''
            INSERT INTO signature_foods (city, food, restaurant, image)
            VALUES (%s, %s, %s, %s)
            ''',
            TASTE_SEED,
        )
        return

    # Backfill any missing rows so existing databases with partial seed data
    # (from older versions) are brought up to date without duplication.
    for city, food, restaurant, image in TASTE_SEED:
        cur.execute(
            '''
            INSERT INTO signature_foods (city, food, restaurant, image)
            SELECT %s, %s, %s, %s
            WHERE NOT EXISTS (
                SELECT 1
                FROM signature_foods
                WHERE lower(city) = lower(%s)
                  AND lower(food) = lower(%s)
                  AND lower(restaurant) = lower(%s)
            )
            ''',
            (city, food, restaurant, image, city, food, restaurant),
        )


def download_images_to_db(cur, timeout: int = 8) -> tuple[int, int]:
    cur.execute(
        '''
        SELECT food_id, image
        FROM signature_foods
        WHERE image IS NOT NULL
          AND image <> ''
          AND (image_blob IS NULL OR octet_length(image_blob) = 0)
        ORDER BY food_id
        '''
    )
    rows = cur.fetchall()
    success = 0
    failed = 0
    for idx, row in enumerate(rows, start=1):
        food_id = row['food_id'] if isinstance(row, dict) else row[0]
        url = row['image'] if isinstance(row, dict) else row[1]
        cur.execute('SELECT food FROM signature_foods WHERE food_id = %s', (food_id,))
        food_row = cur.fetchone()
        food_name = food_row['food'] if isinstance(food_row, dict) else food_row[0]
        wiki_image = wikipedia_thumbnail(food_name, timeout=timeout)
        candidates = [candidate for candidate in [wiki_image, url] if candidate]
        if not candidates:
            failed += 1
            continue
        try:
            stored = False
            for candidate in candidates:
                response = requests.get(candidate, timeout=timeout, headers=REQUEST_HEADERS)
                if not response.ok:
                    continue
                content_type = response.headers.get('content-type', 'image/jpeg').split(';')[0]
                if not content_type.startswith('image/'):
                    continue
                cur.execute(
                    '''
                    UPDATE signature_foods
                    SET image = %s,
                        image_blob = %s,
                        image_mime = %s
                    WHERE food_id = %s
                    ''',
                    (candidate, response.content, content_type, food_id),
                )
                success += 1
                stored = True
                break
            if not stored:
                fallback = make_food_svg(food_name)
                cur.execute(
                    '''
                    UPDATE signature_foods
                    SET image_blob = %s,
                        image_mime = %s
                    WHERE food_id = %s
                    ''',
                    (fallback, 'image/svg+xml', food_id),
                )
                success += 1
        except Exception:
            try:
                fallback = make_food_svg(food_name)
                cur.execute(
                    '''
                    UPDATE signature_foods
                    SET image_blob = %s,
                        image_mime = %s
                    WHERE food_id = %s
                    ''',
                    (fallback, 'image/svg+xml', food_id),
                )
                success += 1
            except Exception:
                failed += 1
        if idx % 25 == 0:
            try:
                cur.connection.commit()
            except Exception:
                pass
            print(f'Processed {idx}/{len(rows)} foods; success={success}, failed={failed}', flush=True)
    return success, failed


def wikipedia_thumbnail(food: str, timeout: int = 10) -> str | None:
    raw = food.strip()
    if not raw:
        return None
    words = [w for w in raw.replace('&', ' and ').split() if w]
    candidates = [
        raw,
        ' '.join(words[:3]),
        ' '.join(words[:2]),
        words[0] if words else raw,
    ]
    seen: set[str] = set()
    for candidate in candidates:
        term = candidate.strip()
        if not term or term in seen:
            continue
        seen.add(term)
        title = quote(term.replace(' ', '_'))
        url = f'https://en.wikipedia.org/api/rest_v1/page/summary/{title}'
        try:
            response = requests.get(url, timeout=timeout, headers=REQUEST_HEADERS)
            if not response.ok:
                continue
            data = response.json()
            thumb = data.get('thumbnail', {})
            source = thumb.get('source')
            if isinstance(source, str) and source:
                return source
        except Exception:
            continue
    return None


def make_food_svg(food: str) -> bytes:
        safe = (food or 'Signature Food').replace('&', 'and').replace('<', '').replace('>', '')
        svg = f"""
<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
    <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stop-color='#7c2d12'/>
            <stop offset='100%' stop-color='#ea580c'/>
        </linearGradient>
    </defs>
    <rect width='1200' height='800' fill='url(#g)'/>
    <circle cx='1030' cy='130' r='120' fill='rgba(255,255,255,0.16)'/>
    <circle cx='170' cy='670' r='160' fill='rgba(255,255,255,0.10)'/>
    <text x='100' y='370' fill='white' font-size='88' font-family='Segoe UI, Arial, sans-serif' font-weight='700'>
        {safe}
    </text>
    <text x='100' y='450' fill='rgba(255,255,255,0.88)' font-size='38' font-family='Segoe UI, Arial, sans-serif'>
        Signature Dish
    </text>
</svg>
""".strip()
        return svg.encode('utf-8')
