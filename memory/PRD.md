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

## Deferred
- Email notification on new registrant via Resend (user has no API key yet). Recipient: gesoigerakansehatotaknasional@gmail.com
- Real GESOI logo & photos (user will upload)

## Backlog
- P1: Resend email notification (once key provided); replace logo/photos when uploaded
- P2: News/publications section, partner logos, SEO meta/OG tags, GESOI Hub teaser, export registrants to CSV
