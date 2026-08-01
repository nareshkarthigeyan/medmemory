"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  Printer,
  FileText,
  Pill,
  FlaskConical,
  History,
  HelpCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { usePatient } from "@/context/patient-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DoctorBrief } from "@/lib/types";

export default function DoctorBriefPage() {
  const { activePatientId } = usePatient();
  const [brief, setBrief] = useState<DoctorBrief | null>(null);
  const [loading, setLoading] = useState(true);

  const generateBrief = async () => {
    setLoading(true);
    const res = await fetch(`/api/doctor-brief?patientId=${activePatientId}`);
    const data = await res.json();
    setBrief(data);
    setLoading(false);
  };

  useEffect(() => {
    generateBrief();
  }, [activePatientId]);

  const handlePrint = () => window.print();

  if (loading || !brief) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-4xl p-6 lg:p-8"
    >
      <div className="no-print mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Doctor Brief</h2>
          <p className="text-muted-foreground">
            Printable summary for {brief.patientName}&apos;s next appointment
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={generateBrief}>
            Regenerate
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Brief
          </Button>
        </div>
      </div>

      <div className="print-only hidden mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">MedMemory Doctor Brief</h1>
        <p className="text-sm text-muted-foreground">
          Generated {format(parseISO(brief.generatedAt), "MMMM d, yyyy 'at' h:mm a")}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Current Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {brief.currentConditions.map((c) => (
                <Badge key={c} variant="secondary" className="text-sm font-normal">
                  {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="h-4 w-4 text-primary" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Medicine</th>
                    <th className="pb-2 font-medium">Dosage</th>
                    <th className="pb-2 font-medium">Frequency</th>
                    <th className="pb-2 font-medium">Since</th>
                  </tr>
                </thead>
                <tbody>
                  {brief.currentMedications.map((med) => (
                    <tr key={med.id} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">{med.name}</td>
                      <td className="py-2.5">{med.dosage}</td>
                      <td className="py-2.5">{med.frequency}</td>
                      <td className="py-2.5 text-muted-foreground">
                        {format(parseISO(med.startDate), "MMM yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4 text-primary" />
              Recent Lab Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {brief.recentLabChanges.length > 0 ? (
              <div className="space-y-3">
                {brief.recentLabChanges.map((lab) => (
                  <div
                    key={lab.name}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium text-sm">{lab.name}</p>
                      {lab.previousValue && (
                        <p className="text-xs text-muted-foreground">
                          Previous: {lab.previousValue} {lab.unit}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {lab.value} {lab.unit}
                      </p>
                      {lab.trend && (
                        <Badge
                          variant="outline"
                          className={
                            lab.trend === "up"
                              ? "border-rose-300 text-rose-700"
                              : "border-emerald-300 text-emerald-700"
                          }
                        >
                          {lab.trend === "up" ? "↑ Increased" : "↓ Decreased"}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No significant lab changes</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-primary" />
              Important Medical History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {brief.importantHistory.map((event) => (
                <div key={event.id} className="border-l-2 border-primary/30 pl-4">
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(event.date), "MMMM yyyy")}
                  </p>
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="h-4 w-4 text-primary" />
              Questions to Ask Doctor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {brief.questionsToAsk.map((q, i) => (
                <li key={i} className="leading-relaxed">
                  {q}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {brief.missingReports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Missing Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {brief.missingReports.map((r) => (
                  <li key={r} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emergency Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">Blood Group</p>
                <p className="font-medium">{brief.emergencyInfo.bloodGroup}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Allergies</p>
                <p className="font-medium">
                  {brief.emergencyInfo.allergies.join(", ") || "None known"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Insurance</p>
                <p className="font-medium">{brief.emergencyInfo.insurance.provider}</p>
                <p className="text-xs text-muted-foreground">
                  {brief.emergencyInfo.insurance.policyNumber}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Emergency Contact</p>
                {brief.emergencyInfo.emergencyContacts.map((c) => (
                  <p key={c.phone} className="font-medium">
                    {c.name} ({c.relation}) — {c.phone}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
