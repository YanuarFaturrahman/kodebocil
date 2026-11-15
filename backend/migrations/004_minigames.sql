ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_kind_check;
ALTER TABLE lessons ADD CONSTRAINT lessons_kind_check CHECK (kind IN ('maze','pattern','urutan','quiz','memori','lampu'));
INSERT INTO categories(name,emoji,sort) VALUES
 ('Taman Memori','🃏',2),('Kebun Urutan','📋',4),('Kota Jika-Maka','🏙️',6),('Lab Lampu Ajaib','💡',8)
ON CONFLICT (name) DO NOTHING;
UPDATE categories SET sort=CASE name WHEN 'Hutan Logika' THEN 1 WHEN 'Taman Memori' THEN 2 WHEN 'Lembah Pola' THEN 3
 WHEN 'Kebun Urutan' THEN 4 WHEN 'Gunung Algoritma' THEN 5 WHEN 'Kota Jika-Maka' THEN 6 WHEN 'Pulau Labirin' THEN 7
 WHEN 'Lab Lampu Ajaib' THEN 8 WHEN 'Galaksi Coder' THEN 9 ELSE sort END;
INSERT INTO lessons(title,description,kind,category_id,xp_reward,content)
SELECT v.t,v.d,v.k,c.id,v.x,v.c::jsonb FROM (VALUES
 ('Taman Memori','Dua Pasang','Temukan kartu yang kembar.','memori',15,'{"pairs":["🍎","🍌"]}'),
 ('Taman Memori','Tiga Pasang','Ingat letak kartunya!','memori',20,'{"pairs":["🐱","🐶","🐰"]}'),
 ('Taman Memori','Empat Pasang','Kartu makin banyak.','memori',25,'{"pairs":["🚗","🚲","✈️","🚀"]}'),
 ('Taman Memori','Kartu Jago','Enam pasang, ingat baik-baik.','memori',35,'{"pairs":["🌞","🌙","⭐","🌈","☁️","🔥"]}'),
 ('Kebun Urutan','Cuci Tangan','Susun langkah dari yang pertama.','urutan',25,'{"steps":["Basahi tangan 💦","Sabuni tangan 🧼","Bilas dan keringkan 🧻"]}'),
 ('Kebun Urutan','Sikat Gigi','Urutan yang benar membuat gigi sehat.','urutan',30,'{"steps":["Ambil sikat gigi 🪥","Beri pasta gigi","Sikat semua gigi","Berkumur sampai bersih"]}'),
 ('Kebun Urutan','Roti Selai','Algoritma membuat sarapan.','urutan',35,'{"steps":["Siapkan dua roti 🍞","Oles selai di satu roti","Tutup dengan roti kedua","Potong jadi dua","Makan dengan lahap"]}'),
 ('Kebun Urutan','Menanam Bunga','Enam langkah sampai bunga mekar.','urutan',45,'{"steps":["Gali tanah kecil","Taruh bibit 🌱","Tutup dengan tanah","Siram air 💧","Taruh di tempat terang ☀️","Tunggu bunga mekar 🌻"]}'),
 ('Kota Jika-Maka','Lampu Lalu Lintas','Belajar JIKA-MAKA.','quiz',35,'{"q":"Jika lampu lalu lintas merah, mobil harus apa?","show":"🚦🔴","options":["Berhenti","Jalan terus"],"answer":"Berhenti"}'),
 ('Kota Jika-Maka','Angka Penentu','JIKA dan JIKA TIDAK.','quiz',40,'{"q":"Jika angka lebih dari 5, hasilnya ⭐. Jika tidak, hasilnya 🌙. Angkanya 3. Apa hasilnya?","show":"3️⃣","options":["⭐","🌙"],"answer":"🌙"}'),
 ('Kota Jika-Maka','Robot Bertepuk','Belajar perulangan.','quiz',45,'{"q":"Robot mengulang 3 kali: 👏👏. Berapa tepukan semuanya?","show":"🔁 3 × 👏👏","options":["3","5","6"],"answer":"6"}'),
 ('Kota Jika-Maka','Robot Melompat','Perulangan dengan banyak perintah.','quiz',50,'{"q":"Ulangi 2 kali: lompat, lompat, tepuk. Berapa kali robot melompat?","show":"🔁 2 × (🦘🦘👏)","options":["2","4","6"],"answer":"4"}'),
 ('Lab Lampu Ajaib','Lampu Pertama','Nyalakan lampu sampai jumlahnya sama dengan target.','lampu',40,'{"bits":2,"target":3}'),
 ('Lab Lampu Ajaib','Tiga Lampu','Lampu bernilai 4, 2, dan 1.','lampu',45,'{"bits":3,"target":5}'),
 ('Lab Lampu Ajaib','Empat Lampu','Lampu bernilai 8, 4, 2, dan 1.','lampu',55,'{"bits":4,"target":11}'),
 ('Lab Lampu Ajaib','Lampu Ajaib','Lima lampu, satu target besar.','lampu',65,'{"bits":5,"target":22}')
) AS v(cat,t,d,k,x,c) JOIN categories c ON c.name=v.cat;
