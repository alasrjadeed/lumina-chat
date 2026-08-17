"use client";

import {
  BriefcaseBusinessIcon,
  CalendarIcon,
  CheckCircle2Icon,
  InboxIcon,
  Loader2Icon,
  MailIcon,
  PhoneCallIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getBusinessConfig } from "@/lib/business/config";

type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string;
  status: string;
  serviceInterest: string | null;
  message: string | null;
  createdAt: string;
};

type Appointment = {
  id: string;
  title: string;
  clientName: string | null;
  clientEmail: string | null;
  startTime: string;
  endTime: string;
  status: string;
  channel: string;
};

type EmailThread = {
  id: string;
  from: string | null;
  subject: string;
  unread: boolean;
  lastMessageAt: string;
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600",
  contacted: "bg-yellow-500/10 text-yellow-600",
  qualified: "bg-purple-500/10 text-purple-600",
  proposal: "bg-orange-500/10 text-orange-600",
  won: "bg-green-500/10 text-green-600",
  lost: "bg-red-500/10 text-red-600",
  requested: "bg-blue-500/10 text-blue-600",
  confirmed: "bg-green-500/10 text-green-600",
  cancelled: "bg-red-500/10 text-red-600",
};

export default function OfficePage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [emailThreads, setEmailThreads] = useState<EmailThread[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setError(null);
    fetch("/api/business")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load data (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        setLeads(data.leads ?? []);
        setAppointments(data.appointments ?? []);
      })
      .catch((err: Error) => setError(err.message));

    fetch("/api/email")
      .then((res) => (res.ok ? res.json() : { threads: [] }))
      .then((data) => setEmailThreads(data.threads ?? []))
      .catch(() => setEmailThreads([]));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadData intentionally runs once on mount
  useEffect(() => {
    loadData();
  }, []);

  const config = getBusinessConfig();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <BriefcaseBusinessIcon className="size-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Office manager
          </h1>
          <p className="text-sm text-muted-foreground">
            {config.businessName} — leads, meetings, and inbound channels
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <UserIcon className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-medium">Leads</h2>
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {leads === null ? "..." : leads.length}
            </span>
          </div>
          <div className="space-y-3">
            {leads === null && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" /> Loading leads...
              </div>
            )}
            {leads?.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <InboxIcon className="size-4" /> No leads yet. New WhatsApp,
                call, and social inbound messages will appear here.
              </div>
            )}
            {leads?.map((lead) => (
              <div
                className="rounded-lg border border-border/60 bg-card p-4 shadow-[var(--shadow-float)]"
                key={lead.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {lead.name ?? "Anonymous"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {lead.email && (
                        <span className="flex items-center gap-1">
                          <MailIcon className="size-3" /> {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <PhoneCallIcon className="size-3" /> {lead.phone}
                        </span>
                      )}
                      <span className="capitalize">via {lead.source}</span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[lead.status] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {lead.status}
                  </span>
                </div>
                {lead.serviceInterest && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Interested in: {lead.serviceInterest}
                  </p>
                )}
                {lead.message && (
                  <p className="mt-1 line-clamp-2 text-sm text-foreground/80">
                    {lead.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <CalendarIcon className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-medium">Meetings</h2>
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {appointments === null ? "..." : appointments.length}
            </span>
          </div>
          <div className="space-y-3">
            {appointments === null && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" /> Loading
                meetings...
              </div>
            )}
            {appointments?.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2Icon className="size-4" /> No meetings scheduled
                yet.
              </div>
            )}
            {appointments?.map((appointment) => (
              <div
                className="rounded-lg border border-border/60 bg-card p-4 shadow-[var(--shadow-float)]"
                key={appointment.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{appointment.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {appointment.clientName ?? "No client name"} —{" "}
                      {new Date(appointment.startTime).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[appointment.status] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {appointment.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground capitalize">
                  Booked via {appointment.channel}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <MailIcon className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-medium">Email inbox</h2>
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {emailThreads === null ? "..." : emailThreads.length}
            </span>
          </div>
          <div className="space-y-3">
            {emailThreads === null && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" /> Loading inbox...
              </div>
            )}
            {emailThreads?.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <InboxIcon className="size-4" /> No email threads yet. Inbound
                email will appear here once IMAP is configured.
              </div>
            )}
            {emailThreads?.map((thread) => (
              <div
                className="rounded-lg border border-border/60 bg-card p-4 shadow-[var(--shadow-float)]"
                key={thread.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {thread.unread && (
                        <span className="mr-1.5 inline-block size-1.5 rounded-full bg-blue-500 align-middle" />
                      )}
                      {thread.subject}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {thread.from ?? "Unknown sender"} —{" "}
                      {new Date(thread.lastMessageAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  {thread.unread && (
                    <span className="shrink-0 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                      unread
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
