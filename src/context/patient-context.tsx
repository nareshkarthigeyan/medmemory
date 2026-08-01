"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { FamilyData, PatientId } from "@/lib/types";
import { SEED_DATA } from "@/lib/seed-data";

interface PatientContextValue {
  data: FamilyData;
  activePatientId: PatientId;
  setActivePatient: (id: PatientId) => void;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const PatientContext = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FamilyData>(SEED_DATA);
  const [activePatientId, setActivePatientId] = useState<PatientId>("mother");
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch("/api/data");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setActivePatientId(json.activePatientId);
      }
    } catch {
      // Use local seed data as fallback
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const setActivePatient = useCallback(async (id: PatientId) => {
    setActivePatientId(id);
    await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setActivePatient", patientId: id }),
    });
    await refreshData();
  }, [refreshData]);

  return (
    <PatientContext.Provider
      value={{ data, activePatientId, setActivePatient, refreshData, isLoading: isLoading }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatient must be used within PatientProvider");
  return ctx;
}

export function useActivePatient() {
  const { data, activePatientId } = usePatient();
  return data.patients[activePatientId];
}
