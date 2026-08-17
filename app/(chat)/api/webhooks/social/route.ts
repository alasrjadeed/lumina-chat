import { type NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const platform = String(request.headers.get("x-platform") ?? "social");
    const message =
      body.message ?? body.text ?? body.body ?? body.msg?.text ?? "";
    const senderName =
      body.name ?? body.senderName ?? body.sender?.name ?? body.user?.name;
    const senderId =
      body.userId ?? body.senderId ?? body.sender?.id ?? body.user?.id;
    const channel = senderId || senderName ? "social" : "manual";

    await createLead({
      name: senderName ? String(senderName) : undefined,
      phone: senderId ? String(senderId) : undefined,
      source: channel,
      status: "new",
      message: String(message),
      serviceInterest: `Inbound ${platform} message`,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Social webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
