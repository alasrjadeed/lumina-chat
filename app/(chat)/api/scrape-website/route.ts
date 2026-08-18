import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { auth } from "@/app/(auth)/auth";
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
          "Mozilla/5.0 (compatible; LuminaBot/1.0; +https://lumina.chat)",
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

    $("script, style, noscript, nav, footer, header").remove();

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

    const images: string[] = [];
    $('img[src]').each((_, el) => {
      const src = $(el).attr("src");
      if (src && src.startsWith("http")) {
        images.push(src);
      }
    });

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
  "website": "${parsedUrl.toString()}",
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

    const result = await model.doGenerate({
      messages: [{ role: "user", content: extractionPrompt }],
      maxTokens: 2000,
    });

    const text =
      typeof result.text === "string"
        ? result.text
        : Array.isArray(result.text)
          ? result.text.join("")
          : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to extract business data" },
        { status: 500 }
      );
    }

    const extracted = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      ok: true,
      data: {
        name: extracted.name || pageTitle || parsedUrl.hostname,
        tagline: extracted.tagline || null,
        description: extracted.description || metaDescription || null,
        email: extracted.email || null,
        phone: extracted.phone || null,
        address: extracted.address || null,
        website: parsedUrl.toString(),
        hours: extracted.hours || {
          open: "9:00",
          close: "18:00",
          days: "Monday - Friday",
          timezone: "UTC",
        },
        services: Array.isArray(extracted.services)
          ? extracted.services.map(
              (s: {
                name: string;
                category?: string;
                description?: string;
                price?: number;
                unit?: string;
              }) => ({
                name: s.name || "Service",
                category: ["seo", "web", "social", "marketing", "custom"].includes(
                  s.category || ""
                )
                  ? s.category
                  : "custom",
                description: s.description || "",
                price: typeof s.price === "number" ? s.price : 0,
                unit: s.unit || "one-time",
              })
            )
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
