# Lumina Chat — Multi-Business Upgrade Plan

## Overview
Transform Lumina Chat from a single-business chatbot into a multi-business CRM platform. Users can onboard businesses by pasting a website URL (AI auto-extracts details), manage channels (Email/WhatsApp/Twilio), and the AI autonomously manages tasks based on conversations.

---

## Phase 1: Multi-Business Database Schema

### New Tables (Drizzle ORM — `lib/db/schema.ts`)

**`Business`** — stores each onboarded business
- `id` (UUID, PK)
- `name` (text) — extracted from website or manual
- `slug` (text, unique) — URL-safe name
- `tagline` (text, nullable)
- `description` (text, nullable)
- `website` (text, nullable) — source URL
- `logoUrl` (text, nullable)
- `email` (text, nullable)
- `phone` (text, nullable)
- `whatsapp` (text, nullable)
- `address` (text, nullable)
- `timezone` (text, default "UTC")
- `hoursOpen` (text, nullable) — "9:00"
- `hoursClose` (text, nullable) — "18:00"
- `hoursDays` (text, nullable) — "Monday - Friday"
- `paymentTerms` (text, nullable)
- `isActive` (boolean, default true)
- `createdAt`, `updatedAt` (timestamps)

**`BusinessService`** — service catalog per business
- `id` (UUID, PK)
- `businessId` (UUID, FK → Business)
- `name` (text)
- `category` (text) — "seo", "web", "social", "marketing", "custom"
- `description` (text)
- `price` (integer) — in cents
- `unit` (text) — "/month", "one-time"
- `durationMonths` (integer, default 1)
- `isActive` (boolean, default true)

**`Channel`** — channel integrations per business
- `id` (UUID, PK)
- `businessId` (UUID, FK → Business)
- `type` (text) — "email", "whatsapp", "twilio", "social"
- `isEnabled` (boolean, default false)
- `config` (jsonb) — stores type-specific config:
  - Email: `{ host, port, secure, user, pass, from }`
  - WhatsApp: `{ token, phoneNumberId, from }`
  - Twilio: `{ accountSid, authToken, fromNumber }`
- `createdAt`, `updatedAt` (timestamps)

**`Task`** — AI-managed tasks
- `id` (UUID, PK)
- `businessId` (UUID, FK → Business)
- `leadId` (UUID, FK → Lead, nullable)
- `title` (text)
- `description` (text, nullable)
- `status` (enum: "pending", "in_progress", "completed", "cancelled")
- `priority` (enum: "low", "medium", "high", "urgent")
- `dueDate` (timestamp, nullable)
- `completedAt` (timestamp, nullable)
- `createdBy` (text) — "ai" or "user"
- `chatId` (UUID, FK → Chat, nullable) — originating conversation
- `createdAt`, `updatedAt` (timestamps)

### Migrations
- Run `drizzle-kit push` after schema changes
- Seed with default "Lumina Chat" business from existing `defaultBusinessConfig`

---

## Phase 2: Website Scraping API

### New API Route: `app/(chat)/api/scrape-website/route.ts`

**Flow:**
1. User pastes a URL in settings
2. Frontend POSTs `{ url: "https://example.com" }`
3. Backend fetches the website HTML (using `fetch` + `cheerio` or AI with `fetch`)
4. Feeds HTML content to AI model with a structured extraction prompt
5. Returns structured JSON:

```ts
{
  name: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website: string;
  services: Array<{
    name: string;
    category: string;
    description: string;
    price?: number;
    unit?: string;
  }>;
  hours?: { open: string; close: string; days: string; timezone: string };
}
```

**AI Extraction Prompt:** Use the existing `getLanguageModel()` to call the configured model with the fetched HTML content and ask it to extract business details in the structured format above.

**Dependencies to add:** `cheerio` (HTML parsing, lightweight)

---

## Phase 3: Business Settings Panel

### New Settings Tab: "Businesses"

**Business List View:**
- Cards showing each onboarded business (name, website, channels enabled)
- "Add Business" button → opens scrape modal
- Click business card → opens detail view

**Add Business Modal:**
- Input: Website URL
- Button: "Scrape & Add"
- Shows loading spinner while AI extracts
- Auto-fills a form with extracted data
- User clicks "Save" → creates Business + auto-creates Channel entries

**Business Detail View:**
- Editable form with all business fields
- Services sub-section: list/edit/add/delete services
- Channels sub-section: enable/configure Email, WhatsApp, Twilio
- "Set Active" button → switches the chatbot's active business context

### Files to Create/Modify:
- `components/chat/business-settings.tsx` — main business settings component
- `components/chat/business-form.tsx` — add/edit business form
- `components/chat/service-catalog.tsx` — manage services
- `components/chat/channel-config.tsx` — configure channels (SMTP, WhatsApp, Twilio)
- `components/chat/settings-panel.tsx` — add "Businesses" tab

