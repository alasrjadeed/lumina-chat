import type { NextRequest } from "next/server";
import { getBusinessConfig } from "@/lib/business/config";
import { createLead, getLeadsByPhone } from "@/lib/db/queries";

const xmlEsc = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function twiml(body: string): Response {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const caller = String(formData.get("From") ?? "Unknown");
  const callSid = String(formData.get("CallSid") ?? "");
  const speech = String(formData.get("SpeechResult") ?? "").trim();
  const digits = String(formData.get("Digits") ?? "").trim();
  const config = getBusinessConfig();

  const existingLeads = await getLeadsByPhone({ phone: caller });
  if (existingLeads.length === 0) {
    await createLead({
      phone: caller,
      source: "call",
      status: "new",
      message: speech || `Inbound call ${callSid}`,
      serviceInterest: "Inbound phone call",
    });
  }

  const greeting = xmlEsc(
    `Hi, thank you for calling ${config.businessName}. I am your virtual office manager. ` +
      `Press 1 to hear about our services, press 2 to request a callback, or speak after the beep and I'll try to answer.`
  );

  if (!speech && !digits) {
    return twiml(
      `<Say voice="alice">${greeting}</Say><Gather input="speech dtmf" timeout="8" numDigits="1" speechTimeout="auto" action="/api/webhooks/voice"><Say voice="alice">How can I help you today?</Say></Gather>`
    );
  }

  if (digits === "1") {
    const services = config.services
      .slice(0, 4)
      .map(
        (service) =>
          `${xmlEsc(service.name)}, ${service.price} ${xmlEsc(service.unit)}`
      )
      .join(". ");
    return twiml(
      `<Say voice="alice">${xmlEsc(
        `Here are a few of our services. ${services}. Press 0 to repeat, or a team member will follow up with you.`
      )}</Say><Hangup/>`
    );
  }

  if (digits === "2") {
    return twiml(
      `<Say voice="alice">${xmlEsc(
        `I've scheduled a callback for you. A member of our team will reach out shortly. Thank you for calling ${config.businessName}.`
      )}</Say><Hangup/>`
    );
  }

  const text = speech
    ? `You said: ${speech}. I've passed this to our team and someone will follow up shortly.`
    : `I've noted your request and our team will follow up shortly. Thank you for calling ${config.businessName}.`;

  return twiml(`<Say voice="alice">${xmlEsc(text)}</Say><Hangup/>`);
}
