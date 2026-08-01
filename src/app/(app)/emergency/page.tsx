"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Phone, Shield, Pill, Scissors, Droplets } from "lucide-react";
import { useActivePatient } from "@/context/patient-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EmergencyPage() {
  const { patient, medications } = useActivePatient();

  return (
    <div className="min-h-full bg-gradient-to-b from-red-50/50 to-background">
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-900">Emergency Information</h2>
          <p className="mt-2 text-muted-foreground">{patient.name}</p>
        </motion.div>

        <div className="space-y-4">
          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-red-900">
                <Droplets className="h-4 w-4" />
                Blood Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-700">{patient.bloodGroup}</p>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-red-900">
                <AlertTriangle className="h-4 w-4" />
                Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {patient.conditions.map((c) => (
                  <Badge
                    key={c}
                    className="bg-red-100 text-red-900 hover:bg-red-100 text-sm font-normal"
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-red-900">
                <AlertTriangle className="h-4 w-4" />
                Allergies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((a) => (
                  <Badge
                    key={a}
                    variant="outline"
                    className="border-red-300 text-red-800 text-sm font-medium"
                  >
                    {a}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="h-4 w-4" />
                Current Medicines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {medications
                  .filter((m) => m.status === "active")
                  .map((med) => (
                    <div key={med.id} className="flex justify-between text-sm">
                      <span className="font-medium">{med.name}</span>
                      <span className="text-muted-foreground">
                        {med.dosage} · {med.frequency}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Scissors className="h-4 w-4" />
                Surgeries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {patient.surgeries.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patient.emergencyContacts.map((c) => (
                  <a
                    key={c.phone}
                    href={`tel:${c.phone.replace(/\s/g, "")}`}
                    className="flex items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.relation}</p>
                    </div>
                    <p className="text-lg font-semibold text-primary">{c.phone}</p>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Insurance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{patient.insurance.provider}</p>
              <p className="text-sm text-muted-foreground">
                Policy: {patient.insurance.policyNumber}
              </p>
              {patient.insurance.groupNumber && (
                <p className="text-sm text-muted-foreground">
                  Group: {patient.insurance.groupNumber}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
