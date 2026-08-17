import type { ImapFlow } from "imapflow";

type ImapConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
};

function getImapConfig(): ImapConfig | null {
  const host = process.env.IMAP_HOST?.trim();
  const user = process.env.IMAP_USER?.trim();
  const pass = process.env.IMAP_PASS?.trim();

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port: Number(process.env.IMAP_PORT ?? "993"),
    user,
    pass,
    secure: process.env.IMAP_SECURE !== "false",
  };
}

export type FetchedEmail = {
  from: string;
  subject: string;
  text: string;
  date: Date;
};

export async function fetchInboxEmails({
  limit = 10,
}: {
  limit?: number;
} = {}) {
  const config = getImapConfig();
  if (!config) {
    return null;
  }

  const { ImapFlow } = await import("imapflow");
  const client: ImapFlow = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    logger: false,
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      const status = await client.status("INBOX", { messages: true });
      const total = Math.min(status.messages ?? 0, limit);
      if (total === 0) {
        return [];
      }

      const messages: FetchedEmail[] = [];
      // Fetch most recent emails first.
      const start = Math.max(1, total - limit + 1);
      for await (const message of client.fetch(`${start}:*`, {
        envelope: true,
        source: true,
      })) {
        const envelope = message.envelope;
        const source = message.source;
        if (!envelope || !source) {
          continue;
        }

        const from = envelope.from?.[0]
          ? `${envelope.from[0].name ? `${envelope.from[0].name} ` : ""}<${envelope.from[0].address ?? ""}>`
          : "";
        const text = extractText(source);

        messages.push({
          from,
          subject: envelope.subject ?? "(no subject)",
          text,
          date: envelope.date ?? new Date(),
        });

        if (messages.length >= limit) {
          break;
        }
      }

      return messages;
    } finally {
      await lock.release();
    }
  } catch (error) {
    console.error("IMAP fetch error:", error);
    return null;
  } finally {
    await client.logout().catch(() => undefined);
  }
}

function extractText(source: Buffer): string {
  try {
    // Strip HTML tags when the body is HTML; otherwise return text as-is.
    const raw = source.toString("utf8");
    const headerEnd = raw.indexOf("\r\n\r\n");
    const body = headerEnd >= 0 ? raw.slice(headerEnd + 4) : raw;
    return body
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 10_000);
  } catch {
    return "";
  }
}

export function isImapConfigured(): boolean {
  return getImapConfig() !== null;
}
