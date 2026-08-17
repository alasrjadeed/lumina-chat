# Architecture.md — System Architecture

> How the Lumina AI Chat Bot is structured, connected, and deployed.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                    │
│  React 19 + Next.js 16 App Router + Tailwind CSS 4      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Chat UI  │ │ Artifact │ │  Voice   │ │  Sidebar  │  │
│  │          │ │  Panel   │ │  Input   │ │  History  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘  │
│       └─────────────┴────────────┴─────────────┘        │
└─────────────────────────┬───────────────────────────────┘
                          │ SSE / WebSocket
┌─────────────────────────┴───────────────────────────────┐
│                    SERVER (Next.js)                       │
│  ┌─────────────────────────────────────────────────┐    │
│  │              API Routes (App Router)              │    │
│  │  /api/chat  /api/history  /api/files  /api/email │    │
│  │  /api/webhooks/whatsapp  /api/webhooks/voice     │    │
│  └───────────┬─────────────────┬───────────────────┘    │
│              │                 │                          │
│  ┌───────────┴──────┐ ┌───────┴────────────────────┐   │
│  │   AI Pipeline     │ │     Business Layer          │   │
│  │  (Vercel AI SDK)  │ │  (Email/WhatsApp/Twilio)   │   │
│  │  ┌─────────────┐  │ │  ┌──────────────────────┐  │   │
│  │  │   Models    │  │ │  │  Nodemailer (SMTP)   │  │   │
│  │  │   Tools     │  │ │  │  WhatsApp Cloud API   │  │   │
│  │  │   Prompts   │  │ │  │  Twilio Voice         │  │   │
│  │  └─────────────┘  │ │  │  ImapFlow (IMAP)      │  │   │
│  └───────────┬────────┘ │  └──────────────────────┘  │   │
│              │          └───────────┬────────────────┘   │
│              │                      │                     │
│  ┌───────────┴──────────────────────┴────────────────┐  │
│  │                Data Layer                           │  │
│  │  ┌──────────────┐  ┌──────────┐  ┌────────────┐  │  │
│  │  │ PostgreSQL    │  │  Redis   │  │ Vercel Blob│  │  │
│  │  │ (Neon)        │  │ (Stream)│  │ (Files)    │  │  │
│  │  │ Drizzle ORM   │  │         │  │            │  │  │
│  │  └──────────────┘  └──────────┘  └────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
lumina ai chat bot/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication
│   │   ├── auth.ts               # NextAuth config
│   │   ├── auth.config.ts        # Adapter + session types
│   │   ├── login/                # Login page
│   │   └── register/             # Register page
│   ├── (chat)/                   # Main application
│   │   ├── page.tsx              # Home/chat page
│   │   ├── chat/[id]/            # Individual chat
│   │   ├── office/               # Office manager page
│   │   ├── actions.ts            # Server Actions
│   │   └── api/                  # API routes
│   │       ├── chat/             # Chat endpoint (main)
│   │       ├── history/          # Chat history
│   │       ├── messages/         # Message CRUD
│   │       ├── document/         # Artifact CRUD
│   │       ├── files/upload/     # File upload
│   │       ├── models/           # Model listing
│   │       ├── vote/             # Message voting
│   │       ├── business/         # Business info
│   │       ├── email/            # Email operations
│   │       └── webhooks/         # Inbound integrations
│   │           ├── whatsapp/     # WhatsApp webhook
│   │           ├── voice/        # Twilio voice webhook
│   │           └── social/       # Social media webhook
│   ├── globals.css
│   └── layout.tsx                # Root layout
├── artifacts/                    # Artifact type implementations
│   ├── code/                     # Code editor (CodeMirror)
│   ├── text/                     # Rich text (ProseMirror)
│   ├── sheet/                    # Spreadsheet (CSV/DataGrid)
│   └── image/                    # Image artifact
├── components/                   # React components
│   ├── ai-elements/              # AI-specific UI primitives
│   ├── chat/                     # Chat UI (35+ files)
│   ├── ui/                       # shadcn/ui (22 primitives)
│   └── theme-provider.tsx
├── hooks/                        # Custom React hooks (8 files)
├── lib/                          # Core business logic
│   ├── ai/                       # AI layer
│   │   ├── models.ts             # Model definitions
│   │   ├── providers.ts          # Provider resolution
│   │   ├── prompts.ts            # All system prompts
│   │   ├── entitlements.ts       # Rate limits
│   │   └── tools/                # Tool implementations
│   │       ├── business.ts       # 13 business tools
│   │       ├── create-document.ts
│   │       ├── edit-document.ts
│   │       ├── update-document.ts
│   │       ├── request-suggestions.ts
│   │       └── get-weather.ts
│   ├── business/                 # External integrations
│   │   ├── config.ts             # Business identity + services
│   │   ├── email.ts              # SMTP sending
│   │   ├── imap.ts               # IMAP inbox reading
│   │   ├── whatsapp.ts           # WhatsApp Cloud API
│   │   └── twilio.ts             # Twilio voice calls
│   ├── db/                       # Database layer
│   │   ├── schema.ts             # Drizzle ORM schema
│   │   ├── queries.ts            # Query functions
│   │   ├── migrate.ts            # Migration runner
│   │   └── migrations/           # SQL migrations
│   ├── editor/                   # ProseMirror setup
│   ├── constants.ts
│   ├── errors.ts                 # ChatbotError class
│   ├── ratelimit.ts              # IP rate limiting
│   ├── types.ts
│   └── utils.ts
├── public/                       # Static assets
├── tests/                        # Playwright E2E tests
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## Data Flow

