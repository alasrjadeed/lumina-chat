import twilio from "twilio";

function getTwilioConfig(): {
  accountSid: string;
  authToken: string;
  from: string;
} | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();

  if (!accountSid || !authToken || !from) {
    return null;
  }

  return { accountSid, authToken, from };
}

export async function makeOutboundCall(input: {
  to: string;
  /** Absolute URL to the TwiML to execute for the call. */
  twimlUrl: string;
}): Promise<{ ok: boolean; error?: string; callSid?: string }> {
  const config = getTwilioConfig();

  if (!config) {
    return {
      ok: false,
      error:
        "Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER environment variables.",
    };
  }

  try {
    const client = twilio(config.accountSid, config.authToken);
    const call = await client.calls.create({
      to: input.to,
      from: config.from,
      url: input.twimlUrl,
    });

    return { ok: true, callSid: call.sid };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Twilio error";
    return { ok: false, error: message };
  }
}

export function isTwilioConfigured(): boolean {
  return getTwilioConfig() !== null;
}
