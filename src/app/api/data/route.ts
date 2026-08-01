import { NextResponse } from "next/server";
import {
  getFamilyData,
  setActivePatient,
  verifyEntity,
  resetStore,
} from "@/lib/store";
import type { PatientId } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getFamilyData());
}

export async function POST(request: Request) {
  const body = await request.json();

  switch (body.action) {
    case "setActivePatient":
      setActivePatient(body.patientId as PatientId);
      break;
    case "verifyEntity":
      verifyEntity(body.patientId, body.reportId, body.entityValue);
      break;
    case "reset":
      resetStore();
      break;
  }

  return NextResponse.json(getFamilyData());
}
