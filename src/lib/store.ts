import { SEED_DATA } from "./seed-data";
import type {
  FamilyData,
  MedicalReport,
  Notification,
  PatientId,
  TimelineEvent,
  Medication,
} from "./types";

let familyData: FamilyData = structuredClone(SEED_DATA);

export function getFamilyData(): FamilyData {
  return familyData;
}

export function setActivePatient(patientId: PatientId): void {
  familyData.activePatientId = patientId;
}

export function getActivePatientId(): PatientId {
  return familyData.activePatientId;
}

export function getPatientMemory(patientId: PatientId) {
  return familyData.patients[patientId];
}

export function addReport(patientId: PatientId, report: MedicalReport): void {
  familyData.patients[patientId].reports.unshift(report);
}

export function addTimelineEvents(
  patientId: PatientId,
  events: TimelineEvent[]
): void {
  const timeline = familyData.patients[patientId].timeline;
  for (const event of events) {
    timeline.push(event);
  }
  timeline.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function addMedications(
  patientId: PatientId,
  meds: Medication[]
): void {
  const medications = familyData.patients[patientId].medications;
  for (const med of meds) {
    const existing = medications.find(
      (m) => m.name.toLowerCase() === med.name.toLowerCase()
    );
    if (existing) {
      Object.assign(existing, med);
    } else {
      medications.push(med);
    }
  }
}

export function addNotification(notification: Notification): void {
  familyData.notifications.unshift(notification);
}

export function verifyEntity(
  patientId: PatientId,
  reportId: string,
  entityValue: string
): void {
  const report = familyData.patients[patientId].reports.find(
    (r) => r.id === reportId
  );
  if (report && !report.verifiedEntities.includes(entityValue)) {
    report.verifiedEntities.push(entityValue);
    const entity = report.entities.find((e) => e.value === entityValue);
    if (entity) {
      entity.needsVerification = false;
      entity.confidence = Math.max(entity.confidence, 95);
    }
  }
}

export function resetStore(): void {
  familyData = structuredClone(SEED_DATA);
}
