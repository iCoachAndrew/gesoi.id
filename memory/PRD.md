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

## Backlog
- P1: Admin view for contact submissions; email notification (Resend/SendGrid) on new submission
- P2: News/publications section, partner logos, real photography from GESOI, SEO meta/OG tags, mobile nav menu (hamburger)
- P2: Multi-page structure (About, Programs detail) as movement grows per canonical knowledge base

## Next Tasks
- Gather real brand assets (logo, photos) from user
- Admin dashboard for submissions
