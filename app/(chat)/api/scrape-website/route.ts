import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { auth } from "@/app/(auth)/auth";
import { generateText } from "ai";
import { getLanguageModel } from "@/lib/ai/providers";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch website: ${response.status}` },
        { status: 402 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $("script, style, noscript").remove();

    const bodyText = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    const metaDescription =
      $('meta[name="description"]').attr("content") || "";
    const pageTitle = $("title").text().trim();
    const h1 = $("h1").first().text().trim();

    const links: string[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr("href");
      if (href && href.startsWith("http")) {
        links.push(href);
      }
    });
    const uniqueLinks = [...new Set(links)].slice(0, 30);

    let extractedData: Record<string, unknown> | null = null;

    try {
      const model = getLanguageModel("remote/deepseek-v4-flash");

      const extractionPrompt = `Extract business information from this website content. Return ONLY valid JSON with no markdown.

Website URL: ${parsedUrl.toString()}
Page Title: ${pageTitle}
H1: ${h1}
Meta Description: ${metaDescription}

Page Content (first 8000 chars):
${bodyText}

Navigation/Service Links found:
${uniqueLinks.join("\n")}

Return this exact JSON structure:
{
  "name": "business name (from title or h1)",
  "tagline": "short tagline or slogan if found",
  "description": "2-3 sentence business description",
  "email": "business email if found, null otherwise",
  "phone": "business phone if found, null otherwise",
  "address": "physical address if found, null otherwise",
  "hours": { "open": "9:00", "close": "18:00", "days": "Monday - Friday", "timezone": "UTC" },
  "services": [
    {
      "name": "service name",
      "category": "seo|web|social|marketing|custom",
      "description": "brief service description",
      "price": 0,
      "unit": "/month or one-time"
    }
  ]
}

Rules:
- If a field is not found, use null
- Extract services from navigation links, headings, and page content
- If no services are clearly listed, create one based on what the business does
- Price should be a number (no currency symbol), default 0 if unknown
- Category must be one of: seo, web, social, marketing, custom
- Return ONLY the JSON object, nothing else`;

      const { text } = await generateText({
        model,
        prompt: extractionPrompt,
        maxTokens: 2000,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      }
    } catch (aiError) {
      console.error("AI extraction failed, using HTML fallback:", aiError);
    }

    if (!extractedData) {
      const emailMatch = bodyText.match(
        /[\w.+-]+@[\w-]+\.[\w.-]+/
      );
      const phoneMatch = bodyText.match(
        /[\+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}/
      );
      const addressEl = $('address').text().trim() ||
        $('[class*="address"]').text().trim().slice(0, 200);

      const serviceTexts: string[] = [];
      $('h2, h3, h4').each((_, el) => {
        const t = $(el).text().trim();
        if (t && t.length > 2 && t.length < 100) serviceTexts.push(t);
      });
      if (serviceTexts.length === 0) {
        $('li, .service, [class*="service"]').each((_, el) => {
          const t = $(el).text().trim().slice(0, 100);
          if (t && t.length > 5) serviceTexts.push(t);
        });
      }

      const services = serviceTexts.slice(0, 10).map((name) => ({
        name,
        category: "custom" as const,
        description: "",
        price: 0,
        unit: "one-time",
      }));

      extractedData = {
        name: pageTitle.replace(/[-|–—].*$/, "").trim() || parsedUrl.hostname,
        tagline: null,
        description: metaDescription || bodyText.slice(0, 300),
        email: emailMatch ? emailMatch[0] : null,
        phone: phoneMatch ? phoneMatch[0] : null,
        address: addressEl || null,
        hours: {
          open: "9:00",
          close: "18:00",
          days: "Monday - Friday",
          timezone: "UTC",
        },
        services,
      };
    }

    return NextResponse.json({
      ok: true,
      data: {
        name:
          (extractedData.name as string) ||
          pageTitle ||
          parsedUrl.hostname,
        tagline: (extractedData.tagline as string) || null,
        description:
          (extractedData.description as string) || metaDescription || null,
        email: (extractedData.email as string) || null,
        phone: (extractedData.phone as string) || null,
        address: (extractedData.address as string) || null,
        website: parsedUrl.toString(),
        hours: extractedData.hours || {
          open: "9:00",
          close: "18:00",
          days: "Monday - Friday",
          timezone: "UTC",
        },
        services: Array.isArray(extractedData.services)
          ? (
              extractedData.services as Array<{
                name?: string;
                category?: string;
                description?: string;
                price?: number;
                unit?: string;
              }>
            ).map((s) => ({
              name: s.name || "Service",
              category: [
                "seo",
                "web",
                "social",
                "marketing",
                "custom",
              ].includes(s.category || "")
                ? s.category
                : "custom",
              description: s.description || "",
              price: typeof s.price === "number" ? s.price : 0,
              unit: s.unit || "one-time",
            }))
          : [],
      },
    });
  } catch (error) {
    console.error("Website scrape error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to scrape website",
      },
      { status: 500 }
    );
  }
}
