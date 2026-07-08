# Ikhtisar Arsitektur Website GESOI

## Ringkasan
Website landing page bilingual (ID/EN) untuk Yayasan Gerakan Otak Sehat Indonesia (GESOI) dengan CMS admin penuh, formulir pendaftaran relawan/mitra, pemesanan publikasi ilmiah (prototipe), dan pengelolaan konten mandiri.

## Tumpukan Teknologi
| Lapisan | Teknologi |
|---|---|
| Frontend | React 19, Tailwind CSS, framer-motion (animasi), Lenis (smooth scroll), react-fast-marquee, shadcn/ui, sonner (toast), lucide-react (ikon) |
| Backend | FastAPI (Python), Motor (MongoDB async), bcrypt + PyJWT (autentikasi), Emergent Object Storage (upload foto) |
| Database | MongoDB |
| Infrastruktur | Kubernetes container, supervisor (backend :8001, frontend :3000), ingress rute `/api` → backend |

## Struktur Direktori
```
/app
├── backend/
│   ├── server.py            # Seluruh API (auth, kontak, pesanan, konten, upload)
│   └── .env                 # MONGO_URL, JWT_SECRET, ADMIN_EMAIL/PASSWORD, EMERGENT_LLM_KEY
├── frontend/src/
│   ├── i18n.js              # Konten default dwibahasa + sharedDefaults (gambar, tokoh)
│   ├── App.js               # Routing + Landing (fetch /api/content, deep-merge)
│   ├── lib/
│   │   ├── merge.js         # deepMerge overrides CMS di atas default
│   │   ├── icons.js         # Peta ikon lucide (dipilih via editor)
│   │   └── editorFields.js  # Editor field rekursif (teks/ikon/gambar/array)
│   ├── components/gesoi/    # Navbar, Hero, MarqueeStrip, Problem, Ecosystem,
│   │                        # Pillars, Programs, Roadmap, Governance, News,
│   │                        # VideoFeature, Publications, JoinCTA, CookieConsent, Footer
│   └── pages/
│       ├── AdminLogin.js    # Login admin (JWT)
│       ├── AdminDashboard.js# Tab: Data Pendaftar | Pembelian Publikasi | Editor Website
│       ├── AdminOrders.js   # Kelola pesanan publikasi (status + CSV)
│       └── AdminEditor.js   # CMS seluruh section
└── docs/                    # Dokumen ini
```

## API Endpoint
| Metode | Rute | Akses | Fungsi |
|---|---|---|---|
| POST | /api/contact | Publik | Simpan pendaftar (relawan/mitra/donatur/founding) |
| GET | /api/contact | Admin | Daftar pendaftar |
| POST | /api/orders | Publik | Simpan pesanan publikasi (prototipe) |
| GET | /api/admin/orders | Admin | Daftar pesanan |
| PATCH | /api/admin/orders/{id} | Admin | Ubah status (pending/contacted/completed) |
| POST | /api/auth/login | Publik | Login admin → JWT (cookie httpOnly + Bearer) |
| GET | /api/auth/me | Admin | Verifikasi sesi |
| POST | /api/auth/logout | Publik | Hapus cookie |
| GET | /api/content | Publik | Konten CMS (override) |
| PUT | /api/admin/content | Admin | Simpan konten CMS |
| DELETE | /api/admin/content | Admin | Reset konten ke bawaan |
| POST | /api/admin/upload | Admin | Unggah foto → object storage |
| GET | /api/files/{path} | Publik | Sajikan file (cache 24 jam) |

## Alur Konten (CMS)
1. Default konten dwibahasa ada di `i18n.js` (+ `sharedDefaults` untuk gambar & tokoh).
2. Admin mengedit di Editor Website → disimpan utuh ke koleksi `site_content` MongoDB.
3. Landing page mengambil `/api/content` lalu **deep-merge** di atas default — bagian yang tidak diedit tetap memakai bawaan.
4. Reset menghapus dokumen → landing kembali ke bawaan.

## Keamanan
- JWT 24 jam (cookie httpOnly + fallback Bearer), password bcrypt.
- Proteksi brute-force: 5 kali gagal → kunci 15 menit (per email).
- Upload dibatasi gambar (jpg/png/gif/webp) maks 8MB, hanya admin.
- Data sensitif yayasan (nominal kekayaan, notaris, revenue sharing) TIDAK dipublikasikan.

## Koleksi MongoDB
`contacts` (pendaftar), `orders` (pesanan publikasi), `users` (admin), `login_attempts`, `site_content` (CMS), `files` (metadata upload).
