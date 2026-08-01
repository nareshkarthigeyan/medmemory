# MedMemory

**Your family's living medical memory.**

MedMemory is an MVP that demonstrates product thinking for family health management. Instead of storing medical reports as files, it continuously understands and reconstructs a patient's medical history into a living timeline.

## Core Insight

> Families don't struggle because medical reports are lost. They struggle because medical knowledge is fragmented across years, doctors, hospitals, and family members.

## Features

- **Dashboard** — Patient overview, timeline preview, medications, latest reports
- **Living Timeline** — Scrollable medical history reconstructed from reports
- **Upload** — Drag & drop PDF/images with AI processing animation
- **Report Viewer** — Extracted entities, confidence scores, verification flow
- **Doctor Brief** — Printable appointment summary
- **Emergency Mode** — Critical health info at a glance
- **WhatsApp Input** — Simulate parent sending reports via WhatsApp

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- shadcn/ui
- Framer Motion
- TypeScript

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Flow

1. **Landing** → Click "Try Demo"
2. **Dashboard** → Explore Lakshmi Devi's (Mother) medical timeline
3. **Upload** → Drop a file (try naming it `kidney-report.pdf` for kidney extraction demo)
4. **Watch** → AI processing animation updates the timeline
5. **Doctor Brief** → Generate printable summary
6. **Settings** → Simulate WhatsApp report from parent
7. **Emergency** → View critical health information

## AI Pipeline (Demo Mode)

The MVP uses a simulated AI pipeline with realistic processing delays. In production, this connects to:

- Unlimited-OCR for text extraction
- Gemini Flash / OpenRouter for entity extraction
- Supabase for persistence

Configure via environment variables (see `.env.example`).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | Family health dashboard |
| `/timeline` | Full medical timeline |
| `/upload` | Report upload |
| `/reports/[id]` | Report details |
| `/doctor-brief` | Printable doctor brief |
| `/emergency` | Emergency information |
| `/settings` | Family & integrations |

## Product Decisions

**Built:** Living timeline, entity extraction, confidence scoring, doctor brief, WhatsApp input, emergency mode

**Not built:** Appointment booking, telemedicine, medicine ordering, fitness tracking, AI chatbot

---

Built as a Product Management internship MVP demonstrating product thinking over feature count.
