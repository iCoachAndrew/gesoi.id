# Panduan Hosting Website & Database GESOI di Hostinger Web Hosting (Non-VPS)

Seluruh perubahan kode sumber telah disiapkan agar **database (MySQL/MariaDB)** dan **website (React + PHP 8.x API + Galeri Media Lokal)** berjalan 100% di dalam **Hostinger Web Hosting biasa (Single / Premium / Business / Cloud Hosting hPanel)** tanpa memerlukan VPS.

---

## Ringkasan File yang Telah Disiapkan

1. **`hostinger/public_html_gesoi.zip`** (serta folder `frontend/build/`):
   Paket siap unggah ke `public_html/` di Hostinger File Manager, berisi:
   - Build statis React produksi (`index.html`, `static/`, gambar lokal `logo.png`, `og-image.png`, `hero-bg-light.webp`).
   - `.htaccess` (routing `/api/*` ke PHP, penerusan header `Authorization`, dan fallback React Router `/admin`, `/berita/...`).
   - `.user.ini` (batas upload PHP hingga 64MB untuk video & foto).
   - `api/index.php` (seluruh 19 endpoint API pengganti FastAPI Python, memakai PDO MySQL + penyimpanan lokal).
   - `api/config.php` & `api/.htaccess` (konfigurasi database & admin yang dilindungi dari akses publik).
   - `api/uploads/.htaccess` (folder penyimpanan foto/video CMS yang dikunci dari eksekusi skrip).
2. **`hostinger/schema.sql`**:
   Skema 7 tabel MySQL (`users`, `login_attempts`, `contacts`, `orders`, `site_content`, `files`, `analytics`).
3. **`hostinger/migrate_mongo_to_mysql.py`**:
   Skrip Python opsional untuk mengekspor data dari MongoDB lama menjadi file SQL (`hostinger/gesoi_data_dump.sql`).

---

## Langkah Deploy di hPanel Hostinger (5 Menit)

### Langkah 1: Buat Database MySQL di hPanel
1. Masuk ke **hPanel Hostinger** -> buka menu **Websites** (**Website**) -> klik **Manage** / **Dashboard** (**Kelola**) di sebelah domain Anda *(jika domain/website belum dibuat di hosting, klik **Add Website** terlebih dahulu)*.
2. Di sidebar dashboard website tersebut, buka menu **Databases** (**Database**) -> **Management** (**Pengelolaan**) / **MySQL Databases**.
3. Buat database baru:
   - **MySQL Database Name**: mis. `u123456789_gesoi`
   - **MySQL Username**: mis. `u123456789_gesoi`
   - **Password**: buat password kuat dan catat.
4. Di daftar database yang muncul di bagian bawah (**List of Current MySQL Databases and Users**), klik **Enter phpMyAdmin** (**Masuk phpMyAdmin**) di sebelah database tersebut, buka tab **Import**, lalu pilih dan impor file **`hostinger/schema.sql`** (opsional: tabel juga otomatis dibuat saat login pertama jika belum diimpor).
5. Jika Anda memiliki dump data dari MongoDB (`hostinger/gesoi_data_dump.sql`), impor juga file tersebut setelah `schema.sql`.

### Langkah 2: Unggah Website ke `public_html`
1. Masih dari dashboard website (**Websites -> Manage / Kelola**), buka menu **Files** (**File**) -> **File Manager**.
2. Masuk ke folder **`public_html`** (hapus file `default.php` bawaan Hostinger jika ada).
3. Unggah file **`hostinger/public_html_gesoi.zip`** ke dalam `public_html`, lalu klik kanan -> **Extract** langsung di dalam `public_html` (pastikan `index.html`, `.htaccess`, dan folder `api/` berada langsung di dalam `public_html/`).

### Langkah 3: Isi Kredensial Database & Admin
1. Di File Manager Hostinger, buka folder `public_html/api/`:
   - Jika memakai `public_html_gesoi.zip`, buka **`public_html/api/config.php`**.
   - Jika deploy otomatis lewat GitHub Actions FTP, salin **`public_html/api/config.example.php`** menjadi **`public_html/api/config.php`** (karena `config.php` tidak pernah di-commit ke GitHub demi keamanan).
2. Sesuaikan bagian berikut dengan database MySQL yang Anda buat pada Langkah 1:
   ```php
   return [
       'DB_HOST'        => 'localhost',
       'DB_NAME'        => 'u123456789_gesoi',       // Nama DB MySQL Anda di hPanel
       'DB_USER'        => 'u123456789_gesoi',       // Username MySQL Anda di hPanel
       'DB_PASS'        => 'PASSWORD_MYSQL_ANDA',    // Password MySQL Anda di hPanel

       'JWT_SECRET'     => 'ganti-dengan-teks-acak-panjang-minimal-32-karakter',
       'ADMIN_EMAIL'    => 'admin@gesoi.or.id',      // Email login Dasbor Admin
       'ADMIN_PASSWORD' => 'PasswordAdminKuat123!',  // Password login Dasbor Admin

       'CORS_ORIGINS'   => '*',
   ];
   ```
   *(Tips keamanan ekstra: Anda juga dapat memindahkan `config.php` ke satu folder di atas `public_html` dengan nama `gesoi_config.php`, yaitu `/domains/domainanda.com/gesoi_config.php`, karena `api/index.php` otomatis membacanya lebih dulu).*

### Langkah 4: Pastikan PHP 8.1+ & SSL Aktif
1. Dari dashboard website (**Websites -> Manage / Kelola**), buka **Advanced** (**Tingkat Lanjut**) -> **PHP Configuration** (**Konfigurasi PHP**): pastikan versi PHP adalah **PHP 8.1 / 8.2 / 8.3** dan ekstensi `pdo_mysql` aktif (aktif secara bawaan di Hostinger).
2. Pada tab **PHP Options**, pastikan `upload_max_filesize` dan `post_max_size` minimal **64M** (agar fitur upload video hingga 60MB di CMS berjalan lancar).
3. Pastikan **SSL (HTTPS)** aktif untuk domain Anda di hPanel.

### Langkah 5: Verifikasi Website
1. Buka `https://domainanda.com/api/` -> pastikan muncul `{"message":"GESOI API"}`.
2. Buka `https://domainanda.com/` -> landing page tampil lengkap.
3. Buka `https://domainanda.com/admin/login` -> masuk dengan `ADMIN_EMAIL` dan `ADMIN_PASSWORD` yang Anda isi di `api/config.php` (akun admin otomatis dibuat di tabel `users` saat login pertama).

---

## Cara Build Ulang Jika Anda Mengubah Kode React di Masa Depan

Jika suatu saat Anda mengubah komponen di `frontend/src/`:
1. Jalankan di terminal folder `frontend/`:
   ```bash
   npm install --legacy-peer-deps
   npm run build
   ```
2. Seluruh isi `frontend/public/` (termasuk `.htaccess` dan `api/`) otomatis ikut tersalin ke `frontend/build/`.
3. Unggah isi `frontend/build/` ke `public_html/` (jangan menimpa `public_html/api/config.php` dan `public_html/api/uploads/` yang sudah ada di server).
