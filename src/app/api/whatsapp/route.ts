import { NextResponse } from "next/server";
import {
  addMedications,
  addNotification,
  addReport,
  addTimelineEvents,
} from "@/lib/store";
import { processReport } from "@/lib/ai-pipeline";

export async function POST(request: Request) {
  const body = await request.json();
  const patientId = body.patientId || "mother";
  const fileName = body.fileName || "whatsapp-report.jpg";

  const result = await processReport(patientId, fileName, "whatsapp");

  addReport(patientId, result.report);
  addTimelineEvents(patientId, result.timelineEvents);
  if (result.medications.length > 0) {
    addMedications(patientId, result.medications);
  }
  addNotification({
    id: `n-${Date.now()}`,
    message: result.whatsappReply.replace(/\n/g, " "),
    timestamp: new Date().toISOString(),
    patientId,
    type: "whatsapp",
  });

  return NextResponse.json({
    success: true,
    reply: result.whatsappReply,
    report: result.report,
  });
}
