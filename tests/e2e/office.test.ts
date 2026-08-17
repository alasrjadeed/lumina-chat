import { expect, test } from "@playwright/test";

test.describe("Office Manager", () => {
  test("office page auto-authenticates guest and renders", async ({ page }) => {
    await page.goto("/office");
    // Guest flow auto-provisions a session and redirects back to /office.
    await page.waitForURL(/\/office/, { timeout: 15_000 });

    await expect(
      page.getByRole("heading", { name: "Office manager" })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("office manager page renders for authenticated user", async ({
    page,
  }) => {
    await page.goto("/api/auth/guest?redirectUrl=%2Foffice");
    await page.waitForURL(/\/office/, { timeout: 15_000 });

    await expect(
      page.getByRole("heading", { name: "Office manager" })
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Meetings" })).toBeVisible();
  });

  test("social webhook records a lead", async ({ request }) => {
    const response = await request.post("/api/webhooks/social", {
      data: {
        message: "Interested in a new website",
        name: "E2E Tester",
        userId: "e2e-user",
      },
      headers: { "x-platform": "website" },
    });
    expect(response.status()).toBe(200);
  });

  test("voice webhook returns TwiML", async ({ request }) => {
    const response = await request.post("/api/webhooks/voice", {
      form: { From: "+15551234567", CallSid: "CA-E2E" },
    });
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("<Response>");
    expect(text).toContain("<Gather");
  });

  test("email inbox returns empty threads when unconfigured", async ({
    page,
  }) => {
    // Establish a guest session so the email API authorizes the request.
    await page.goto("/api/auth/guest?redirectUrl=%2Foffice");
    await page.waitForURL(/\/office/, { timeout: 15_000 });

    const response = await page.request.get("/api/email");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.threads)).toBe(true);
  });

  test("email sync reports unconfigured IMAP gracefully", async ({ page }) => {
    // Establish a guest session so the email API authorizes the request.
    await page.goto("/api/auth/guest?redirectUrl=%2Foffice");
    await page.waitForURL(/\/office/, { timeout: 15_000 });

    const response = await page.request.post("/api/email/sync");
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error).toContain("IMAP is not configured");
  });
});
