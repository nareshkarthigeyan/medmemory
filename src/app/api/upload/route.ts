import { NextResponse } from "next/server";
import {
  addMedications,
  addNotification,
  addReport,
  addTimelineEvents,
} from "@/lib/store";
import { processReport } from "@/lib/ai-pipeline";
import type { PatientId } from "@/lib/types";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const patientId = (formData.get("patientId") as PatientId) || "mother";
  const fileName = file?.name || "report.pdf";

  const result = await processReport(patientId, fileName, "upload");

  addReport(patientId, result.report);
  addTimelineEvents(patientId, result.timelineEvents);
  if (result.medications.length > 0) {
    addMedications(patientId, result.medications);
  }
  addNotification({
    id: `n-${Date.now()}`,
    message: `New report processed: ${result.report.title}`,
    timestamp: new Date().toISOString(),
    patientId,
    type: "report",
  });

  return NextResponse.json({
    success: true,
    report: result.report,
    timelineEvents: result.timelineEvents,
  });
}
