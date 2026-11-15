-- Urutan kategori = urutan di roadmap (makin besar makin sulit)
INSERT INTO categories(name,emoji,sort) VALUES
 ('Lembah Pola','🔢',2),('Pulau Labirin','🏝️',4),('Galaksi Coder','🚀',5)
ON CONFLICT (name) DO NOTHING;
UPDATE categories SET sort=1 WHERE name='Hutan Logika';
UPDATE categories SET sort=3 WHERE name='Gunung Algoritma';

INSERT INTO lessons(title,description,kind,category_id,xp_reward,content)
SELECT v.t,v.d,v.k,c.id,v.x,v.c::jsonb FROM (VALUES
 ('Lembah Pola','Pola Bentuk','Tebak bentuk berikutnya.','pattern',25,'{"seq":["🔺","🔵","🔺","🔵","🔺"],"options":["🔵","🔺","🟩"],"answer":"🔵"}'),
 ('Lembah Pola','Tiga Sahabat','Ada tiga warna yang berputar.','pattern',25,'{"seq":["🔴","🟡","🔵","🔴","🟡"],"options":["🔴","🟡","🔵"],"answer":"🔵"}'),
 ('Lembah Pola','Dua Dua Satu','Perhatikan berapa kali tiap hewan muncul.','pattern',30,'{"seq":["🐱","🐱","🐶","🐱","🐱","🐶","🐱"],"options":["🐱","🐶","🐰"],"answer":"🐱"}'),
 ('Lembah Pola','Pola Cermin','Polanya seperti bayangan di cermin.','pattern',30,'{"seq":["🍎","🍌","🍇","🍇","🍌"],"options":["🍎","🍌","🍇"],"answer":"🍎"}'),
 ('Pulau Labirin','Pulau Duri','Robot harus menghindari semak berduri.','maze',40,'{"n":6,"start":[0,5],"goal":[5,0],"walls":[[1,5],[1,3],[1,2],[3,1],[3,2],[3,3],[3,4],[5,1],[5,2],[2,0]]}'),
 ('Pulau Labirin','Jembatan Kayu','Cari jembatan yang tepat.','maze',40,'{"n":6,"start":[0,0],"goal":[5,5],"walls":[[1,0],[1,1],[1,2],[1,3],[3,2],[3,3],[3,4],[3,5]]}'),
 ('Pulau Labirin','Lorong Berliku','Lorong ular yang panjang. Hitung langkahnya!','maze',50,'{"n":6,"start":[0,0],"goal":[5,5],"walls":[[0,1],[1,1],[2,1],[3,1],[4,1],[1,3],[2,3],[3,3],[4,3],[5,3]]}'),
 ('Pulau Labirin','Gerbang Rahasia','Ikuti jalan spiral menuju pusat.','maze',50,'{"n":6,"start":[0,0],"goal":[3,3],"walls":[[0,1],[1,1],[2,1],[3,1],[4,1],[4,2],[4,3],[4,4],[1,4],[2,4],[3,4],[1,3]]}'),
 ('Galaksi Coder','Kode Bintang','Bintang dan bulan bertambah satu demi satu.','pattern',55,'{"seq":["⭐","🌙","⭐","⭐","🌙","🌙","⭐","⭐","⭐"],"options":["🌙","⭐","🪐"],"answer":"🌙"}'),
 ('Galaksi Coder','Orbit Planet','Terbangkan robot melewati planet.','maze',60,'{"n":7,"start":[0,3],"goal":[6,3],"walls":[[2,1],[2,2],[2,3],[2,4],[2,5],[4,0],[4,1],[4,2],[4,4],[4,5],[4,6]]}'),
 ('Galaksi Coder','Sinyal Satelit','Pola panjang dengan dua pengulangan.','pattern',65,'{"seq":["🔴","🔵","🔴","🔵","🟢","🔴","🔵","🔴","🔵","🟢","🔴","🔵"],"options":["🔴","🔵","🟢"],"answer":"🔴"}'),
 ('Galaksi Coder','Misi Roket','Misi terakhir! Susun 28 perintah dengan teliti.','maze',70,'{"n":8,"start":[0,7],"goal":[7,0],"walls":[[0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[3,3],[4,7]]}')
) AS v(cat,t,d,k,x,c) JOIN categories c ON c.name=v.cat;
