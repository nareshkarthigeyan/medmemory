export type PatientId = "mother" | "father";

export interface Patient {
  id: PatientId;
  name: string;
  age: number;
  relationship: string;
  bloodGroup: string;
  avatar: string;
  conditions: string[];
  allergies: string[];
  emergencyContacts: EmergencyContact[];
  insurance: InsuranceInfo;
  surgeries: string[];
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy?: string;
  startDate: string;
  status: "active" | "discontinued";
  confidence?: number;
}

export interface LabValue {
  name: string;
  value: string;
  unit: string;
  referenceRange?: string;
  trend?: "up" | "down" | "stable";
  previousValue?: string;
}

export interface TimelineEvent {
  id: string;
  patientId: PatientId;
  date: string;
  year: number;
  type:
    | "diagnosis"
    | "medication"
    | "procedure"
    | "lab"
    | "appointment"
    | "complication"
    | "followup";
  title: string;
  description: string;
  doctor?: string;
  hospital?: string;
  relatedReportId?: string;
  confidence?: number;
  verified?: boolean;
}

export interface ExtractedEntity {
  type:
    | "disease"
    | "diagnosis"
    | "medicine"
    | "dosage"
    | "doctor"
    | "hospital"
    | "date"
    | "lab"
    | "procedure"
    | "allergy"
    | "followup";
  value: string;
  confidence: number;
  needsVerification?: boolean;
}

export interface MedicalReport {
  id: string;
  patientId: PatientId;
  title: string;
  summary: string;
  uploadedAt: string;
  reportDate: string;
  source: "upload" | "whatsapp";
  thumbnailColor: string;
  confidence: number;
  entities: ExtractedEntity[];
  labValues: LabValue[];
  rawMarkdown?: string;
  verifiedEntities: string[];
}

export interface Appointment {
  id: string;
  patientId: PatientId;
  title: string;
  doctor: string;
  hospital: string;
  date: string;
  time: string;
}

export interface DoctorBrief {
  generatedAt: string;
  patientName: string;
  currentConditions: string[];
  currentMedications: Medication[];
  recentLabChanges: LabValue[];
  importantHistory: TimelineEvent[];
  questionsToAsk: string[];
  missingReports: string[];
  emergencyInfo: {
    bloodGroup: string;
    allergies: string[];
    emergencyContacts: EmergencyContact[];
    insurance: InsuranceInfo;
  };
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: "pending" | "active" | "complete";
}

export interface PatientMemory {
  patient: Patient;
  timeline: TimelineEvent[];
  medications: Medication[];
  reports: MedicalReport[];
  appointments: Appointment[];
}

export interface FamilyData {
  activePatientId: PatientId;
  patients: Record<PatientId, PatientMemory>;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  patientId: PatientId;
  type: "report" | "alert" | "whatsapp";
}
