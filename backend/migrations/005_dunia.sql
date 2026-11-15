ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_kind_check;
ALTER TABLE lessons ADD CONSTRAINT lessons_kind_check CHECK (kind IN ('maze','pattern','urutan','quiz','memori','lampu','pasang','ganjil','debug','angka','piksel'));
INSERT INTO categories(name,emoji,sort) VALUES
 ('Rumah Mainan','🧸',2),('Detektif Ganjil','🔎',4),('Arena Angka','⚡',6),('Studio Piksel','🎨',8),('Pemburu Bug','🐞',11)
ON CONFLICT (name) DO NOTHING;
UPDATE categories SET sort=CASE name WHEN 'Hutan Logika' THEN 1 WHEN 'Rumah Mainan' THEN 2 WHEN 'Taman Memori' THEN 3
 WHEN 'Detektif Ganjil' THEN 4 WHEN 'Lembah Pola' THEN 5 WHEN 'Arena Angka' THEN 6 WHEN 'Kebun Urutan' THEN 7
 WHEN 'Studio Piksel' THEN 8 WHEN 'Gunung Algoritma' THEN 9 WHEN 'Kota Jika-Maka' THEN 10 WHEN 'Pemburu Bug' THEN 11
 WHEN 'Pulau Labirin' THEN 12 WHEN 'Lab Lampu Ajaib' THEN 13 WHEN 'Galaksi Coder' THEN 14 ELSE sort END;
INSERT INTO lessons(title,description,kind,category_id,xp_reward,content)
SELECT v.t,v.d,v.k,c.id,v.x,v.c::jsonb FROM (VALUES
 ('Rumah Mainan','Suara Hewan','Pasangkan hewan dengan suaranya.','pasang',15,'{"pairs":[["🐱","Meong"],["🐶","Guk guk"],["🐮","Moo"]]}'),
 ('Rumah Mainan','Buah dan Warna','Setiap buah punya warna.','pasang',20,'{"pairs":[["🍎","Merah"],["🍌","Kuning"],["🍇","Ungu"],["🥦","Hijau"]]}'),
 ('Rumah Mainan','Kendaraan dan Tempat','Di mana kendaraan ini berjalan?','pasang',25,'{"pairs":[["🚗","Jalan raya"],["✈️","Langit"],["🚢","Laut"],["🚂","Rel kereta"],["🚀","Luar angkasa"]]}'),
 ('Rumah Mainan','Kode Perintah','Kenali tanda perintah robot.','pasang',35,'{"pairs":[["⬆️","Maju"],["⬇️","Mundur"],["⬅️","Belok kiri"],["➡️","Belok kanan"],["🔁","Ulangi"],["🛑","Berhenti"]]}'),
 ('Detektif Ganjil','Mana yang Beda?','Cari satu yang berbeda.','ganjil',20,'{"q":"Mana yang berbeda?","items":["🍎","🍎","🍌","🍎"],"answer":"🍌"}'),
 ('Detektif Ganjil','Bukan Hewan','Satu benda bukan hewan.','ganjil',25,'{"q":"Mana yang bukan hewan?","items":["🐱","🐶","🐰","🚗","🐭"],"answer":"🚗"}'),
 ('Detektif Ganjil','Bukan Buah','Kelompokkan dulu, baru cari yang ganjil.','ganjil',30,'{"q":"Mana yang bukan buah?","items":["🍎","🍇","🥕","🍌","🍓","🍉"],"answer":"🥕"}'),
 ('Detektif Ganjil','Bukan Genap','Ingat bilangan genap!','ganjil',40,'{"q":"Mana yang bukan bilangan genap?","items":["2","4","6","7","8","10"],"answer":"7"}'),
 ('Arena Angka','Satu Dua Tiga','Ketuk angka dari kecil ke besar.','angka',15,'{"values":[3,1,2],"desc":false}'),
 ('Arena Angka','Kecil ke Besar','Enam angka, urut ya!','angka',20,'{"values":[4,9,2,7,5,1],"desc":false}'),
 ('Arena Angka','Besar ke Kecil','Sekarang dari yang terbesar.','angka',30,'{"values":[8,3,10,6,1,5,9],"desc":true}'),
 ('Arena Angka','Angka Puluhan','Delapan bilangan puluhan.','angka',40,'{"values":[30,10,50,20,80,60,70,40],"desc":false}'),
 ('Studio Piksel','Kotak Diagonal','Tiru gambar contoh.','piksel',25,'{"n":2,"cells":[0,3]}'),
 ('Studio Piksel','Huruf T','Nyalakan kotak seperti huruf T.','piksel',30,'{"n":3,"cells":[0,1,2,4,7]}'),
 ('Studio Piksel','Wajah Senyum','Gambar piksel yang lebih besar.','piksel',45,'{"n":5,"cells":[6,8,15,19,21,22,23]}'),
 ('Studio Piksel','Hati Kecil','Gambar piksel paling rumit.','piksel',55,'{"n":5,"cells":[1,3,5,6,7,8,9,10,11,12,13,14,16,17,18,22]}'),
 ('Pemburu Bug','Cuci Tangan Salah','Cari langkah yang salah.','debug',35,'{"q":"Ada satu langkah yang salah urutannya. Ketuk langkah itu!","steps":["Basahi tangan 💦","Sabuni tangan 🧼","Keringkan dulu sebelum bilas","Bilas dengan air 🚿"],"bug":2}'),
 ('Pemburu Bug','Robot ke Kanan','Debug perintah robot.','debug',40,'{"q":"Robot harus maju 3 langkah ke kanan. Perintah mana yang salah?","steps":["➡️ kanan","➡️ kanan","⬅️ kiri","➡️ kanan"],"bug":2}'),
 ('Pemburu Bug','Perulangan Salah','Bug di dalam perulangan.','debug',45,'{"q":"Robot hanya boleh bertepuk 3 kali. Perintah mana yang salah?","steps":["🔁 Ulangi 3 kali:","👏 tepuk","🦘 lompat","🏁 selesai"],"bug":2}'),
 ('Pemburu Bug','Hitungan Salah','Periksa hitungannya satu per satu.','debug',55,'{"q":"Menghitung 2 + 3 + 4. Langkah mana yang salah?","steps":["Mulai dari 0","Tambah 2, hasilnya 2","Tambah 3, hasilnya 6","Tambah 4, hasilnya 10"],"bug":2}'),
 ('Kota Jika-Maka','Kotak Ajaib','Belajar variabel.','quiz',55,'{"q":"Kotak A berisi 5 permen. Lalu ditambah 2 permen. Berapa isi kotak A sekarang?","show":"📦A = 5 → +2","options":["5","7","10"],"answer":"7"}'),
 ('Kota Jika-Maka','Sandi Rahasia','Pecahkan kode rahasia.','quiz',60,'{"q":"Kode: 🔴 = 1, 🔵 = 2, 🟢 = 3. Berapa jumlah kode dari 🔴🔵🟢?","show":"🔴🔵🟢","options":["5","6","7"],"answer":"6"}')
) AS v(cat,t,d,k,x,c) JOIN categories c ON c.name=v.cat;
