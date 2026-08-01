"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Upload, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const timelinePreview = [
  { year: "2021", event: "Diagnosed Type II Diabetes", color: "bg-emerald-500" },
  { year: "", event: "Started Metformin", color: "bg-emerald-400" },
  { year: "2023", event: "Eye complications detected", color: "bg-amber-500" },
  { year: "", event: "Insulin added", color: "bg-emerald-400" },
  { year: "2025", event: "Kidney markers worsening", color: "bg-rose-500" },
  { year: "", event: "Current medications updated", color: "bg-primary" },
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sage-light/30 to-transparent" />
      <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Heart className="h-4 w-4" />
            Your family&apos;s living medical memory
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your family&apos;s medical history,{" "}
            <span className="gradient-text">finally in one place.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Turn years of scattered reports into one continuously updated medical
            memory. Not a file cabinet — a living understanding of your
            family&apos;s health.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-base">
                Try Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/upload">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                <Upload className="mr-2 h-4 w-4" />
                Upload Report
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mt-20 max-w-2xl"
        >
          <div className="glass-card rounded-2xl p-8">
            <div className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              Living Timeline — Lakshmi Devi
            </div>
            <div className="relative space-y-0">
              {timelinePreview.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    {i < timelinePreview.length - 1 && (
                      <div className="mt-1 w-0.5 flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-2">
                    {item.year && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {item.year}
                      </span>
                    )}
                    <p className="text-sm font-medium">{item.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Clock,
    title: "Living Timeline",
    description:
      "Every report updates a structured medical timeline — not just another folder.",
  },
  {
    icon: FileText,
    title: "Doctor Brief",
    description:
      "Generate a printable summary before every appointment. Conditions, meds, questions — ready.",
  },
  {
    icon: Upload,
    title: "WhatsApp Input",
    description:
      "Parents send reports via WhatsApp. Timeline updates instantly. Family gets notified.",
  },
];

export function LandingFeatures() {
  return (
    <section className="border-t bg-warm py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Not cloud storage. A living memory.
          </h2>
          <p className="mt-4 text-muted-foreground">
            The source of truth isn&apos;t the PDF. It&apos;s the continuously
            evolving patient history.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingNav() {
  return (
    <nav className="border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Heart className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-semibold">MedMemory</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Demo
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t py-12">
      <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
        <p>MedMemory — Your family&apos;s living medical memory.</p>
        <p className="mt-1">Built for families managing health across years, doctors, and distance.</p>
      </div>
    </footer>
  );
}
