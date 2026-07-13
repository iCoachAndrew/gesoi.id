# Panduan Penggunaan Dasbor Admin GESOI

Dokumen ini menjelaskan cara menggunakan setiap fungsi di halaman admin website GESOI, langkah demi langkah.

Alamat halaman admin: `https://<domain-website>/admin/login`
(Tautan "Portal Admin" juga tersedia di bagian paling bawah footer website.)

---

## 1. Masuk (Login)

1. Buka halaman `/admin/login`.
2. Masukkan email dan kata sandi admin, lalu tekan tombol masuk.
3. Setelah berhasil, Anda diarahkan ke dasbor admin dengan 5 tab: **Data Pendaftar**, **Pembelian Publikasi**, **Analitik**, **Editor Website**, dan **Galeri Media**.

Catatan keamanan:
- Salah kata sandi 5 kali berturut-turut akan mengunci login sementara (perlindungan brute force).
- Tombol **Keluar** ada di pojok kanan atas.
- Sesi menggunakan token aman (JWT); jika kedaluwarsa, cukup login ulang.

---

## 2. Tab: Data Pendaftar

Menampilkan semua orang yang mengisi formulir "Bergabung" di landing page.

Fungsi yang tersedia:
- **Kartu statistik**: jumlah total pendaftar dan rincian per kategori minat (Relawan, Mitra/Kolaborator, Donatur, Founding Circle).
- **Filter**: klik tombol kategori (Semua / Relawan / Mitra / Donatur / Founding Circle) untuk menyaring tabel.
- **Tabel pendaftar**: nama, email, organisasi, minat, pesan, dan tanggal mendaftar.
- **Export CSV**: klik tombol "Export CSV" untuk mengunduh seluruh data pendaftar dalam format yang bisa dibuka di Excel/Google Sheets.

Tips: gunakan Export CSV secara berkala sebagai cadangan data.

---

## 3. Tab: Pembelian Publikasi

Menampilkan semua orang yang menekan "Beli Akses" pada publikasi ilmiah dan mengisi formulir pemesanan.

Fungsi yang tersedia:
- **Kartu statistik**: total pesanan dan jumlah per status.
- **Tabel pesanan**: nama, email, telepon, judul publikasi, harga, tanggal.
- **Ubah status pesanan**: pada setiap baris ada menu status yang bisa diganti:
  - `Baru` (pesanan masuk, belum ditindaklanjuti)
  - `Dihubungi` (tim sudah menghubungi pembeli)
  - `Selesai` (pembayaran dan akses sudah dituntaskan)
- **Export CSV**: unduh seluruh data pesanan.

Penting: fitur publikasi masih berupa prototipe. Pembayaran belum terhubung ke payment gateway, jadi tim perlu menghubungi pembeli secara manual (email/WhatsApp) untuk menyelesaikan pembayaran.

---

## 4. Tab: Analitik

Statistik pengunjung website. Data disimpan di database sendiri, anonim, dan hanya terekam dari pengunjung yang menekan "Terima" pada banner cookie.

Fungsi yang tersedia:
- **Pilih rentang waktu**: 7 Hari / 30 Hari / 90 Hari.
- **5 kartu statistik**:
  - Total Kunjungan: berapa kali halaman dibuka.
  - Pengunjung Unik: berapa banyak orang berbeda (per perangkat).
  - Klik Bergabung: berapa kali tombol "Bergabung" ditekan.
  - Form Terkirim: berapa formulir pendaftaran berhasil dikirim.
  - Klik Beli Akses: berapa kali tombol beli publikasi ditekan.
- **Grafik Tren Kunjungan Harian**: garis biru tua = kunjungan, garis emas = pengunjung unik.
- **Panel Perangkat**: perbandingan pengunjung Desktop vs Mobile.
- **Panel Bahasa Pengunjung**: perbandingan pemakaian bahasa Indonesia vs English.
- **Panel Sumber Kunjungan**: dari mana pengunjung datang (langsung/tautan, Instagram, Google, dsb.).

Cara membaca: jika "Klik Bergabung" tinggi tetapi "Form Terkirim" rendah, artinya banyak orang tertarik tetapi tidak menyelesaikan formulir; pertimbangkan menyederhanakan formulir atau memperkuat ajakan.

---

## 5. Tab: Editor Website (CMS)

Tempat mengubah SEMUA isi landing page tanpa menyentuh kode: teks, gambar, ikon, video, tata letak. Perubahan langsung tampil di website begitu disimpan.

