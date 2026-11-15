CREATE TABLE categories(id SERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, emoji TEXT NOT NULL DEFAULT '🗺️', sort INT NOT NULL DEFAULT 0);
INSERT INTO categories(name,emoji,sort)
 SELECT world, CASE world WHEN 'Hutan Logika' THEN '🌳' WHEN 'Gunung Algoritma' THEN '⛰️' ELSE '🗺️' END, (row_number() OVER (ORDER BY MIN(id)))::int
 FROM lessons GROUP BY world;
ALTER TABLE lessons ADD COLUMN category_id INT REFERENCES categories(id) ON DELETE SET NULL;
UPDATE lessons l SET category_id=c.id FROM categories c WHERE c.name=l.world;
ALTER TABLE lessons DROP COLUMN world;
