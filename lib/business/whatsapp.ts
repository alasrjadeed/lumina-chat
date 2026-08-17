type WhatsAppConfig = {
  token: string;
  phoneNumberId: string;
  from: string;
};

function getWhatsAppConfig(): WhatsAppConfig | null {
  const token = process.env.WHATSAPP_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const from = process.env.WHATSAPP_FROM?.trim();

  if (!token || !phoneNumberId) {
    return null;
  }

  return {
    token,
    phoneNumberId,
    from: from ?? "",
  };
}

export async function sendWhatsApp(input: {
  to: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  const config = getWhatsAppConfig();

  if (!config) {
    return {
      ok: false,
      error:
        "WhatsApp is not configured. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables.",
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: input.to,
          type: "text",
          text: { body: input.text },
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        error: `WhatsApp API error (${response.status}): ${body.slice(0, 300)}`,
      };
    }

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown WhatsApp error";
    return { ok: false, error: message };
  }
}

export function isWhatsAppConfigured(): boolean {
  return getWhatsAppConfig() !== null;
}
