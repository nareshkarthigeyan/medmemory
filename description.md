# MedMemory

MedMemory is a Next.js MVP for family health management. It turns medical reports into a shared view of a patient history. The app combines reports, diagnoses, lab values, medicines, appointments, and emergency details in one interface.

The product targets families that manage care across several doctors, hospitals, and family members. Its main idea is simple. A family needs a medical history that stays useful after each new report. A file folder does not provide that history.

## Product purpose

MedMemory helps a family answer these questions:

- What conditions does this family member have?
- What medicines does this person take now?
- What changed in the latest report?
- What should the family ask the doctor?
- What information does a doctor need before an appointment?
- What information matters during an emergency?

The demo uses two seeded patients. Lakshmi Devi is the active patient when the app starts. Ramesh Kumar is the second patient.

## Main features

### Dashboard

The dashboard shows the selected patient and a summary of the patient record. It includes:

- Patient name, age, relationship, blood group, and conditions
- A preview of recent timeline events
- Current medicines
- Recent medical reports
- Upcoming appointments
- Low-confidence medicine warnings
- A link to create a doctor brief

The family switcher changes the active patient across the app.

### Living timeline

The timeline presents the patient history in date order. Events can describe diagnoses, medicines, procedures, lab results, complications, appointments, and follow-ups.

Each event can include a doctor, hospital, related report, confidence score, and verification state. The dashboard shows a short version of the timeline. The timeline page shows the full history.

### Report upload

The upload page accepts PDF and image file types. It provides drag and drop and file selection controls. After the user selects a file, the page displays a five-step processing sequence:

1. Read the report.
2. Extract text.
3. Find medicines.
4. Update the timeline.
5. Generate the doctor brief.

The app then opens the new report page. The page shows the report summary, extracted entities, lab values, confidence score, and verification controls.

### Report viewer and verification

The report viewer displays extracted entities such as diagnoses, medicines, doctors, hospitals, dates, procedures, follow-ups, and lab values.

Each entity has a confidence score. The user can verify entities that need review. Verification changes the entity state and raises its confidence score to at least 95 percent.

The current report preview is a colored placeholder. The app does not store or render the uploaded source file.

### Doctor brief

The doctor brief creates a printable appointment summary. It includes:

- Current conditions
- Active medicines
- Recent lab changes
- Important medical history
- Questions for the doctor
- Missing reports
- Emergency information

The brief adds a kidney specialist question when the patient record contains a kidney condition. It marks missing reports for Lakshmi Devi in the seeded demo data.

### Emergency mode

The emergency page puts urgent patient information in one view. It shows:

- Blood group
- Conditions
- Allergies
- Active medicines
- Surgeries
- Emergency contacts with phone links
- Insurance provider and policy details

The page uses a red visual treatment to separate emergency information from normal record views.

### WhatsApp simulation

The settings page includes a simulated WhatsApp report flow. The simulation submits a kidney report for the active patient. The app adds the report, timeline event, notification, and reply message.

The flow represents a future integration in which a parent could send a report through WhatsApp. It does not connect to WhatsApp.

## Technical architecture

The project uses the Next.js App Router with React Server Components and client components where the interface needs state or browser actions.

The main layers are:

- `src/app/` contains routes, layouts, and API handlers.
- `src/components/` contains shared UI and landing page components.
- `src/context/patient-context.tsx` manages client-side patient state.
- `src/lib/types.ts` defines the domain model.
- `src/lib/seed-data.ts` contains the demo family records.
- `src/lib/store.ts` manages server-side in-memory state.
- `src/lib/ai-pipeline.ts` processes demo reports and creates doctor briefs.

The application layout wraps the app in `PatientProvider`. The provider loads family data from `/api/data` and falls back to seed data when the request fails.

The interface uses Tailwind CSS, shadcn/ui components, Framer Motion animations, Lucide icons, and `date-fns` for date formatting. TypeScript provides type definitions for patients, reports, events, medicines, appointments, and doctor briefs.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page and product overview |
| `/dashboard` | Patient summary and recent activity |
| `/timeline` | Full patient history |
| `/upload` | Upload a report and run the processing demo |
| `/reports/[id]` | View and verify a report |
| `/doctor-brief` | Create a printable doctor summary |
| `/emergency` | Show urgent patient information |
| `/settings` | Run the WhatsApp simulation and reset demo data |

## API routes

### `GET /api/data`

Returns the current family data.

### `POST /api/data`

Performs one state action. Supported actions set the active patient, verify a report entity, or reset the demo store.

### `POST /api/upload`

Accepts multipart form data with a file and patient ID. It processes the file name, adds the generated report, adds timeline events, adds medicines, and creates a notification.

### `GET /api/doctor-brief`

Returns a doctor brief for the patient ID in the query string. It uses the current server store.

### `POST /api/whatsapp`

Runs the WhatsApp simulation for a patient and file name. It returns a reply and the generated report.

## Demo processing behavior

The project does not run OCR or a live language model. The AI pipeline uses the file name to select a canned extraction.

If the file name contains `kidney`, `renal`, or `creatinine`, the pipeline returns a kidney function panel. The result includes creatinine, eGFR, a doctor, and a follow-up recommendation.

All other file names use a general health checkup result. The processing delays create the appearance of a multi-step AI workflow.

The pipeline creates report IDs, timeline event IDs, and medicine IDs with UUIDs. It updates the server store after processing.

## Data model

The main data object is `FamilyData`. It contains the active patient ID, a map of patient memories, and notifications.

Each `PatientMemory` contains one patient, a timeline, medicines, reports, and appointments.

The report model stores extracted entities, lab values, confidence, report source, verification state, and a generated Markdown summary. The event model links new timeline items to their source report.

## Data and persistence

The demo stores data in a module-level variable in `src/lib/store.ts`. The data resets when the server process restarts. The reset action also restores the seed data.

The project includes Supabase and AI-related environment variable names for future work. The current implementation does not require those services to run the demo.

Optional environment variables include:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY`
- `GEMINI_API_KEY`
- `UNLIMITED_OCR_API_KEY`
- `WHATSAPP_WEBHOOK_SECRET`

## Local setup

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

Run the production checks with:

```bash
npm run lint
npm run build
```

## Suggested demo path

1. Open the landing page.
2. Select `Try Demo`.
3. Review Lakshmi Devi on the dashboard.
4. Open the timeline and report list.
5. Upload a file named `kidney-report.pdf`.
6. Watch the simulated processing steps.
7. Verify the low-confidence medicine entity.
8. Open the doctor brief.
9. Open the emergency page.
10. Run the WhatsApp simulation in settings.

## Current limits

MedMemory is a product demo. It does not provide medical advice or clinical decision support.

The project has no authentication, authorization, user accounts, database persistence, audit log, encryption layer, or production access control. The API routes do not validate file contents or enforce upload limits.

The upload handler uses the file name rather than the file contents. The app does not perform OCR, medical entity extraction, report storage, or WhatsApp delivery.

The seed data contains realistic-looking health, contact, insurance, and hospital details. Treat it as demo data. Do not use real patient information in the current implementation.

## Future production work

A production version would need secure identity and access controls, encrypted storage, a real database, file validation, OCR, a reviewed medical extraction system, source document storage, audit records, consent controls, webhook verification, monitoring, and a clear clinical safety process.
