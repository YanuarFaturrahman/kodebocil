# KodeBocil 🤖 - Belajar Coding untuk Anak 5-10 Tahun
Rust (Axum + SQLx) • React (Vite) • PostgreSQL

## Menjalankan
1. `docker compose up -d`   (PostgreSQL)
2. Backend: `cd backend && cargo run`  (http://localhost:8080, migrasi + data awal otomatis; pengaturan di backend/.env, PostgreSQL di port 5433)
3. Frontend: `cd frontend && npm install && npm run dev`  (http://localhost:5173)

Admin awal: `admin` / `admin123` (ubah di backend/.env).
Orangtua daftar sendiri di halaman Daftar, lalu menambahkan akun anak (username + PIN) di menu "Anak".

## Peran
- Anak: main level, XP, level, lencana, peringkat
- Orangtua: buat akun anak, pantau progres dan XP
- Admin: statistik, CRUD game (form pola/labirin) dan CRUD kategori game

## Game
Menu **Main** menampilkan daftar Dunia (kategori). Tiap dunia berisi level berurutan (level terkunci sampai level sebelumnya selesai).
14 dunia, 56 game, 11 jenis soal: labirin robot, tebak pola, kartu memori, susun urutan, jika-maka/kuis, lampu ajaib,
pasangkan, cari yang beda, cari bug, ketuk angka urut, gambar piksel. Admin bisa menambah/mengubah semuanya di panel Admin.
