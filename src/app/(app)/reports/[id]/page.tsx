"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useActivePatient, usePatient } from "@/context/patient-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ReportDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "true";
  const { reports } = useActivePatient();
  const { refreshData } = usePatient();
  const [verified, setVerified] = useState<string[]>([]);

  const report = reports.find((r) => r.id === params.id);

  useEffect(() => {
    if (isNew) refreshData();
  }, [isNew, refreshData]);

  if (!report) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Report not found</p>
          <Link href="/dashboard">
            <Button variant="link" className="mt-2">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleVerify = async (entityValue: string) => {
    await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "verifyEntity",
        patientId: report.patientId,
        reportId: report.id,
        entityValue,
      }),
    });
    setVerified((prev) => [...prev, entityValue]);
    await refreshData();
  };

  const lowConfidence = report.confidence < 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl p-6 lg:p-8"
    >
      {isNew && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center"
        >
          <p className="font-medium text-primary">
            Timeline updated successfully
          </p>
          <p className="text-sm text-muted-foreground">
            This report has been integrated into the living medical memory.
          </p>
        </motion.div>
      )}

      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">{report.title}</h2>
              {report.source === "whatsapp" && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  WhatsApp
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Report date: {format(parseISO(report.reportDate), "MMMM d, yyyy")} ·
              Uploaded {format(parseISO(report.uploadedAt), "MMM d, yyyy")}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {report.summary}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Extracted Entities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {report.entities.map((entity, i) => {
                  const isVerified =
                    verified.includes(entity.value) ||
                    report.verifiedEntities.includes(entity.value);
                  const needsVerify =
                    entity.needsVerification ||
                    (entity.confidence < 80 && !isVerified);

                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                        needsVerify && "border-amber-300 bg-amber-50"
                      )}
                    >
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {entity.type}
                      </Badge>
                      <span>{entity.value}</span>
                      <span className="text-xs text-muted-foreground">
                        {entity.confidence}%
                      </span>
                      {needsVerify ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                          onClick={() => handleVerify(entity.value)}
                        >
                          Verify
                        </Button>
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {report.labValues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lab Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.labValues.map((lab) => (
                    <div
                      key={lab.name}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{lab.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Ref: {lab.referenceRange}
                          {lab.previousValue && ` · Prev: ${lab.previousValue}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {lab.value} {lab.unit}
                        </span>
                        {lab.trend === "up" && (
                          <TrendingUp className="h-4 w-4 text-rose-500" />
                        )}
                        {lab.trend === "down" && (
                          <TrendingDown className="h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div
                className="flex aspect-[3/4] items-center justify-center rounded-xl"
                style={{ backgroundColor: report.thumbnailColor }}
              >
                <div className="text-center p-6">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm font-medium text-muted-foreground">
                    Original Report
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Preview placeholder
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Confidence Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div
                  className={cn(
                    "mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold",
                    report.confidence >= 80
                      ? "bg-primary/10 text-primary"
                      : "bg-amber-100 text-amber-700"
                  )}
                >
                  {report.confidence}%
                </div>
                {lowConfidence && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-left">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <p className="text-xs text-amber-800">
                      Please verify extracted medicines and values marked below
                      80% confidence.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
