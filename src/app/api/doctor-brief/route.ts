import { NextResponse } from "next/server";
import { generateDoctorBrief } from "@/lib/ai-pipeline";
import type { PatientId } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = (searchParams.get("patientId") as PatientId) || "mother";
  const brief = generateDoctorBrief(patientId);
  return NextResponse.json(brief);
}