### 5.1 Cara kerja umum
1. Pilih **bahasa konten** yang ingin diedit: ID atau EN (keduanya diedit terpisah).
2. Pilih **section** di menu kiri: Gambar & Tokoh (Global), Navigasi, Hero, Teks Berjalan, 01 Urgensi, 02 Ekosistem, 03 Pilar Misi, 04 Program, 05 Peta Jalan, 06 Kepemimpinan, 07 Kabar/News, 08 Video, 09 Publikasi Ilmiah, 10 Ajakan & Form.
3. Ubah isinya pada formulir di kanan.
4. Tekan **Simpan Perubahan**. Selesai; buka website untuk melihat hasilnya.

### 5.2 Jenis kolom yang akan Anda temui
- **Teks singkat**: judul, label tombol, dsb.
- **Teks panjang**: paragraf narasi.
- **Gambar/Foto**: bisa tempel URL gambar, ATAU klik unggah untuk memakai file dari komputer (tersedia pengatur skala/ukuran). Gambar yang pernah diunggah bisa dipakai ulang dari Galeri Media (salin URL-nya).
- **Ikon**: pilih dari daftar ikon, atau pilih "Ikon kustom (unggahan)" untuk memakai gambar ikon sendiri.
- **Tata Letak / Template**: menu pilihan tampilan section (lihat 5.3).
- **Daftar Item**: konten berulang (pilar, program, berita, orang, dsb.). Bisa tambah item baru, hapus item, dan mengubah setiap kolomnya.

### 5.3 Pilihan Tata Letak / Template per section
- **02 Ekosistem**: Orbit (interaktif, GESOI di tengah) atau Grid Kartu (klasik).
- **03 Pilar Misi**: Baris Editorial (teks/thumbnail kecil) atau Grid Kartu dengan Gambar.
- **04 Program**: Kartu Ikon (klasik) atau Kartu dengan Gambar (foto per program).
- **05 Peta Jalan**: Garis Waktu (teks) atau Garis Waktu dengan Foto.
Setiap item di section tersebut punya kolom gambar sendiri; gambar tampil sesuai template yang dipilih.

### 5.4 Mengelola Berita (07 Kabar/News)
Setiap item berita memiliki: Kategori, Judul, Tanggal, Gambar, Tautan, dan Isi Artikel.
- **Tautan kosong** = kartu berita membuka halaman detail internal (`/berita/...`) yang berisi artikel lengkap + tombol Bagikan ke WhatsApp.
- **Tautan diisi** (mis. link Instagram) = kartu membuka link eksternal tersebut.
- **Format Isi Artikel** (sederhana):
  - Baris kosong = paragraf baru.
  - `## Judul Bagian` = sub-judul.
  - `**teks**` = teks tebal.
  - URL gambar pada baris tersendiri = gambar tampil di tengah artikel.

### 5.5 Video (08)
Ganti URL video (mp4), poster, kutipan, nama narasumber, dan label tombol. Video otomatis diputar tanpa suara saat masuk layar; pengunjung bisa mengaktifkan suara.

### 5.6 Foto Tokoh (Gambar & Tokoh Global / 06 Kepemimpinan)
Setiap tokoh punya kolom nama, jabatan (ID & EN), dan foto. Jika foto kosong, kartu menampilkan inisial nama.

### 5.7 Tombol Reset
Tombol **Reset** mengembalikan SELURUH konten website ke bawaan awal dan menghapus semua perubahan CMS. Gunakan hanya jika benar-benar perlu.

---

## 6. Tab: Galeri Media

Pusat pengelolaan semua file (gambar & video) yang pernah diunggah.

Fungsi yang tersedia:
- **Unggah File**: klik tombol "Unggah File" untuk menambah gambar (JPG/PNG/GIF/WebP) atau video (MP4/WebM/MOV) langsung dari halaman ini.
- **Filter**: Semua / Gambar / Video.
- **Salin URL**: menyalin alamat file untuk ditempel di kolom gambar/video mana pun di Editor Website.
- **Hapus**: menghapus file dari penyimpanan. Hati-hati: jika file masih dipakai di website, gambarnya akan hilang dari halaman.

---

## 7. Hal Penting Lainnya

- **Preview vs Produksi**: perubahan lewat Editor Website di website produksi langsung aktif tanpa deploy ulang (tersimpan di database). Perubahan KODE (fitur baru dari pengembang) baru aktif di produksi setelah deploy ulang.
- **Kembali ke website**: tautan menuju landing page tersedia di halaman login admin.
- **Aturan konten**: jangan gunakan karakter em-dash (—) dalam teks apa pun; gunakan koma, titik dua, atau tanda hubung.
- **Formulir pendaftar terkunci**: pengunjung yang sudah mengisi formulir akan melihat pesan "Anda telah mendaftar pada (tanggal)" pada kunjungan berikutnya di perangkat yang sama; teks pesan ini bisa diubah di Editor Website bagian "10 Ajakan & Form".

---

Dokumen dibuat: Juli 2026. Simpan dokumen ini sebagai referensi tim pengelola website GESOI.
