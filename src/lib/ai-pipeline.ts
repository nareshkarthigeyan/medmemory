import { v4 as uuidv4 } from "uuid";
import { getPatientMemory } from "./store";
import type {
  ExtractedEntity,
  LabValue,
  MedicalReport,
  Medication,
  PatientId,
  TimelineEvent,
} from "./types";

export const PROCESSING_STEPS = [
  { id: "reading", label: "Reading Report..." },
  { id: "extracting", label: "Extracting Text..." },
  { id: "medicines", label: "Finding Medicines..." },
  { id: "timeline", label: "Updating Timeline..." },
  { id: "brief", label: "Generating Doctor Brief..." },
];

const DEMO_EXTRACTIONS: Record<
  string,
  {
    title: string;
    summary: string;
    confidence: number;
    entities: ExtractedEntity[];
    labValues: LabValue[];
    timelineEvents: Omit<TimelineEvent, "id" | "patientId">[];
    medications: Omit<Medication, "id">[];
    whatsappReply: string;
  }
> = {
  default: {
    title: "Uploaded Medical Report",
    summary:
      "General health checkup report processed. Vitals within normal range. Follow-up recommended in 3 months.",
    confidence: 82,
    entities: [
      { type: "date", value: new Date().toISOString().split("T")[0], confidence: 90 },
      { type: "doctor", value: "Dr. Unknown", confidence: 65, needsVerification: true },
      { type: "followup", value: "Follow-up in 3 months", confidence: 78 },
    ],
    labValues: [
      { name: "Hemoglobin", value: "13.2", unit: "g/dL", referenceRange: "12-16" },
    ],
    timelineEvents: [
      {
        date: new Date().toISOString().split("T")[0],
        year: new Date().getFullYear(),
        type: "followup",
        title: "New Report Added",
        description: "Health checkup report uploaded and processed.",
        confidence: 82,
        verified: false,
      },
    ],
    medications: [],
    whatsappReply:
      "✅ Report received.\n\nHealth checkup processed successfully.\nYour family has been notified.",
  },
  kidney: {
    title: "Kidney Function Panel",
    summary:
      "Creatinine slightly increased compared to previous report. eGFR stable but monitoring recommended.",
    confidence: 76,
    entities: [
      { type: "lab", value: "Creatinine: 1.7 mg/dL", confidence: 74, needsVerification: true },
      { type: "lab", value: "eGFR: 46 mL/min", confidence: 78 },
      { type: "doctor", value: "Dr. Kavitha Reddy", confidence: 85 },
      { type: "followup", value: "Repeat kidney panel in 4 weeks", confidence: 80 },
    ],
    labValues: [
      {
        name: "Creatinine",
        value: "1.7",
        unit: "mg/dL",
        referenceRange: "0.6-1.2",
        trend: "up",
        previousValue: "1.6",
      },
      {
        name: "eGFR",
        value: "46",
        unit: "mL/min",
        referenceRange: ">60",
        trend: "down",
        previousValue: "48",
      },
    ],
    timelineEvents: [
      {
        date: new Date().toISOString().split("T")[0],
        year: new Date().getFullYear(),
        type: "lab",
        title: "Kidney Markers Update",
        description:
          "Creatinine 1.7 mg/dL (↑ from 1.6). Continued monitoring of renal function required.",
        doctor: "Dr. Kavitha Reddy",
        confidence: 76,
        verified: false,
      },
    ],
    medications: [],
    whatsappReply:
      "✅ Report received.\n\nCreatinine slightly increased compared to your previous report.\nYour family has been notified.",
  },
};

function detectReportType(fileName: string): keyof typeof DEMO_EXTRACTIONS {
  const lower = fileName.toLowerCase();
  if (lower.includes("kidney") || lower.includes("renal") || lower.includes("creatinine")) {
    return "kidney";
  }
  return "default";
}

export async function processReport(
  patientId: PatientId,
  fileName: string,
  source: "upload" | "whatsapp" = "upload"
): Promise<{
  report: MedicalReport;
  timelineEvents: TimelineEvent[];
  medications: Medication[];
  whatsappReply: string;
}> {
  const reportType = detectReportType(fileName);
  const extraction = DEMO_EXTRACTIONS[reportType];

  const reportId = uuidv4();
  const report: MedicalReport = {
    id: reportId,
    patientId,
    title: extraction.title,
    summary: extraction.summary,
    uploadedAt: new Date().toISOString(),
    reportDate: new Date().toISOString().split("T")[0],
    source,
    thumbnailColor: source === "whatsapp" ? "#DCFCE7" : "#F0FDF4",
    confidence: extraction.confidence,
    entities: extraction.entities,
    labValues: extraction.labValues,
    verifiedEntities: [],
    rawMarkdown: `# ${extraction.title}\n\n${extraction.summary}\n\n## Extracted Data\n${extraction.entities.map((e) => `- ${e.type}: ${e.value} (${e.confidence}%)`).join("\n")}`,
  };

  const timelineEvents: TimelineEvent[] = extraction.timelineEvents.map(
    (event) => ({
      ...event,
      id: uuidv4(),
      patientId,
      relatedReportId: reportId,
    })
  );

  const medications: Medication[] = extraction.medications.map((med) => ({
    ...med,
    id: uuidv4(),
  }));

  return {
    report,
    timelineEvents,
    medications,
    whatsappReply: extraction.whatsappReply,
  };
}

export function generateDoctorBrief(patientId: PatientId) {
  const memory = getPatientMemory(patientId);
  const { patient, timeline, medications, reports } = memory;

  const recentLabs = reports
    .flatMap((r) => r.labValues)
    .filter((l) => l.trend && l.trend !== "stable")
    .slice(0, 5);

  const questions = [
    "How should we adjust medications given recent lab trends?",
    "Are there dietary changes recommended for current conditions?",
    "What warning signs should we watch for at home?",
    "When should the next follow-up tests be scheduled?",
  ];

  if (patient.conditions.some((c) => c.toLowerCase().includes("kidney"))) {
    questions.unshift(
      "Given the worsening kidney markers, should we consider nephrology referral?"
    );
  }

  const missingReports = [
    "Annual comprehensive metabolic panel (due)",
    "Eye examination report (overdue by 2 months)",
  ].filter(() => patientId === "mother");

  return {
    generatedAt: new Date().toISOString(),
    patientName: patient.name,
    currentConditions: patient.conditions,
    currentMedications: medications.filter((m) => m.status === "active"),
    recentLabChanges: recentLabs,
    importantHistory: timeline.filter(
      (e) =>
        e.type === "diagnosis" ||
        e.type === "complication" ||
        e.type === "procedure"
    ),
    questionsToAsk: questions,
    missingReports: patientId === "mother" ? missingReports : [],
    emergencyInfo: {
      bloodGroup: patient.bloodGroup,
      allergies: patient.allergies,
      emergencyContacts: patient.emergencyContacts,
      insurance: patient.insurance,
    },
  };
}

export async function simulateProcessingStep(
  stepIndex: number
): Promise<void> {
  const delays = [1200, 1500, 1800, 1400, 1000];
  await new Promise((resolve) => setTimeout(resolve, delays[stepIndex] ?? 1000));
}
