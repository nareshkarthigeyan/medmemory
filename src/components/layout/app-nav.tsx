"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Upload,
  FileText,
  AlertTriangle,
  Settings,
  Heart,
  Menu,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePatient } from "@/context/patient-context";
import type { PatientId } from "@/lib/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/doctor-brief", label: "Doctor Brief", icon: FileText },
  { href: "/emergency", label: "Emergency", icon: AlertTriangle },
  { href: "/whatsapp-demo", label: "WhatsApp Demo", icon: MessageCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function PatientSwitcher() {
  const { activePatientId, setActivePatient, data } = usePatient();

  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Family
      </p>
      {(Object.keys(data.patients) as PatientId[]).map((id) => {
        const p = data.patients[id].patient;
        const active = activePatientId === id;
        return (
          <button
            key={id}
            onClick={() => setActivePatient(id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all",
              active
                ? "bg-primary/10 ring-1 ring-primary/20"
                : "hover:bg-muted"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {p.avatar}
            </div>
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.relationship}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex h-full w-64 flex-col border-r bg-sidebar p-4", className)}>
      <Link href="/dashboard" className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Heart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <span className="text-lg font-semibold tracking-tight">MedMemory</span>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Living medical memory
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
          />
        ))}
      </nav>

      <div className="mt-4 border-t pt-4">
        <PatientSwitcher />
      </div>
    </aside>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const current = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <header className="no-print flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm lg:px-8">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 p-0">
            <AppSidebar />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold">{current?.label ?? "MedMemory"}</h1>
      </div>
      <Link href="/">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          Home
        </Button>
      </Link>
    </header>
  );
}
