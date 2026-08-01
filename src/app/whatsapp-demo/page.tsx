"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCheck,
  CircleHelp,
  FileText,
  HeartPulse,
  Loader2,
  Paperclip,
  Plus,
  Send,
  ShieldCheck,
  Smile,
  Upload,
  Users,
  X,
} from "lucide-react";
import { usePatient } from "@/context/patient-context";
import type { PatientId } from "@/lib/types";

type FlowStep = "welcome" | "patient" | "report" | "timeline" | "attach" | "processing" | "complete";
type Sender = "bot" | "user";

interface Choice {
  label: string;
  value: string;
}

interface FakePdf {
  id: string;
  fileName: string;
  size: string;
  pages: string;
}

interface ChatMessage {
  id: string;
  sender: Sender;
  text?: string;
  time: string;
  choices?: Choice[];
  step?: FlowStep;
  attachment?: FakePdf;
  link?: {
    label: string;
    detail: string;
    href: string;
  };
}

const FAKE_PDF: FakePdf = {
  id: "family-kidney-panel",
  fileName: "Family_Kidney_Panel.pdf",
  size: "428 KB",
  pages: "2 pages",
};

const REPORT_CHOICES: Choice[] = [
  { label: "Medical report", value: "medical report" },
  { label: "Medication update", value: "medication update" },
  { label: "Appointment note", value: "appointment note" },
];

const TIMELINE_CHOICES: Choice[] = [
  { label: "Yes, update timeline", value: "yes" },
  { label: "Save it only", value: "no" },
];

let messageSequence = 0;

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    sender: "bot",
    time: "10:24 AM",
    text: "Hi! I am the MedMemory assistant. I can save a report and update your family health timeline. Reply with Hi or any message to start.",
    choices: [{ label: "Hi", value: "hi" }],
    step: "welcome",
  },
];

