-- Hotels DB checks (run while connected to database: hotels)
SELECT current_database() AS db_name;
SELECT COUNT(*) AS hotels_total FROM hotels;
SELECT COUNT(DISTINCT city) AS hotel_city_count FROM hotels;
SELECT city, COUNT(*) AS hotels_per_city
FROM hotels
GROUP BY city
ORDER BY city;
SELECT hotel_name, city, rating, price_per_night
FROM hotels
ORDER BY city, rating DESC;

-- Taste DB checks (run while connected to database: taste_explorer)
SELECT current_database() AS db_name;
SELECT COUNT(*) AS signature_foods_total FROM signature_foods;
SELECT COUNT(DISTINCT city) AS taste_city_count FROM signature_foods;
SELECT city, COUNT(*) AS foods_per_city
FROM signature_foods
GROUP BY city
ORDER BY city;
SELECT city, restaurant, food
FROM signature_foods
ORDER BY city, restaurant;

-- Optional table existence check (works on both DBs)
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
