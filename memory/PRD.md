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

## Deferred
- Email notification on new registrant via Resend (user has no API key yet). Recipient: gesoigerakansehatotaknasional@gmail.com
- Real GESOI logo & photos (user will upload)

## Backlog
- P1: Resend email notification (once key provided); replace logo/photos when uploaded
- P2: News/publications section, partner logos, SEO meta/OG tags, GESOI Hub teaser, export registrants to CSV