---

## Phase 4: Multi-Business Context in Chat

### Active Business State
- Store active business ID in localStorage (alongside existing settings)
- Pass business context to the chat route
- System prompt dynamically includes active business's config, services, and catalog

### Changes to `lib/business/config.ts`:
- Keep `defaultBusinessConfig` as fallback
- Add `getBusinessById(id: string)` query function
- Modify `businessSummary()` to accept a business ID
- `getBusinessConfig()` checks for active business first, falls back to default

### Changes to `lib/ai/prompts.ts`:
- `officeManagerPrompt` accepts business config as parameter
- System prompt dynamically references the active business's name, services, pricing

### Changes to `app/(chat)/api/chat/route.ts`:
- Accept `businessId` in request body
- Pass to system prompt and tools

### Changes to `lib/ai/tools/business.ts`:
- All 13 tools scoped to the active business
- `getBusinessInfo` → reads from DB business record
- `getServiceQuote` → pulls services from BusinessService table
- `createLeadRecord` → associates with active businessId
- `sendEmailMessage` → uses active business's channel config
- `sendWhatsAppMessage` → uses active business's channel config
- `makePhoneCall` → uses active business's channel config

---

## Phase 5: Channel Integrations (Settings UI)

### Channel Configuration UI (`components/chat/channel-config.tsx`)

For each business, configure up to 3 channels:

**📧 Email (SMTP)**
- SMTP Host, Port, Secure (TLS), Username, Password, From Address
- "Test Connection" button → sends a test email
- Shows ✅ connected or ❌ error

**📱 WhatsApp (Meta Cloud API)**
- Access Token, Phone Number ID, From Number
- "Test Connection" button → sends a test message to your number
- Webhook URL displayed for Meta config
- Shows ✅ connected or ❌ error

**☎️ Twilio Phone**
- Account SID, Auth Token, From Number
- "Test Connection" button → places a test call
- Voice webhook URL displayed
- Shows ✅ connected or ❌ error

### Storage:
- Channel configs stored in the `Channel` table (JSONB `config` field)
- NOT in env vars — loaded at runtime from DB per business
- Integration code (`lib/business/email.ts`, `whatsapp.ts`, `twilio.ts`) modified to accept config params instead of only reading env vars

---

## Phase 6: AI-Managed Tasks

### New Tool: `createTask`
- AI autonomously creates tasks during conversations
- Example: Client asks for a quote → AI creates task "Send proposal to [client]"
- Fields: title, description, priority, leadId (if conversation involves a known lead)

### New Tool: `completeTask`
- AI marks tasks as completed when actions are done
- Example: After sending a quote, AI marks "Send proposal" task as completed

### New Tool: `listTasks`
- AI can check pending tasks for the business
- Filter by status, priority, lead

### New Tool: `updateTask`
- AI can update task details, priority, due date

### Task Lifecycle:
1. Client message → AI creates relevant task (status: pending)
2. AI performs action (sends email, quote, etc.) → marks task complete
3. If task needs follow-up → AI creates new task with future due date

### Files:
- `lib/ai/tools/tasks.ts` — new tool definitions
- Add tools to `app/(chat)/api/chat/route.ts` tool list

---

## Implementation Order

1. **Database schema** — New tables + migrations (Phase 1)
2. **Website scraping API** — Scraping endpoint + cheerio (Phase 2)
3. **Business settings UI** — Settings tab + forms (Phase 3)
4. **Multi-business context** — Active business in chat (Phase 4)
5. **Channel config UI** — SMTP/WhatsApp/Twilio settings (Phase 5)
6. **Task management** — AI tools + task lifecycle (Phase 6)

## New Dependencies
- `cheerio` — HTML parsing for website scraping

## Files to Create
- `app/(chat)/api/scrape-website/route.ts`
- `components/chat/business-settings.tsx`
- `components/chat/business-form.tsx`
- `components/chat/service-catalog.tsx`
- `components/chat/channel-config.tsx`
- `lib/ai/tools/tasks.ts`

## Files to Modify
- `lib/db/schema.ts` — add new tables
- `lib/db/queries.ts` — add CRUD queries for businesses, services, channels, tasks
- `lib/business/config.ts` — multi-business support
- `lib/business/email.ts` — accept config params
- `lib/business/whatsapp.ts` — accept config params
- `lib/business/twilio.ts` — accept config params
- `lib/ai/tools/business.ts` — scope tools to active business
- `lib/ai/prompts.ts` — dynamic business prompt
- `app/(chat)/api/chat/route.ts` — business context + new tools
- `components/chat/settings-panel.tsx` — add Businesses tab
- `package.json` — add cheerio dependency
