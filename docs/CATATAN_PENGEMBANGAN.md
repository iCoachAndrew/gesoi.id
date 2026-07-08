# Catatan Pengembangan Website GESOI

## Riwayat Iterasi
| Iterasi | Fitur | Status Uji |
|---|---|---|
| 1 | MVP landing dwibahasa + form pendaftaran + desain hijau elegan | ✅ 100% |
| 2 | Admin auth (JWT) + dasbor pendaftar + konten dokumen yayasan + menu mobile + responsif | ✅ 100% (2 bug diperbaiki) |
| 3 | Rebrand navy+emas sesuai acuan desain + logo asli + Export CSV | ✅ Terverifikasi |
| 4 | CMS Editor seluruh section + upload foto + redesign Kepemimpinan (GBHI) & Paradigma + link Portal Admin + SEO/OG | ✅ 100% (24/24 backend) |
| 5 | News mozaik + Publikasi berbayar (prototipe) + Video autoplay + Cookie/Privacy | ✅ 100% frontend |
| 6 | Pengelolaan pembeli publikasi + layout Orbit interaktif Narasi Besar + dokumen laporan | (iterasi ini) |

## Keputusan Teknis Penting
1. **CMS deep-merge**: konten tersimpan utuh di MongoDB; landing merge di atas default `i18n.js` — field baru di rilis mendatang otomatis muncul tanpa migrasi.
2. **Editor rekursif memakai `createElement`** (bukan JSX) untuk referensi komponen rekursif — plugin babel visual-edits crash (stack overflow) pada JSX rekursif. JANGAN diubah kembali ke JSX.
3. **Kunci brute-force per email** (bukan per IP) — IP di balik ingress tidak stabil.
4. **Video H.264/MP4**: browser uji headless tidak punya codec H.264 sehingga autoplay tidak bisa diverifikasi otomatis; di browser pengguna nyata berfungsi. Gunakan URL `.mp4` langsung (bukan YouTube).
5. **Pembayaran publikasi = prototipe yang disengaja**: pesanan tercatat ke database dengan status, tanpa gateway. Integrasi Stripe/Midtrans tinggal mengganti handler submit di `Publications.js` + endpoint baru.
6. **Foto tokoh default = avatar inisial** — tidak memakai foto stok untuk tokoh publik bernama; foto asli diunggah admin.
7. **Informasi sensitif dokumen yayasan** (nominal kekayaan awal, akta/notaris, revenue sharing, alamat pribadi) sengaja tidak dipublikasikan.

## Hal yang Menunggu Input Yayasan
- URL/file video resmi GESOI (ganti via Editor → 08 — Video → URL Video)
- Foto asli 17 tokoh (Editor → Gambar & Tokoh (Global))
- Resend API key untuk notifikasi email otomatis
- Konten kabar/berita nyata menjelang Grand Launching

## Cara Operasional Admin
1. Buka `/admin/login` (atau klik "Portal Admin" di footer).
2. Tab **Data Pendaftar**: pantau & ekspor pendaftar.
3. Tab **Pembelian Publikasi**: tindak lanjuti pesanan (ubah status), ekspor CSV.
4. Tab **Editor Website**: pilih section di sisi kiri → ubah teks/ikon/gambar → **Simpan Perubahan**. Toggle Indonesia/English untuk konten per bahasa. Tombol **Reset** mengembalikan seluruh konten ke bawaan.

## Pengujian
Laporan otomatis: `/app/test_reports/iteration_1..5.json`; suite backend: `/app/backend/tests/`.
