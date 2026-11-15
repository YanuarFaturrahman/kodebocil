CREATE TABLE users(
 id SERIAL PRIMARY KEY, name TEXT NOT NULL, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
 role TEXT NOT NULL CHECK (role IN ('admin','parent','child')),
 parent_id INT REFERENCES users(id) ON DELETE CASCADE, avatar TEXT NOT NULL DEFAULT '🐯', xp INT NOT NULL DEFAULT 0);
CREATE TABLE lessons(
 id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
 kind TEXT NOT NULL CHECK (kind IN ('maze','pattern')), world TEXT NOT NULL DEFAULT 'Hutan Logika',
 xp_reward INT NOT NULL DEFAULT 20, content JSONB NOT NULL);
CREATE TABLE progress(
 user_id INT REFERENCES users(id) ON DELETE CASCADE, lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
 stars INT NOT NULL, PRIMARY KEY(user_id, lesson_id));
CREATE TABLE badges(id SERIAL PRIMARY KEY, name TEXT NOT NULL, emoji TEXT NOT NULL, xp_required INT NOT NULL);
CREATE TABLE user_badges(user_id INT REFERENCES users(id) ON DELETE CASCADE, badge_id INT REFERENCES badges(id) ON DELETE CASCADE, PRIMARY KEY(user_id, badge_id));
INSERT INTO badges(name,emoji,xp_required) VALUES
('Pemula','🌱',10),('Penjelajah','🧭',50),('Programmer Cilik','💻',100),('Jagoan Logika','🧠',200),('Raja Koding','👑',400);
INSERT INTO lessons(title,description,kind,world,xp_reward,content) VALUES
('Robot ke Bintang','Susun perintah agar robot sampai ke bintang!','maze','Hutan Logika',20,'{"n":4,"start":[0,0],"goal":[3,0],"walls":[]}'),
('Lewati Tembok','Robot harus memutar. Cari jalannya!','maze','Hutan Logika',25,'{"n":4,"start":[0,0],"goal":[3,3],"walls":[[1,0],[1,1],[1,2]]}'),
('Labirin Zigzag','Urutan perintah makin panjang.','maze','Gunung Algoritma',35,'{"n":5,"start":[0,0],"goal":[4,4],"walls":[[1,1],[2,1],[3,1],[1,3],[2,3],[3,3]]}'),
('Pola Buah','Apa yang datang berikutnya?','pattern','Hutan Logika',20,'{"seq":["🍎","🍌","🍎","🍌","🍎"],"options":["🍌","🍇","🍎"],"answer":"🍌"}'),
('Pola Warna','Temukan pola warnanya.','pattern','Gunung Algoritma',25,'{"seq":["🔴","🔴","🔵","🔴","🔴"],"options":["🔴","🔵","🟢"],"answer":"🔵"}'),
('Pola Hewan','Pola yang lebih panjang.','pattern','Gunung Algoritma',30,'{"seq":["🐱","🐶","🐶","🐱","🐶","🐶","🐱"],"options":["🐱","🐶","🐰"],"answer":"🐶"}');
