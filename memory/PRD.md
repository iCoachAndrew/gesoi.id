# PRD — GESOI Landing Page

## Original Problem Statement
Build a landing page for a nonprofit entity (Yayasan Gerakan Otak Sehat Indonesia — GESOI), based on attached docs (GESOI Blueprint PDF + "Pemahaman GESOI" docx). Benchmarks: Global Brain Health Institute (elegance), American Brain Coalition (national movement), American Brain Foundation (brain health), One Mind (programs & innovation), Palm Health Foundation (community & social impact).

## User Choices
- Bilingual (ID/EN toggle), Indonesian default
- Functional backend for join/contact form (MongoDB)
- Sections as proposed (Hero, Urgency, Ecosystem, 4 Pillars, Programs, Roadmap, Governance, CTA, Footer)
- Visual: elegant green, delegated to designer

## Architecture
- Frontend: React 19 + Tailwind + framer-motion (scroll reveals, masked hero line reveal, parallax) + Lenis smooth scroll + react-fast-marquee
- Backend: FastAPI — POST/GET /api/contact → MongoDB `contacts` collection
- i18n: `/app/frontend/src/i18n.js` (id/en dictionaries), React state toggle in navbar
- Components in `/app/frontend/src/components/gesoi/`: Navbar, Hero, MarqueeStrip, Problem, Ecosystem, Pillars, Programs, Roadmap, Governance, JoinCTA, Footer
- Design: dark green (#0A2E20) + gold (#D4AF37) + emerald, Cormorant Garamond headings + Outfit body, glassmorphism, grain overlays

## User Personas
- Corporates/employers (burnout prevention), policymakers, general public, volunteers/donors

## Implemented (June 2026 — MVP)
- Kinetic hero with masked line-by-line reveal + parallax bg
- Bilingual ID/EN toggle (all copy)
- Editorial gold marquee (Sosialisasi/Edukasi/Advokasi/Riset...)
- Urgency stats (6.2% / 5.5% / 2045) + old vs new paradigm cards
- Grand Narrative ecosystem: PERDOSNI → GESOI → otaQku → ICC (glass cards, GESOI featured)
- Numbered manifesto pillars (01–04)
- 6 program cards + community image
- Roadmap timeline 3/7/10 years
- Governance (Rudiantara — Dewan Pembina, Andrew Tani — Dewan Pengurus, Dana Abadi)
- Join form → saves to MongoDB (name, email, org, interest chips, message), sonner toasts
- Footer with Jakarta address
- Tested: iteration_1.json — backend 100%, frontend 100%

## Implemented (Iteration 2 — June 2026)
- Admin dashboard `/admin` (JWT auth, bcrypt, httpOnly cookie + Bearer, brute-force lockout keyed by email, admin seeded from .env). Creds in /app/memory/test_credentials.md
- Protected GET /api/contact & /api/admin/contacts; stats + interest filter + table in dashboard
- New public content from uploaded docs (AD Yayasan, persiapan rapat, Matrix Kerjasama): flagship programs (GESOI Goes to School, Kelas 1000 Hari Otak, 30-Day Challenge, Duta Otak Indonesia, Festival Otak Sehat Nasional, White Book), Konsil Penasehat Kehormatan (Rudiantara chair + 15 tokoh), Lima Pilar Kerja Sama chips, Grand Launching 17 Agustus 2026 badge, tagline "Salam Otak Sehat, Indonesia Cerdas"
- Mobile hamburger menu; verified responsive at 16:9 (1920), 4:3 (1024x768), 19.5:9 (390x844)
- Sensitive info intentionally EXCLUDED from public site: initial capital amount, notary details, revenue-sharing terms, personal addresses, internal procedural docs
- Tested: iteration_2.json — 2 issues found & fixed (lockout identifier, ID cooperation chips), verified

## Implemented (Iteration 3 — June 2026)
- Rebrand to official design reference: deep navy (#0B1F3A) + gold (#D4AF37), green/blue kept as brand accents from logo
- Real GESOI logo (green brain + blue bubble) in navbar, footer, admin login & dashboard (white chip on navy)
- AI-generated navy blueprint Indonesia map hero background matching reference deck; "Emas 2045" hero line in gold
- Export CSV button on admin dashboard (exports filtered registrants, verified download works)

## Implemented (Iteration 4 — June 2026)
- Full-site CMS: admin dashboard tab "Editor Website" — every section's text, icons (curated lucide picker), and images editable; photo upload via Emergent object storage (POST /api/admin/upload → served at /api/files/{path} with cache); content stored in MongoDB site_content, landing deep-merges overrides over i18n defaults; Simpan/Reset flows verified
- Governance redesigned GBHI-style: horizontal leadership people-card carousel (17 tokoh, initials avatars until photos uploaded via CMS)
- Paradigm old/new redesigned: editorial navy panel (struck-through serif old steps → gold transition → numbered ascending new steps)
- Footer "Portal Admin" link near copyright
- SEO meta + OG image (AI-generated navy banner with logo) in index.html for WhatsApp/social sharing
- Note: recursive editor fields use createElement (babel visual-edits plugin crashes on recursive JSX — do not convert back)
- Tested: iteration_3.json — backend 24/24, frontend 100%

## Implemented (Iteration 5 — June 2026)
- News section (GBHI-style mosaic, 4 cards, category chips, first card large) with #news nav link "Kabar"
- Scientific Publications section: 3 paid publications, price + Beli Akses → PROTOTYPE checkout modal (payment INTENTIONALLY MOCKED per user — toast note, no Stripe)
- Video section: autoplay when ≥50% in viewport (IntersectionObserver, muted loop), emerald quote panel with "Tonton Video" (unmute) + mute toggle; default pexels mp4 + poster. Note: headless test browsers lack H.264 codec — plays fine in real browsers
- Cookie consent banner (Terima/Tolak, localStorage gesoi_cookie_consent) + Privacy Policy modal; policy text (and all new sections) editable via CMS editor (new sidebar entries 07 Kabar, 08 Video, 09 Publikasi, Privasi & Cookie); join kicker renumbered to 10
- Tested: iteration_4.json — frontend 100% (backend unchanged, skipped)

## Implemented (Iteration 6 — June 2026)
- Publication order management: checkout modal collects buyer data → POST /api/orders; admin tab "Pembelian Publikasi" (stats, status workflow Baru/Dihubungi/Selesai via PATCH, Export CSV). Payment still intentional prototype
- Ecosystem "Narasi Besar" redesigned: interactive ORBIT layout (GESOI center, floating satellites, hover tooltips, SVG connectors) with CMS "Tata Letak" dropdown (orbit/grid); mobile falls back to responsive grid
- Docs created: /app/docs/ARSITEKTUR.md, /app/docs/PRD.md, /app/docs/CATATAN_PENGEMBANGAN.md (Indonesian)
- Awaiting from user: official GESOI video URL (can be set via Editor → 08 — Video)
- Tested: iteration_5.json — backend 10/10, frontend 100%

## Implemented (Iteration 7 — June 2026)
- Custom icon uploader: every icon field in CMS editor now has lucide dropdown + "Unggah Ikon" (custom image) + size slider 50–200% (value format "name-or-url@scale", rendered via SectionIcon in lib/icons.js; used by Ecosystem & Programs)
- Video uploader: backend /api/admin/upload accepts mp4/webm/mov up to 60MB; editor video "url" field has upload button + inline preview
- Verified: video upload API, .txt rejection (400), custom icon @150% renders on landing; content reset to defaults after test

## Implemented (Iteration 8 — June 2026)
- Media gallery: admin tab "Galeri Media" — grid of all uploaded files (image/video previews, size, date), filter Semua/Gambar/Video, "Salin URL" (clipboard, reusable in Editor), soft delete (is_deleted; /api/files stops serving). Endpoints: GET /api/admin/files, DELETE /api/admin/files/{id}
- Admin login page: "Kembali ke Halaman Utama" link (iteration 7.5)

## Deferred
- Email notification on new registrant via Resend (user has no API key yet). Recipient: gesoigerakansehatotaknasional@gmail.com
- Real GESOI logo & photos (user will upload)

## Backlog
- P1: Resend email notification (once key provided); replace logo/photos when uploaded
- P2: News/publications section, partner logos, SEO meta/OG tags, GESOI Hub teaser, export registrants to CSV

## Implemented (Iteration 9 — June 2026)
- Hero performance fix: hero bg 1.2MB PNG → local /hero-bg.webp (39KB, 30x lighter, visual identik), preload di index.html, fetchPriority=high, will-change-transform pada layer parallax, dukungan useReducedMotion
- Galeri Media: tombol "Unggah File" langsung di halaman galeri (data-testid media-upload-btn), refresh grid otomatis setelah upload
- CMS adaptif: pilihan Tata Letak/Template per section — Pillars (list/cards), Programs (grid/media), Roadmap (timeline/photos), Ecosystem (orbit/grid, sudah ada); semua item nested pillars/programs/roadmap punya field gambar opsional di editor (injeksi otomatis via IMAGE_ITEM_PATHS di editorFields.js); landing merender gambar sesuai layout terpilih
- Fix minor: test_orders.py env fallback
- Tested: iteration_6.json — backend 24/24, frontend 100%

## Implemented (Iteration 10 — June 2026, code quality)
- Kredensial admin dihapus dari semua file test → /app/backend/tests/conftest.py memuat backend/.env + frontend/.env (fixtures session-scoped: api, admin_token, auth_headers)
- test_contact.py dipecah jadi test kecil (kompleksitas turun); perbandingan `is` → `==`/pattern equality di test_contact/test_cms; server.py startup seed `if not existing`
- Verifikasi: iteration_7.json — pytest 36/36, tanpa hardcoded creds (grep bersih)

## Implemented (Iteration 11 — June 2026): Analitik Pengunjung Internal
- POST /api/track (publik) + GET /api/admin/analytics?days=7|30|90 (protected, agregasi Mongo, clamp 1-90 hari)
- Tab "Analitik" di dasbor admin (AdminAnalytics.js, recharts): 5 kartu statistik (kunjungan, unik, klik bergabung, form, beli), grafik area tren harian, panel Perangkat/Bahasa/Sumber Kunjungan, selektor rentang
- Tracking frontend (lib/analytics.js) HANYA aktif setelah consent cookie "Terima" (event gesoi-consent-accepted); visitor id anonim di localStorage (gesoi_vid); event: pageview, join_click (hero+navbar), form_submit, buy_click, lang_switch
- Catatan desain: agregasi bahasa mencakup event lang_switch (bukan hanya pageview) — disengaja
- Tested: iteration_8.json — pytest 46/46 (incl. test_analytics.py baru), frontend 100%

## Implemented (Iteration 12 — Juni 2026, code quality)
- server.py: admin_analytics() dipecah ke helper kecil (_daily_pageviews, _unique_visitors, _group_count, _top_referrers) — respons API identik
- test_analytics.py: 'is True' → equality; test agregasi besar dipecah jadi 6 delta test kecil dengan fixture agg (class-scoped); SEMUA test analitik disatukan dalam satu kelas TestAnalytics agar xdist loadscope memakukannya di satu worker (memperbaiki race paralel antar-worker yang ditemukan saat refactor — JANGAN pecah kelas ini)
- Verifikasi: iteration_9.json — pytest 51/51 dua kali berturut (tanpa flakiness)

## Implemented (Iteration 13 — Juni 2026): Halaman Detail Berita
- Rute /berita/{index}-{slug} (pages/NewsDetail.js): header navy sticky (logo→home, toggle ID/EN, Kembali→/#news), hero image, kartu artikel (kategori, tanggal, judul serif, isi), "Berita Lainnya" (3 kartu), Footer, document.title dinamis, state not-found
- Format isi markdown-lite: baris kosong=paragraf, "## "=heading, **tebal**, URL gambar di baris sendiri=gambar inline (renderer di NewsDetail ArticleBody)
- Kartu berita landing: link eksternal terisi → <a target=_blank>; kosong → Link internal ke detail (lib/slug.js: slugify/newsUrl/newsIndexFromSlug)
- CMS: item berita punya field date+body (default id/en terisi artikel lengkap); editorFields ITEM_KEY_INJECTIONS menyuntik date/body utk konten lama; textarea body rows=6; label baru (Tanggal, dll)
- Fix: duplikasi withImage/withInjected di ArrayField dirapikan (testing agent menemukan withInjected hilang saat edit tidak tersimpan, lalu di-clean up); guard anti pageview ganda StrictMode di analytics.js (throttle 800ms)
- Catatan: hash scroll /#news di Landing (scrollIntoView 400ms)
- Tested: iteration_10.json — frontend 100%, pytest 51/51
- DIBATALKAN oleh user: pemecahan server.py ke routers

## Implemented (Iteration 14 — Juni 2026, code quality)
- Type hints lengkap di seluruh file test backend (conftest fixtures: api→requests.Session, admin_token→str, auth_headers→dict[str,str]; semua test → None; agg→tuple[dict,dict]; _cleanup→Iterator[None])
- Fix: korupsi file test_analytics.py (baris 'pass' nyasar + import typing hilang) ditemukan & diperbaiki
- Verifikasi: iteration_11.json — pytest 51/51, grep bersih (tidak ada def tanpa anotasi)

## Implemented (Iteration 15 — Juni 2026): Tombol Bagikan ke WhatsApp
- Halaman detail berita: tombol hijau WhatsApp (ikon SVG brand) di bawah artikel → https://wa.me/?text={judul}%0A%0A{url}, target _blank, data-testid news-share-whatsapp
- Dwibahasa via t.news.shareLabel (dapat diedit di CMS: "Label Tombol Bagikan"); klik terekam sebagai event analitik share_click
- Self-tested: screenshot + verifikasi href/target/label ID & EN

## Implemented (Iteration 16 — Juni 2026): Redesign UI "Clean, Minimalist, Elegant" (referensi gbhi.org)
- Blueprint dari design_agent: /app/design_guidelines.json
- Tema terang menyeluruh: bg putih/#FAFAFA (tidak ada lagi section navy gelap), font Cormorant Garamond (heading) + Manrope (body), warna navy #0A192F / emerald #059669 / gold #B45309, border slate tipis, whitespace lega
- Semua komponen gesoi/*.js di-restyle + index.css + NewsDetail (header kaca putih); FUNGSIONALITAS/props/CMS/data-testid TIDAK berubah
- Hero baru: gambar jaringan peta /hero-bg-light.webp (109KB, dioptimasi), opacity rendah di atas putih; preload di index.html; i18n heroBg default diganti
- Ciri: stats dengan divider tipis, paradigm panel terang, orbit ecosystem putih, governance foto dengan nama di bawah, video quote border-kiri emas, form input border-bottom, cookie banner kartu putih kiri-bawah
- Tested: pytest 51/51 (run pertama, terinterupsi kredit) + iteration_12.json 11/11 alur frontend (consent tracking, join form, publikasi modal, news detail, CMS layout switch+reset, mobile 390px, toggle bahasa)

## Implemented (Iteration 17 — Juli 2026): Kunci Form Pendaftaran Setelah Submit
- Setelah submit sukses, localStorage 'gesoi_registered' = {name, date ISO}; kunjungan berikutnya form diganti kartu konfirmasi elegan (ikon centang, judul, garis emas, pesan "Anda telah mendaftar pada {tanggal}..." + kalimat pemanis kesabaran)
- Dwibahasa (registeredTitle/registeredMsg di i18n join.form, tanggal terformat id-ID/en-US via prop lang baru di JoinCTA); teks dapat diedit di CMS (label editor ditambahkan)
- data-testid: join-already-registered, join-registered-message
- Self-tested e2e: submit → kartu muncul; reload → form terkunci; toggle EN → pesan Inggris. TEST_ contact dibersihkan

## CARDINAL RULE (Juli 2026, WAJIB SELAMANYA)
- DILARANG menggunakan em-dash (—) di narasi dan di mana pun pada website (konten i18n, komponen, meta tags, admin UI). Gunakan koma/titik dua/interpunct (·) untuk kicker, atau " | " untuk judul dokumen.

## Implemented (Iteration 18 — Juli 2026): Penghapusan Em-dash Menyeluruh
- 65 kemunculan em-dash dihapus dari i18n.js (narasi ID+EN ditulis ulang natural dengan koma/titik dua), kicker "01 — X" → "01 · X", AdminEditor/editorFields/AdminDashboard/NewsDetail/index.html (meta & title → " | ")
- Verifikasi: grep 0 di src+public, DB override 0, innerText halaman live 0 em-dash, compile sukses

## Implemented (Iteration 19 - Juli 2026): Tab Bantuan di Dasbor Admin
- Panduan admin (7 section: Login, Data Pendaftar, Pembelian, Analitik, Editor CMS, Galeri Media, Hal Penting) kini tampil sebagai tab "Bantuan" di dasbor (pages/AdminHelp.js); sumber konten sama dengan /app/docs/PANDUAN_ADMIN.md
- Self-tested: screenshot, 7 section ter-render, tanpa em-dash
