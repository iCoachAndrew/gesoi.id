# PRD — Website GESOI (Gerakan Otak Sehat Indonesia)

## Latar Belakang
GESOI adalah yayasan gerakan nasional kesehatan otak, memposisikan "Brain Energy" (Brain Capital) sebagai fondasi menuju Indonesia Emas 2045. Website berfungsi sebagai wajah publik gerakan: edukasi, rekrutmen relawan/mitra, publikasi, dan kanal menuju Grand Launching 17 Agustus 2026.

Benchmark: Global Brain Health Institute (elegan), American Brain Coalition (gerakan nasional), American Brain Foundation (brain health), One Mind (program & inovasi), Palm Health Foundation (komunitas & dampak).

## Persona Pengguna
1. **Publik umum** — memahami urgensi kesehatan otak, membaca kabar & menonton video.
2. **Calon relawan/mitra/donatur** — mendaftar via formulir "Jadilah Arsitek Brain Energy".
3. **Akademisi/profesional** — membeli publikasi ilmiah (White Book, laporan riset).
4. **Admin yayasan** — mengelola konten website, data pendaftar, dan pesanan publikasi.

## Fitur (Sudah Diimplementasikan)
### Landing Page Publik
- Hero kinetik dwibahasa (ID/EN) dengan blueprint peta Indonesia, badge Grand Launching
- Marquee editorial, statistik urgensi, paradigma lama→baru (layout editorial)
- Narasi Besar ekosistem PERDOSNI→GESOI→otaQku→ICC (layout Orbit interaktif / Grid, dipilih admin)
- 4 Pilar Misi bernomor, 6 Program unggulan, Roadmap 3-7-10 tahun
- Kepemimpinan gaya GBHI (17 tokoh, foto via CMS), Konsil Penasehat Kehormatan
- Kabar/News mozaik 4 kartu, Video autoplay saat masuk layar + panel kutipan
- Publikasi Ilmiah berbayar (PROTOTIPE — tanpa payment gateway) dengan form pemesan
- Form pendaftaran (relawan/mitra/donatur/founding circle) → database
- Pop-up cookie + Kebijakan Privasi (teks dapat diedit admin)
- SEO meta + OG image untuk share WhatsApp/medsos

### Dasbor Admin (/admin — via link "Portal Admin" di footer)
- Login aman (JWT + anti brute-force)
- **Data Pendaftar**: statistik, filter minat, tabel, Export CSV
- **Pembelian Publikasi**: statistik status, ubah status (Baru/Dihubungi/Selesai), Export CSV
- **Editor Website**: SEMUA section dapat diedit (teks ID/EN, ikon, gambar/foto via upload, pilihan tata letak), Simpan & Reset

## Belum Dikerjakan (Backlog Prioritas)
- **P1**: Notifikasi email pendaftar/pesanan baru via Resend (menunggu API key; tujuan: gesoigerakansehatotaknasional@gmail.com)
- **P1**: Video resmi GESOI (menunggu URL/file dari yayasan)
- **P1**: Foto asli para tokoh (unggah via Editor)
- **P2**: Payment gateway publikasi (Stripe/Midtrans) menggantikan prototipe
- **P2**: Halaman detail berita/publikasi, arsip kabar
- **P2**: Countdown Grand Launching di hero
- **P2**: Analitik pengunjung

## Kredensial & Akses
- Admin: lihat `/app/memory/test_credentials.md` (ganti password via `backend/.env` → ADMIN_PASSWORD)
- Konten default: `frontend/src/i18n.js`; seluruh perubahan via Editor Website
