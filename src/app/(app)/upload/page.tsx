"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import { usePatient } from "@/context/patient-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PROCESSING_STEPS, simulateProcessingStep } from "@/lib/ai-pipeline";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const router = useRouter();
  const { activePatientId, refreshData } = usePatient();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setIsProcessing(true);
      setCurrentStep(0);
      setCompletedSteps([]);

      for (let i = 0; i < PROCESSING_STEPS.length; i++) {
        setCurrentStep(i);
        await simulateProcessingStep(i);
        setCompletedSteps((prev) => [...prev, i]);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("patientId", activePatientId);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      await refreshData();
      await new Promise((r) => setTimeout(r, 800));

      if (data.report?.id) {
        router.push(`/reports/${data.report.id}?new=true`);
      }
    },
    [activePatientId, refreshData, router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const progress = isProcessing
    ? ((completedSteps.length / PROCESSING_STEPS.length) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-2xl p-6 lg:p-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">Upload Medical Report</h2>
        <p className="mt-2 text-muted-foreground">
          Drop a PDF or image. MedMemory will extract, understand, and update the
          living timeline.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isProcessing ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card
              className={cn(
                "border-2 border-dashed transition-all duration-300",
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/40"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <CardContent className="flex flex-col items-center py-16">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-medium">
                  Drag & drop your report here
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  PDF, JPG, PNG supported
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <span className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">
                    Choose File
                  </span>
                </label>
                <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> PDF
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" /> Images
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 rounded-xl bg-muted/50 p-4 text-center text-sm text-muted-foreground">
              <p>
                Tip: Upload a file named &quot;kidney-report.pdf&quot; to see kidney
                marker extraction in the demo.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="py-10">
                <div className="mb-8 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
                  >
                    <Loader2 className="h-6 w-6 text-primary" />
                  </motion.div>
                  <p className="font-medium">Processing {fileName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Building your living medical memory...
                  </p>
                </div>

                <Progress value={progress} className="mb-8 h-2" />

                <div className="space-y-4">
                  {PROCESSING_STEPS.map((step, i) => {
                    const isComplete = completedSteps.includes(i);
                    const isActive = currentStep === i && !isComplete;

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                          isActive && "bg-primary/5",
                          isComplete && "opacity-70"
                        )}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : isActive ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted" />
                        )}
                        <span
                          className={cn(
                            "text-sm",
                            isActive && "font-medium",
                            isComplete && "text-muted-foreground"
                          )}
                        >
                          {step.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
