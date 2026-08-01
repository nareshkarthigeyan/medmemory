"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  Activity,
  Pill,
  FileText,
  Calendar,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useActivePatient, usePatient } from "@/context/patient-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const memory = useActivePatient();
  const { data } = usePatient();
  const { patient, timeline, medications, reports, appointments } = memory;

  const lowConfidenceMeds = medications.filter(
    (m) => m.confidence && m.confidence < 80
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-6xl space-y-8 p-6 lg:p-8"
    >
      {/* Patient Overview */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border-0 shadow-sm">
          <div className="bg-gradient-to-r from-primary/5 via-sage-light/50 to-transparent p-6 lg:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
                  {patient.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{patient.name}</h2>
                  <p className="text-muted-foreground">
                    {patient.age} years · {patient.relationship} · Blood Group{" "}
                    {patient.bloodGroup}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {patient.conditions.map((c) => (
                      <Badge key={c} variant="secondary" className="font-normal">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Link href="/doctor-brief">
                <Button size="lg" className="w-full sm:w-auto">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Doctor Brief
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>

      {lowConfidenceMeds.length > 0 && (
        <motion.div variants={item}>
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">Verification needed</p>
              <p className="text-sm text-amber-700">
                Please verify extracted medicine:{" "}
                {lowConfidenceMeds.map((m) => m.name).join(", ")}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline Preview */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Activity className="h-4 w-4 text-primary" />
                Medical Timeline
              </CardTitle>
              <Link href="/timeline">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-0">
                {timeline.slice(-5).map((event, i) => (
                  <div key={event.id} className="relative flex gap-4 pb-5 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          event.type === "diagnosis" && "bg-emerald-500",
                          event.type === "medication" && "bg-blue-500",
                          event.type === "complication" && "bg-amber-500",
                          event.type === "lab" && "bg-rose-500",
                          event.type === "procedure" && "bg-purple-500",
                          !["diagnosis", "medication", "complication", "lab", "procedure"].includes(event.type) && "bg-primary"
                        )}
                      />
                      {i < Math.min(timeline.length, 5) - 1 && (
                        <div className="mt-1 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(event.date), "MMM yyyy")}
                        </span>
                        {!event.verified && event.confidence && event.confidence < 85 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Unverified
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appointments */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Calendar className="h-4 w-4 text-primary" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="rounded-xl bg-muted/50 p-3"
                >
                  <p className="font-medium text-sm">{apt.title}</p>
                  <p className="text-xs text-muted-foreground">{apt.doctor}</p>
                  <p className="mt-1 text-xs font-medium text-primary">
                    {format(parseISO(apt.date), "EEE, MMM d")} · {apt.time}
                  </p>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Medications */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Pill className="h-4 w-4 text-primary" />
                Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medications
                  .filter((m) => m.status === "active")
                  .map((med) => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between rounded-xl border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{med.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {med.dosage} · {med.frequency}
                        </p>
                      </div>
                      {med.confidence && med.confidence < 80 && (
                        <Badge variant="outline" className="border-amber-300 text-amber-700">
                          ⚠ Verify
                        </Badge>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Latest Reports */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                Latest Reports
              </CardTitle>
              <Link href="/upload">
                <Button variant="ghost" size="sm">
                  Upload <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.slice(0, 3).map((report) => (
                  <Link key={report.id} href={`/reports/${report.id}`}>
                    <div className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: report.thumbnailColor }}
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">{report.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(report.reportDate), "MMM d, yyyy")} ·{" "}
                          {report.confidence}% confidence
                        </p>
                      </div>
                      {report.confidence < 80 && (
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Notifications */}
      {data.notifications.length > 0 && (
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.notifications.slice(0, 3).map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 rounded-lg p-2 text-sm"
                  >
                    {n.type === "whatsapp" ? (
                      <Badge className="shrink-0 bg-green-100 text-green-800 hover:bg-green-100">
                        WhatsApp
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="shrink-0">
                        {n.type}
                      </Badge>
                    )}
                    <p className="text-muted-foreground">{n.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
