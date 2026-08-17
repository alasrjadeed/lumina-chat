import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { fetchInboxEmails, isImapConfigured } from "@/lib/business/imap";
import {
  addEmailMessage,
  createLead,
  getLeadsByEmail,
  upsertEmailThread,
} from "@/lib/db/queries";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!isImapConfigured()) {
    return NextResponse.json(
      { ok: false, error: "IMAP is not configured" },
      { status: 400 }
    );
  }

  try {
    const emails = await fetchInboxEmails({ limit: 10 });

    if (!emails) {
      return NextResponse.json(
        { ok: false, error: "Failed to fetch inbox" },
        { status: 502 }
      );
    }

    let synced = 0;

    for (const email of emails) {
      const emailAddress = email.from.match(/<([^>]+)>/)?.[1] ?? email.from;
      if (!emailAddress) {
        continue;
      }

      const existingLeads = await getLeadsByEmail({ email: emailAddress });
      let leadId = existingLeads[0]?.id;

      if (!leadId) {
        const [lead] = await createLead({
          name: email.from,
          email: emailAddress,
          source: "email",
          status: "new",
          message: email.text.slice(0, 500),
          serviceInterest: "Inbound email",
        });
        leadId = lead.id;
      }

      const thread = await upsertEmailThread({
        from: emailAddress,
        subject: email.subject,
        leadId,
      });

      await addEmailMessage({
        threadId: thread.id,
        from: emailAddress,
        to: process.env.SMTP_FROM,
        subject: email.subject,
        body: email.text,
        direction: "inbound",
      });

      synced += 1;
    }

    return NextResponse.json({ ok: true, synced });
  } catch (error) {
    console.error("Email sync error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
