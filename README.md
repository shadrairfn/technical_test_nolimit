# Nolimit Intern Backend API

Express.js backend application configured with modern ES Modules, Sequelize ORM (MySQL & SQLite), JWT Authentication, and a robust testing suite using Vitest + Supertest.

---

## 🚀 Fitur Utama

- **Modern JavaScript**: Menggunakan ES Modules (`import`/`export`) secara asli.
- **Sequelize ORM**: Integrasi database menggunakan Sequelize dengan dukungan multi-dialect:
  - **MySQL** untuk lingkungan development dan production.
  - **SQLite In-Memory** untuk lingkungan testing secara terisolasi dan cepat.
- **Autentikasi JWT**: Sistem autentikasi aman menggunakan *Access Token* dan *Refresh Token*.
- **Manajemen Postingan (CRUD)**: Endpoint postingan yang terproteksi oleh middleware autentikasi JWT.
- **Error Handling Terpusat**: Middleware error global yang memproses error menggunakan kelas kustom `apiError`.
- **Testing Suite Lengkap**: 15 test cases integration & unit testing menggunakan **Vitest** dan **Supertest** dengan tingkat kelulusan 100%.
- **Robust Database Pool**: Pengaturan pooling database yang dioptimalkan dengan mekanisme pengusiran koneksi mati (`evict`) untuk mencegah error `read ECONNRESET`.

---

## 🛠️ Prasyarat Sistem

Sebelum menjalankan proyek ini, pastikan Anda telah memasang:
- [Node.js](https://nodejs.org/) (Sangat direkomendasikan versi **v18.x** atau lebih tinggi, proyek ini dikembangkan & dites pada **v22.14.0**)
- [MySQL Server](https://www.mysql.com/) (Dijalankan secara lokal melalui Laragon, XAMPP, Docker, atau instalasi native)

---

## ⚙️ Instalasi & Setup

1. **Instal dependensi proyek**:
   ```bash
   npm install
   ```

2. **Konfigurasi Environment Variables**:
   Salin file `.env.example` menjadi `.env` di direktori root proyek Anda:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` yang baru dibuat dan sesuaikan dengan konfigurasi MySQL lokal Anda:
   ```env
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=nolimit_intern

   # JWT Configuration
   ACCESS_TOKEN_SECRET=ganti_dengan_token_rahasia_anda_disini
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_SECRET=ganti_dengan_refresh_token_rahasia_anda_disini
   REFRESH_TOKEN_EXPIRY=7d
   ```

3. **Pastikan Database MySQL Aktif**:
   Buat database baru bernama `nolimit_intern` di server MySQL Anda sebelum menjalankan aplikasi.

---

## 🏃 Menjalankan Aplikasi

- **Mode Pengembangan (Development Mode)**:
  Menjalankan server menggunakan `nodemon` yang akan merestart otomatis setiap kali ada perubahan kode.
  ```bash
  npm run dev
  ```

- **Mode Produksi (Production Mode)**:
  Menjalankan server utama langsung melalui Node.js.
  ```bash
  npm start
  ```

---

## 🧪 Menjalankan Pengujian (Testing)

Proyek ini telah dikonfigurasi dengan Vitest untuk pengujian terisolasi berkinerja tinggi. Saat pengujian dijalankan, Sequelize secara otomatis akan mengabaikan database MySQL Anda dan menggunakan database **SQLite In-Memory** yang otomatis dibuat di dalam memori RAM dan dihapus saat tes selesai.

- **Menjalankan Tes Sekali Run**:
  ```bash
  npm run test
  ```

- **Menjalankan Tes dalam Watch Mode (Sangat cocok untuk TDD)**:
  ```bash
  npm run test:watch
  ```

---

## 📂 Struktur Proyek

```text
Nolimit_Intern/
├── src/
│   ├── config/
│   │   └── database.js      # Konfigurasi Sequelize & Pool untuk MySQL/SQLite
│   ├── controllers/
│   │   ├── postController.js # Logika bisnis CRUD postingan
│   │   └── userController.js # Logika registrasi dan login user
│   ├── middlewares/
│   │   └── authMiddleware.js # Middleware verifikasi JWT untuk rute terproteksi
│   ├── models/
│   │   ├── postModels.js    # Definisi model Post & relasi database
│   │   └── userModels.js    # Definisi model User & relasi database
│   ├── routes/
│   │   ├── postRoute.js     # Jalur rute /api/v1/post
│   │   └── userRoute.js     # Jalur rute /api/v1/user
│   ├── utils/
│   │   ├── apiError.js      # Kelas kustom apiError penanganan kesalahan
│   │   ├── asyncHandler.js  # Helper wrapper penanganan promise asinkronus
│   │   └── generateToken.js # Utilitas pembuat Access & Refresh Token JWT
│   ├── app.js               # Konfigurasi Express & Middleware (Tanpa Listener)
│   └── index.js             # Entrypoint utama untuk mengkoneksikan DB & memulai server
├── tests/
│   ├── app.test.js          # Tes fungsionalitas server & health check
│   ├── user.test.js         # Tes integrasi pendaftaran & login user
│   └── post.test.js         # Tes integrasi operasi CRUD postingan
├── .env.example             # Contoh template environment variables
├── package.json             # Dependensi, metadata, dan skrip proyek
└── README.md                # Dokumentasi proyek
```

---

## 📡 API Endpoints Dokumentasi

### 1. Autentikasi Pengguna (User Routes)

| Method | Endpoint | Auth | Deskripsi | Request Body |
| :--- | :--- | :---: | :--- | :--- |
| **POST** | `/api/v1/user/register` | ❌ | Pendaftaran akun baru | `{ "username", "email", "password" }` |
| **POST** | `/api/v1/user/login` | ❌ | Masuk ke sistem | `{ "email", "password" }` |

### 2. Postingan (Post Routes)

Semua rute di bawah membutuhkan Header: `Authorization: Bearer <access_token>`.

| Method | Endpoint | Auth | Deskripsi | Request Body / Params |
| :--- | :--- | :---: | :--- | :--- |
| **POST** | `/api/v1/post/create` | 🔑 | Membuat postingan baru | `{ "content" }` |
| **GET** | `/api/v1/post/` | 🔑 | Mengambil semua postingan Anda | None |
| **PATCH** | `/api/v1/post/:id` | 🔑 | Memperbarui isi postingan | `{ "content" }` (Params: `id` post) |
| **DELETE** | `/api/v1/post/:id` | 🔑 | Menghapus postingan | Params: `id` post |

---

## 🛟 Keandalan Koneksi Database (Database Pool Optimization)

Aplikasi ini menggunakan konfigurasi pool Sequelize yang telah dikustomisasi untuk mencegah error umum `read ECONNRESET` pada MySQL lokal:
- **`connectTimeout`**: Memberikan batas toleransi koneksi awal hingga 60 detik.
- **`idle: 10000`**: Melepaskan koneksi yang tidak terpakai setelah 10 detik.
- **`evict: 1000`**: Thread berkala yang secara aktif memindai dan membersihkan koneksi yang terputus sepihak oleh database setiap 1 detik.
