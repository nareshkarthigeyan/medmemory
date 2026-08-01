"use client";

import { useState } from "react";
import { MessageCircle, RefreshCw, Users, Bell } from "lucide-react";
import { usePatient } from "@/context/patient-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { activePatientId, refreshData } = usePatient();
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappReply, setWhatsappReply] = useState<string | null>(null);

  const simulateWhatsApp = async () => {
    setWhatsappLoading(true);
    setWhatsappReply(null);

    await new Promise((r) => setTimeout(r, 2000));

    const res = await fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: activePatientId,
        fileName: "kidney-report.jpg",
      }),
    });
    const data = await res.json();
    setWhatsappReply(data.reply);
    await refreshData();
    setWhatsappLoading(false);
  };

  const resetDemo = async () => {
    await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    await refreshData();
    setWhatsappReply(null);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 lg:p-8">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage family members and integrations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Family Members
          </CardTitle>
          <CardDescription>
            Switch between family members using the sidebar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Lakshmi Devi (Mother) — Diabetes, Kidney Disease</p>
            <p>Ramesh Kumar (Father) — Hypertension, Heart Disease</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" />
            WhatsApp Integration
          </CardTitle>
          <CardDescription>
            Simulate a parent sending a report via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={simulateWhatsApp} disabled={whatsappLoading}>
            {whatsappLoading ? (
              <>Processing...</>
            ) : (
              <>
                <MessageCircle className="mr-2 h-4 w-4" />
                Simulate WhatsApp Report
              </>
            )}
          </Button>

          {whatsappReply && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4">
              <Badge className="mb-2 bg-green-100 text-green-800 hover:bg-green-100">
                WhatsApp Reply
              </Badge>
              <pre className="whitespace-pre-wrap text-sm text-green-900 font-sans">
                {whatsappReply}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
          <CardDescription>
            Family members are notified when new reports are processed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Notifications appear on the dashboard when reports are uploaded or received via WhatsApp.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RefreshCw className="h-4 w-4" />
            Demo Controls
          </CardTitle>
          <CardDescription>Reset demo data to initial state</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={resetDemo}>
            Reset Demo Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
