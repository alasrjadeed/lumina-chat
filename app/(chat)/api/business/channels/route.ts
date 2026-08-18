import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getChannelById,
  getChannelsByBusinessId,
  updateChannel,
} from "@/lib/db/queries";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");
    if (!businessId) {
      return NextResponse.json(
        { error: "businessId is required" },
        { status: 400 }
      );
    }

    const channels = await getChannelsByBusinessId(businessId);
    return NextResponse.json({ ok: true, channels });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, config, isEnabled } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      );
    }

    const existing = await getChannelById(id);
    if (!existing) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const updated = await updateChannel(id, {
      ...(config !== undefined && { config }),
      ...(isEnabled !== undefined && { isEnabled }),
    });

    return NextResponse.json({ ok: true, channel: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, config } = await request.json();

    if (type === "email") {
      const { host, port, user, pass, from } = config || {};
      if (!host || !user || !pass) {
        return NextResponse.json({
          ok: false,
          error: "SMTP not configured. Set host, username, and password.",
        });
      }

      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          host,
          port: Number(port) || 587,
          secure: Number(port) === 465,
          auth: { user, pass },
        });
        await transporter.verify();
        return NextResponse.json({ ok: true, message: "SMTP connection verified" });
      } catch (err) {
        return NextResponse.json({
          ok: false,
          error: `SMTP test failed: ${err instanceof Error ? err.message : "unknown error"}`,
        });
      }
    }

    if (type === "whatsapp") {
      const { token, phoneNumberId } = config || {};
      if (!token || !phoneNumberId) {
        return NextResponse.json({
          ok: false,
          error: "WhatsApp not configured. Set access token and phone number ID.",
        });
      }

      try {
        const res = await fetch(
          `https://graph.facebook.com/v19.0/${phoneNumberId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          const data = await res.json();
          return NextResponse.json({
            ok: false,
            error: data.error?.message || "WhatsApp API test failed",
          });
        }
        return NextResponse.json({ ok: true, message: "WhatsApp connection verified" });
      } catch (err) {
        return NextResponse.json({
          ok: false,
          error: `WhatsApp test failed: ${err instanceof Error ? err.message : "unknown error"}`,
        });
      }
    }

    if (type === "twilio") {
      const { accountSid, authToken } = config || {};
      if (!accountSid || !authToken) {
        return NextResponse.json({
          ok: false,
          error: "Twilio not configured. Set account SID and auth token.",
        });
      }

      try {
        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            },
          }
        );
        if (!res.ok) {
          return NextResponse.json({
            ok: false,
            error: "Twilio credentials invalid",
          });
        }
        return NextResponse.json({ ok: true, message: "Twilio connection verified" });
      } catch (err) {
        return NextResponse.json({
          ok: false,
          error: `Twilio test failed: ${err instanceof Error ? err.message : "unknown error"}`,
        });
      }
    }

    return NextResponse.json(
      { error: `Unknown channel type: ${type}` },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