### 1. Chat Message Flow

```
User types message
  → POST /api/chat (with chat ID, message, model)
    → Auth check (session)
    → Rate limit check (IP + user)
    → Save user message to DB
    → streamText() with tools
      → LLM generates response + tool calls
      → Tools execute (DB writes, API calls)
      → Results fed back to LLM
      → Final response generated
    → Stream SSE to client
    → onFinish: save AI message to DB
    → Update chat title if new
```

### 2. Webhook Inbound Flow

```
External event (WhatsApp message, phone call, social post)
  → POST /api/webhooks/whatsapp (or /voice, /social)
    → Verify signature/token
    → Extract contact info
    → createLeadRecord (auto-create lead)
    → Auto-reply if configured
    → Return 200 OK
```

### 3. Artifact Flow

```
User asks to create document
  → AI calls createDocument tool
    → Save Document to DB
    → Stream artifact content to client
  → User sees artifact in side panel
  → User can edit → AI calls editDocument
    → Find-and-replace in content
    → Stream updated artifact
```

---

## Database Schema

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `User` | User accounts | id, email, password, isAnonymous |
| `Chat` | Chat sessions | id, userId, title, visibility |
| `Message_v2` | Messages | id, chatId, role, parts (JSON), attachments |
| `Vote_v2` | Message votes | chatId, messageId, isUpvoted |
| `Document` | Artifacts | id, title, content, kind, userId |
| `Suggestion` | AI suggestions | documentId, originalText, suggestedText |
| `Stream` | Resumable streams | id, chatId |
| `Lead` | Sales leads | name, email, phone, status, source |
| `Appointment` | Meetings | title, clientName, startTime, status |
| `EmailThread` | Email threads | from, subject, unread, leadId |
| `EmailMessage` | Emails | threadId, from, to, body, direction |

### Lead Status Pipeline

```
new → contacted → qualified → proposal → won
                                           → lost
```

### Appointment Status Pipeline

```
requested → scheduled → confirmed → completed
                         ↓
                      cancelled
```

---

## External Services

| Service | Purpose | Env Vars |
|---------|---------|----------|
| Vercel AI Gateway | LLM routing | `AI_GATEWAY_API_KEY` (non-Vercel) |
| OpenAI-compatible LLM | Self-hosted fallback | `USER_LLM_API_KEY`, `USER_LLM_BASE_URL`, `USER_LLM_MODEL` |
| PostgreSQL (Neon) | Primary database | `POSTGRES_URL` |
| Redis | Resumable streams | `REDIS_URL` |
| Vercel Blob | File uploads | `BLOB_READ_WRITE_TOKEN` |
| SMTP (Nodemailer) | Outbound email | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` |
| IMAP (ImapFlow) | Inbound email | `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASS` |
| WhatsApp Cloud API | WhatsApp messaging | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` |
| Twilio | Voice calls | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` |
| BotID | Bot detection | (auto-configured) |

---

## Deployment

### Vercel (Primary)

- One-click deploy via `vercel.json`
- Automatic OIDC for AI Gateway
- Edge functions for webhooks
- Serverless for API routes (60s max duration)
- `withBotId()` wrapper in `next.config.ts`

### Self-Hosted

- Set `USER_LLM_*` env vars to bypass AI Gateway
- Set `POSTGRES_URL` for database
- Set `NEXT_PUBLIC_BASE_URL` for webhooks
- Run `pnpm db:migrate` before starting
- `pnpm build` → `pnpm start`

---

## Security Boundaries

```
Client ←→ Server (HTTPS)
Server ←→ AI Gateway (HTTPS, OIDC/API key)
Server ←→ PostgreSQL (SSL)
Server ←→ Redis (TLS)
Server ←→ SMTP (TLS, optional STARTTLS)
Server ←→ IMAP (TLS)
Server ←→ WhatsApp Graph API (HTTPS, Bearer token)
Server ←→ Twilio API (HTTPS, Basic auth)
Server ←→ Vercel Blob (HTTPS)
```