function createMessageId(prefix: string) {
  messageSequence += 1;
  return `${prefix}-${messageSequence}`;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function MessageStatus() {
  return (
    <span className="ml-1 inline-flex align-middle text-[#667781]">
      <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
    </span>
  );
}

function PdfPreview({ file, compact = false }: { file: FakePdf; compact?: boolean }) {
  return (
    <div className={compact ? "flex items-center gap-3" : "flex items-center gap-3 rounded-xl border border-[#d9e7df] bg-white p-3"}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ee] text-[#128c7e]">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#263238]">{file.fileName}</p>
        <p className="mt-0.5 text-xs text-[#667781]">PDF · {file.pages} · {file.size}</p>
      </div>
    </div>
  );
}

export default function WhatsAppDemoPage() {
  const { data, refreshData, setActivePatient } = usePatient();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [step, setStep] = useState<FlowStep>("welcome");
  const [input, setInput] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientId>("mother");
  const [selectedReportType, setSelectedReportType] = useState("medical report");
  const [selectedTimelineChoice, setSelectedTimelineChoice] = useState("yes");
  const [isAttachmentTrayOpen, setIsAttachmentTrayOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const appendMessage = (message: Omit<ChatMessage, "id">) => {
    setMessages((current) => [
      ...current,
      { ...message, id: createMessageId(message.sender) },
    ]);
  };

  const queueBotMessage = (message: Omit<ChatMessage, "id" | "sender">, delay = 360) => {
    window.setTimeout(() => {
      appendMessage({ ...message, sender: "bot" });
    }, delay);
  };

  const handleResponse = (value: string, displayText = value) => {
    if (isProcessing) return;

    appendMessage({ sender: "user", text: displayText, time: "10:25 AM" });

    if (step === "welcome") {
      setStep("patient");
      queueBotMessage({
        text: "Thanks! Which family member is this report for?",
        time: "10:25 AM",
        choices: [
          { label: "Mom · Lakshmi Devi", value: "mother" },
          { label: "Dad · Ramesh Kumar", value: "father" },
        ],
        step: "patient",
      });
      return;
    }

    if (step === "patient") {
      const patientId: PatientId = value === "father" || value.toLowerCase().includes("dad") ? "father" : "mother";
      const patientName = data.patients[patientId].patient.name;
      setSelectedPatient(patientId);
      setStep("report");
      queueBotMessage({
        text: `Got it. I will keep this under ${patientName}. What would you like to send?`,
        time: "10:26 AM",
        choices: REPORT_CHOICES,
        step: "report",
      });
      return;
    }

    if (step === "report") {
      const reportType = value || "medical report";
      setSelectedReportType(reportType);
      setStep("timeline");
      queueBotMessage({
        text: `Understood. Should I add this ${reportType.toLowerCase()} to the living medical timeline?`,
        time: "10:27 AM",
        choices: TIMELINE_CHOICES,
        step: "timeline",
      });
      return;
    }

    if (step === "timeline") {
      setSelectedTimelineChoice(value);
      setStep("attach");
      queueBotMessage({
        text: value === "yes"
          ? "Perfect. Tap the paperclip below, then drag the sample PDF into this chat."
          : "No problem. I will save the report for your family. Tap the paperclip below to attach it.",
        time: "10:28 AM",
      });
      return;
    }

    if (step === "attach") {
      queueBotMessage({
        text: "Please attach the sample PDF with the paperclip button. I will process it as soon as it arrives.",
        time: "10:28 AM",
      });
      return;
    }

    if (step === "complete") {
      queueBotMessage({
        text: "The report is ready. Use the dashboard link above to see the updated family record.",
        time: "10:31 AM",
      });
    }
  };

  const processFakePdf = async () => {
    if (isProcessing) return;

    const patientName = data.patients[selectedPatient].patient.name;
    setIsAttachmentTrayOpen(false);
    setIsDragging(false);
    setIsProcessing(true);
    setStep("processing");

    appendMessage({
      sender: "user",
      time: "10:29 AM",
      attachment: FAKE_PDF,
    });
    appendMessage({
      sender: "bot",
      time: "10:29 AM",
      text: `Thanks. I received ${FAKE_PDF.fileName}. I am checking the file now.`,
    });

    await wait(800);
    appendMessage({
      sender: "bot",
      time: "10:30 AM",
      text: `I found a kidney panel in the PDF. I am adding the report to ${patientName}'s medical memory.`,
    });

    try {
      const response = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient,
          fileName: FAKE_PDF.fileName,
          reportType: selectedReportType,
          updateTimeline: selectedTimelineChoice === "yes",
        }),
      });

      if (!response.ok) throw new Error("Report processing failed");

      await response.json();
      await setActivePatient(selectedPatient);
      await refreshData();
      setStep("complete");
      appendMessage({
        sender: "bot",
        time: "10:31 AM",
        text: `Done. ${patientName}'s report is now connected to the family record.`,
      });
      appendMessage({
        sender: "bot",
        time: "10:31 AM",
        link: {
          label: "Open MedMemory dashboard",
          detail: "See the updated timeline, report, and medicines",
          href: "/dashboard",
        },
      });
    } catch {
      setStep("attach");
      appendMessage({
        sender: "bot",
        time: "10:31 AM",
        text: "I could not process the sample PDF. Tap the paperclip and try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAttachmentClick = () => {
    if (isProcessing) return;
    if (step !== "attach") {
      appendMessage({
        sender: "bot",
        time: "10:28 AM",
        text: "I will open the sample attachment after we finish the quick check-in above.",
      });
      return;
    }
    setIsAttachmentTrayOpen((open) => !open);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (step !== "attach" || isProcessing) return;

    if (event.dataTransfer.getData("text/plain") === FAKE_PDF.id) {
      void processFakePdf();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    if (!value || isProcessing) return;
    setInput("");
    handleResponse(value);
  };

  const activePatient = data.patients[selectedPatient].patient;

  return (
    <main className="min-h-screen bg-[#d9dbd5] lg:p-8">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <section className="flex h-screen w-full flex-col overflow-hidden bg-[#efeae2] shadow-2xl lg:h-[calc(100vh-4rem)] lg:max-h-[900px] lg:rounded-3xl">
          <header className="flex shrink-0 items-center justify-between bg-[#075e54] px-4 py-3 text-white sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-full p-1.5 transition hover:bg-white/10"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-[#075e54] shadow-sm">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold sm:text-base">MedMemory</p>
                <p className="text-xs text-white/75">Family health assistant · online</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/90 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-[#8be28f]" />
              Demo chat
            </div>
          </header>

          <div className="flex shrink-0 items-center justify-between border-b border-[#d8e1dc] bg-[#f0f2f5] px-4 py-2.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 text-xs text-[#54656f] sm:text-sm">
              <Users className="h-4 w-4 shrink-0 text-[#128c7e]" />
              <span className="truncate">Demo family inbox</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#667781]">
              <span className="h-2 w-2 rounded-full bg-[#25d366]" />
              Live simulation
            </div>
          </div>

          <div
            className={`relative flex-1 overflow-y-auto px-3 py-5 transition sm:px-8 ${isDragging ? "bg-[#e1f4e7]" : ""}`}
            style={{
              backgroundImage: "radial-gradient(#d9d1c7 0.7px, transparent 0.7px)",
              backgroundSize: "16px 16px",
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (step === "attach" && !isProcessing) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="mx-auto max-w-2xl space-y-3">
              <div className="mx-auto mb-5 w-fit rounded-lg bg-[#fff4c6] px-3 py-1 text-[11px] text-[#54656f] shadow-sm">
                Today
              </div>

              {messages.map((message) => {
                const isBot = message.sender === "bot";
                const canChoose = message.step === step && !isProcessing;

                return (
                  <div key={message.id} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`relative max-w-[92%] rounded-xl px-3 py-2 text-sm shadow-sm sm:max-w-[78%] ${
                        isBot
                          ? "rounded-tl-sm bg-white text-[#263238]"
                          : "rounded-tr-sm bg-[#d9fdd3] text-[#1f2c33]"
                      }`}
                    >
                      {message.text && (
                        <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
                      )}

                      {message.attachment && (
                        <div className={message.text ? "mt-2" : "min-w-[230px]"}>
                          <PdfPreview file={message.attachment} compact />
                        </div>
                      )}

                      {message.link && (
                        <Link
                          href={message.link.href}
                          className="group block min-w-[250px] rounded-lg border border-[#cbe4d4] bg-[#f3fbf5] p-3 transition hover:border-[#128c7e] hover:bg-[#e8f7eb]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-[#075e54]">{message.link.label}</p>
                              <p className="mt-1 text-xs text-[#667781]">{message.link.detail}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-[#128c7e] transition group-hover:translate-x-0.5" />
                          </div>
                        </Link>
                      )}

                      {message.choices && (
                        <div className="mt-3 grid gap-2">
                          {message.choices.map((choice) => (
                            <button
                              key={choice.value}
                              type="button"
                              disabled={!canChoose}
                              onClick={() => handleResponse(choice.value, choice.label)}
                              className="rounded-lg border border-[#b7d9c5] bg-[#f7fffa] px-3 py-2 text-left text-sm font-medium text-[#075e54] transition hover:border-[#128c7e] hover:bg-[#e7f7ec] disabled:cursor-default disabled:opacity-55"
                            >
                              {choice.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isBot ? "text-[#8696a0]" : "text-[#667781]"}`}>
                        {message.time}
                        {!isBot && <MessageStatus />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-xl rounded-tl-sm bg-white px-4 py-3 text-xs text-[#667781] shadow-sm">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#128c7e]" />
                    MedMemory is typing...
                  </div>
                </div>
              )}

              {isDragging && (
                <div className="pointer-events-none absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-center">
                  <div className="rounded-2xl border-2 border-dashed border-[#128c7e] bg-white/95 px-8 py-6 text-center shadow-xl">
                    <Upload className="mx-auto h-8 w-8 text-[#128c7e]" />
                    <p className="mt-2 font-semibold text-[#075e54]">Drop the PDF here</p>
                    <p className="mt-1 text-xs text-[#667781]">MedMemory will process the report</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative shrink-0 border-t border-[#d8e1dc] bg-[#f0f2f5] px-3 pb-3 pt-2 sm:px-6">
            {isAttachmentTrayOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl border border-[#d5e2db] bg-white p-4 shadow-xl sm:left-6 sm:right-auto sm:w-[360px]">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#263238]">Attachments</p>
                    <p className="text-xs text-[#667781]">Drag the sample PDF into the chat</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAttachmentTrayOpen(false)}
                    className="rounded-full p-1.5 text-[#667781] transition hover:bg-[#f0f2f5]"
                    aria-label="Close attachments"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", FAKE_PDF.id);
                    event.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => void processFakePdf()}
                  className="cursor-grab rounded-xl border border-dashed border-[#9ccbad] bg-[#f5fff8] p-3 transition hover:border-[#128c7e] hover:bg-[#eaf8ee] active:cursor-grabbing"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") void processFakePdf();
                  }}
                >
                  <PdfPreview file={FAKE_PDF} />
                  <p className="mt-2 text-center text-[11px] font-medium text-[#128c7e]">Click to attach or drag into the chat</p>
                </div>
              </div>
            )}

            <form className="mx-auto flex max-w-2xl items-center gap-2" onSubmit={handleSubmit}>
              <button
                type="button"
                onClick={handleAttachmentClick}
                disabled={isProcessing}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#54656f] transition hover:bg-[#e2e6e8] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Open attachments"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <div className="flex min-w-0 flex-1 items-center rounded-full bg-white px-3 shadow-sm">
                <Smile className="mr-2 h-5 w-5 shrink-0 text-[#8696a0]" />
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={step === "complete" ? "Send another message" : "Type a message"}
                  disabled={isProcessing}
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[#263238] outline-none placeholder:text-[#8696a0] disabled:cursor-not-allowed"
                  aria-label="Message MedMemory"
                />
                <button
                  type="button"
                  className="ml-2 text-[#8696a0]"
                  aria-label="Add an item"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <button
                type={input.trim() ? "submit" : "button"}
                onClick={() => {
                  if (!input.trim() && step === "attach") void processFakePdf();
                }}
                disabled={isProcessing}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#128c7e] text-white shadow-sm transition hover:bg-[#075e54] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={input.trim() ? "Send message" : "Send sample PDF"}
              >
                {input.trim() ? <Send className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
              </button>
            </form>

            <div className="mx-auto mt-2 flex max-w-2xl items-center justify-center gap-1 text-[10px] text-[#8696a0]">
              <CircleHelp className="h-3 w-3" />
              This is a deterministic demo. No real WhatsApp messages are sent.
            </div>
          </div>
        </section>
      </div>

      <div className="sr-only">
        <p>Selected patient: {activePatient.name}</p>
      </div>
    </main>
  );
}
