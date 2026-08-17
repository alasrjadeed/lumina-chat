import { tool } from "ai";
import { z } from "zod";
import {
  businessSummary,
  getBusinessConfig,
  getServiceById,
} from "@/lib/business/config";
import { sendEmail } from "@/lib/business/email";
import { makeOutboundCall } from "@/lib/business/twilio";
import { sendWhatsApp } from "@/lib/business/whatsapp";
import {
  createAppointment,
  createLead,
  getAppointments,
  getEmailMessagesByThreadId,
  getEmailThreads,
  getLeadsByEmail,
  updateAppointmentStatus,
  updateLeadStatus,
} from "@/lib/db/queries";

export const getBusinessInfo = tool({
  description:
    "Get general information about the business: services offered, pricing, contact details, hours of operation, and payment terms. Use this before answering questions about the company's offerings or prices.",
  inputSchema: z.object({}),
  execute: () => {
    return { info: businessSummary() };
  },
});

export const getServiceQuote = tool({
  description:
    "Get a detailed quote for one or more business services. The user can request one or multiple services. Computes total price and required deposit.",
  inputSchema: z.object({
    serviceIds: z
      .array(z.string())
      .describe(
        "IDs of requested services (e.g., 'seo-growth', 'web-business')."
      ),
  }),
  execute: ({ serviceIds }) => {
    const services = serviceIds
      .map((id) => getServiceById(id))
      .filter((service): service is NonNullable<typeof service> =>
        Boolean(service)
      );

    if (services.length === 0) {
      const available = getBusinessConfig()
        .services.map((service) => `${service.id}: ${service.name}`)
        .join(", ");
      return {
        error: `No matching services found. Available services: ${available}`,
      };
    }

    const total = services.reduce((sum, service) => sum + service.price, 0);
    const deposit = Math.round(total * 0.5);

    return {
      services: services.map((service) => ({
        id: service.id,
        name: service.name,
        price: service.price,
        unit: service.unit,
      })),
      total,
      deposit,
      paymentTerms: getBusinessConfig().paymentTerms,
      message: `Total quote is $${total.toLocaleString("en-US")} with a $${deposit.toLocaleString("en-US")} deposit to start.`,
    };
  },
});

export const createLeadRecord = tool({
  description:
    "Record a new sales lead from a customer who is interested in services, requested a quote, or wants to be contacted. Extract as much contact info as possible from the conversation.",
  inputSchema: z.object({
    name: z.string().optional().describe("Customer name"),
    email: z.string().optional().describe("Customer email"),
    phone: z.string().optional().describe("Customer phone number"),
    company: z.string().optional().describe("Company name"),
    source: z
      .enum(["website", "whatsapp", "call", "email", "social", "manual"])
      .optional()
      .describe("Where the lead came from"),
    serviceInterest: z
      .string()
      .optional()
      .describe("Which services they're interested in"),
    budget: z.string().optional().describe("Their budget if shared"),
    message: z.string().optional().describe("Their message or request"),
  }),
  execute: async (input) => {
    const [recorded] = await createLead({
      ...input,
      source: input.source ?? "website",
    });
    if (!recorded) {
      return { ok: false, error: "Failed to create lead record." };
    }
    return {
      ok: true,
      leadId: recorded.id,
      message: `Lead recorded${recorded.name ? ` for ${recorded.name}` : ""}. We'll follow up soon.`,
    };
  },
});

export const getLeadStatus = tool({
  description:
    "Look up existing leads by email address to check status or avoid creating duplicates.",
  inputSchema: z.object({
    email: z.string().describe("Customer email to look up"),
  }),
  execute: async ({ email }) => {
    const leads = await getLeadsByEmail({ email });
    if (leads.length === 0) {
      return {
        found: false,
        message: "No existing lead found for this email.",
      };
    }
    return {
      found: true,
      leads: leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        status: lead.status,
        serviceInterest: lead.serviceInterest,
        createdAt: lead.createdAt,
      })),
    };
  },
});

export const updateLeadRecord = tool({
  description:
    "Update the status or notes of an existing lead (e.g., mark as qualified or won).",
  inputSchema: z.object({
    id: z.string().describe("Lead ID"),
    status: z
      .enum(["new", "contacted", "qualified", "proposal", "won", "lost"])
      .describe("New lead status"),
    notes: z.string().optional().describe("Notes to append"),
  }),
  execute: async ({ id, status, notes }) => {
    const [updated] = await updateLeadStatus({ id, status, notes });
    if (!updated) {
      return { ok: false, error: `Lead ${id} not found.` };
    }
    return {
      ok: true,
      leadId: updated.id,
      status: updated.status,
      message: `Lead ${updated.name ?? ""} marked as ${status}.`,
    };
  },
});

export const scheduleMeeting = tool({
  description:
    "Schedule a meeting/appointment with a client. Provide the desired date/time and duration; the system stores it for follow-up confirmation.",
  inputSchema: z.object({
    clientName: z.string().optional(),
    clientEmail: z.string().optional(),
    clientPhone: z.string().optional(),
    title: z.string().describe("Topic or purpose of the meeting"),
    startTime: z
      .string()
      .describe(
        "Desired start date/time in ISO 8601 format (e.g., 2026-08-20T15:00:00)"
      ),
    durationMinutes: z
      .number()
      .int()
      .positive()
      .describe("Meeting duration in minutes")
      .default(60),
    channel: z
      .enum(["website", "whatsapp", "call", "email", "social", "manual"])
      .optional(),
    notes: z.string().optional(),
  }),
  execute: async ({
    clientName,
    clientEmail,
    clientPhone,
    title,
    startTime,
    durationMinutes,
    channel,
    notes,
  }) => {
    const start = new Date(startTime);
    if (Number.isNaN(start.getTime())) {
      return { ok: false, error: `Invalid date/time: ${startTime}` };
    }
    const end = new Date(start.getTime() + durationMinutes * 60_000);

    const [created] = await createAppointment({
      title,
      clientName,
      clientEmail,
      clientPhone,
      startTime: start,
      endTime: end,
      channel: channel ?? "website",
      notes,
    });

    return {
      ok: true,
      appointmentId: created.id,
      title,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      message: `Meeting scheduled on ${start.toLocaleString("en-US")} for ${durationMinutes} minutes. Status: requested (pending confirmation).`,
    };
  },
});

