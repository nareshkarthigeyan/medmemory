"use client";

import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  Stethoscope,
  Pill,
  FlaskConical,
  Scissors,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { useActivePatient } from "@/context/patient-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/types";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  diagnosis: Stethoscope,
  medication: Pill,
  lab: FlaskConical,
  procedure: Scissors,
  complication: AlertTriangle,
  appointment: Calendar,
  followup: Calendar,
};

const typeColors: Record<string, string> = {
  diagnosis: "bg-emerald-500",
  medication: "bg-blue-500",
  lab: "bg-rose-500",
  procedure: "bg-purple-500",
  complication: "bg-amber-500",
  appointment: "bg-primary",
  followup: "bg-slate-400",
};

function TimelineNode({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const Icon = typeIcons[event.type] ?? Calendar;
  const year = event.year;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="relative flex gap-6"
    >
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm",
            typeColors[event.type] ?? "bg-primary"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {!isLast && <div className="mt-2 w-0.5 flex-1 bg-border" />}
      </div>

      <div className={cn("pb-10 flex-1", isLast && "pb-0")}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {format(parseISO(event.date), "MMMM d, yyyy")}
          </span>
          {event.confidence && event.confidence < 85 && !event.verified && (
            <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">
              Needs verification
            </Badge>
          )}
        </div>
        <h3 className="mt-1 text-lg font-semibold">{event.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          {event.description}
        </p>
        {(event.doctor || event.hospital) && (
          <p className="mt-2 text-xs text-muted-foreground">
            {event.doctor}
            {event.doctor && event.hospital && " · "}
            {event.hospital}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function TimelinePage() {
  const { patient, timeline } = useActivePatient();

  const groupedByYear = timeline.reduce<Record<number, TimelineEvent[]>>(
    (acc, event) => {
      if (!acc[event.year]) acc[event.year] = [];
      acc[event.year].push(event);
      return acc;
    },
    {}
  );

  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">
      <div className="mb-10">
        <h2 className="text-2xl font-bold">{patient.name}&apos;s Medical Timeline</h2>
        <p className="mt-2 text-muted-foreground">
          A living record reconstructed from {timeline.length} events across{" "}
          {years.length} years of medical history.
        </p>
      </div>

      <div className="relative">
        {years.map((year) => (
          <div key={year} className="mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="sticky top-0 z-10 mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary backdrop-blur-sm"
            >
              {year}
            </motion.div>
            <div className="space-y-0">
              {groupedByYear[year].map((event, i) => (
                <TimelineNode
                  key={event.id}
                  event={event}
                  isLast={i === groupedByYear[year].length - 1 && year === years[years.length - 1]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
