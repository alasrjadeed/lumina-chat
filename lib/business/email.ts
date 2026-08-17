import nodemailer, { type Transporter } from "nodemailer";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim() || user;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port: Number(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    user,
    pass,
    from: from ?? "",
  };
}

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const config = getSmtpConfig();
  if (!config) {
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });
  }

  return cachedTransporter;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
}): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  const transporter = getTransporter();
  const config = getSmtpConfig();

  if (!transporter || !config) {
    return {
      ok: false,
      error:
        "SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS environment variables.",
    };
  }

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: input.to,
      cc: input.cc?.join(", "),
      bcc: input.bcc?.join(", "),
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    return { ok: true, messageId: info.messageId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown SMTP error";
    return { ok: false, error: message };
  }
}

export function isEmailConfigured(): boolean {
  return getSmtpConfig() !== null;
}
