import { createHmac } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/business/whatsapp";
import { createLead } from "@/lib/db/queries";

async function verifySignature(request: NextRequest): Promise<boolean> {
  const token = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (!token) {
    console.error(
      "WHATSAPP_WEBHOOK_VERIFY_TOKEN is not set. Webhook is unauthenticated."
    );
    return false;
  }
  const xHub = request.headers.get("x-hub-signature-256");
  if (!xHub) {
    return false;
  }
  const rawBody = await request.text();
  const expected = `sha256=${createHmac("sha256", token).update(rawBody).digest("hex")}`;
  return xHub === expected;
}

export function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  if (!(await verifySignature(request))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const rawBody = await request.text();
  let payload: Record<string, any>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value ?? {};
        const messages = value.messages ?? [];

        for (const msg of messages) {
          if (msg.type !== "text") {
            continue;
          }

          const from = msg.from;
          const text = msg.text?.body ?? "";
          const contact = value.contacts?.[0]?.profile?.name;

          await createLead({
            name: contact,
            phone: from,
            source: "whatsapp",
            message: text,
            serviceInterest: "Inbound WhatsApp message",
            status: "new",
          });

          await sendWhatsApp({
            to: from,
            text: `Hi ${contact ?? "there"}! Thanks for reaching out to MonkeyCode Digital. Our office manager will get back to you shortly. In the meantime, feel free to ask about our SEO, web design, or social media services.`,
          });
        }
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