export const listMeetings = tool({
  description:
    "List upcoming meetings/appointments. Optionally filter by date range. Useful when a client asks about availability or you need to check the calendar.",
  inputSchema: z.object({
    from: z.string().optional().describe("Start of range in ISO 8601"),
    to: z.string().optional().describe("End of range in ISO 8601"),
  }),
  execute: async ({ from, to }) => {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    if (fromDate && Number.isNaN(fromDate.getTime())) {
      return { ok: false, error: `Invalid from date: ${from}` };
    }
    if (toDate && Number.isNaN(toDate.getTime())) {
      return { ok: false, error: `Invalid to date: ${to}` };
    }

    const appointments = await getAppointments({
      from: fromDate,
      to: toDate,
    });
    return {
      appointments: appointments.map((appointment) => ({
        id: appointment.id,
        title: appointment.title,
        clientName: appointment.clientName,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        status: appointment.status,
        channel: appointment.channel,
      })),
      count: appointments.length,
    };
  },
});

export const confirmMeeting = tool({
  description: "Confirm or cancel a requested meeting/appointment by ID.",
  inputSchema: z.object({
    appointmentId: z.string().describe("Appointment ID"),
    action: z
      .enum(["confirmed", "cancelled"])
      .describe("Confirm or cancel the appointment"),
  }),
  execute: async ({ appointmentId, action }) => {
    const [updated] = await updateAppointmentStatus({
      id: appointmentId,
      status: action,
    });
    if (!updated) {
      return { ok: false, error: `Appointment ${appointmentId} not found.` };
    }
    return {
      ok: true,
      appointmentId: updated.id,
      status: updated.status,
      message: `Appointment ${updated.title} is now ${updated.status}.`,
    };
  },
});

export const sendEmailMessage = tool({
  description:
    "Send an email to a client or any recipient. Only use when SMTP is configured. Use for sending quotes, confirmations, or answering a client's email.",
  inputSchema: z.object({
    to: z.string().email().describe("Recipient email address"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Plain text email body"),
  }),
  execute: async ({ to, subject, body }) => {
    const result = await sendEmail({ to, subject, text: body });
    return result;
  },
});

export const sendWhatsAppMessage = tool({
  description:
    "Send a WhatsApp message to a client. Only use when WhatsApp is configured. Use for following up on quotes or answering clients who reach out on WhatsApp.",
  inputSchema: z.object({
    to: z
      .string()
      .describe(
        "Recipient WhatsApp number in E.164 format (e.g., +15551234567)"
      ),
    text: z.string().describe("Message text"),
  }),
  execute: async ({ to, text }) => {
    const result = await sendWhatsApp({ to, text });
    return result;
  },
});

export const makePhoneCall = tool({
  description:
    "Place an outbound phone call to a client via Twilio. The call plays a greeting and lets the bot answer. Only use when Twilio is configured.",
  inputSchema: z.object({
    to: z
      .string()
      .describe("Recipient phone number in E.164 format (e.g., +15551234567)"),
  }),
  execute: async ({ to }) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      process.env.VERCEL_URL ??
      "http://localhost:3000";
    const origin = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;

    const result = await makeOutboundCall({
      to,
      twimlUrl: `${origin}/api/webhooks/voice`,
    });

    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    return {
      ok: true,
      callSid: result.callSid,
      message: `Outbound call to ${to} initiated (SID ${result.callSid}).`,
    };
  },
});

export const listEmailInbox = tool({
  description:
    "List recent email threads in the office inbox. Use when a client says they emailed you or you need to check incoming email.",
  inputSchema: z.object({
    limit: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Max threads to return"),
  }),
  execute: async ({ limit }) => {
    const threads = await getEmailThreads({ limit: limit ?? 10 });
    return {
      count: threads.length,
      threads: threads.map((thread) => ({
        id: thread.id,
        from: thread.from,
        subject: thread.subject,
        unread: thread.unread,
        lastMessageAt: thread.lastMessageAt.toISOString(),
      })),
    };
  },
});

export const readEmailThread = tool({
  description:
    "Read the messages in a specific email thread by ID so you can answer the client's email.",
  inputSchema: z.object({
    threadId: z.string().describe("Email thread ID (from listEmailInbox)"),
  }),
  execute: async ({ threadId }) => {
    const messages = await getEmailMessagesByThreadId({ threadId });
    return {
      count: messages.length,
      messages: messages.map((message) => ({
        from: message.from,
        to: message.to,
        subject: message.subject,
        body: message.body,
        direction: message.direction,
        createdAt: message.createdAt.toISOString(),
      })),
    };
  },
});

export const businessTools = {
  getBusinessInfo,
  getServiceQuote,
  createLeadRecord,
  getLeadStatus,
  updateLeadRecord,
  scheduleMeeting,
  listMeetings,
  confirmMeeting,
  sendEmailMessage,
  sendWhatsAppMessage,
  makePhoneCall,
  listEmailInbox,
  readEmailThread,
};
