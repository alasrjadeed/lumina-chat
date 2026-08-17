# Phases.md — Development Phases & Roadmap

> Track what's built, what's in progress, and what's next.

---

## Current Status

**Version**: 3.1.0
**License**: Apache 2.0
**Status**: Production-ready core with business automation

---

## Phase 1 — Core Chatbot ✅

> Foundation: multi-model AI chat with streaming.

### Completed

- [x] Next.js 16 App Router setup
- [x] React 19 with React Compiler
- [x] Vercel AI SDK integration
- [x] 5 LLM models (DeepSeek, Kimi, GPT OSS, Grok)
- [x] AI Gateway routing with fallback providers
- [x] Self-hosted LLM fallback (`USER_LLM_*`)
- [x] Streaming text responses via SSE
- [x] Multi-turn conversation with history
- [x] Chat persistence in PostgreSQL
- [x] Chat title auto-generation
- [x] Model selector with capability detection
- [x] Rate limiting (per-user + per-IP)
- [x] Guest and authenticated user modes
- [x] Public/private chat visibility

---

## Phase 2 — Artifact System ✅

> Side-panel for creating and editing documents.

### Completed

- [x] Create document tool (text/code/sheet/image)
- [x] Edit document tool (find-and-replace)
- [x] Update document tool (full rewrite)
- [x] Suggestion tool (AI improvement proposals)
- [x] ProseMirror rich-text editor (text artifacts)
- [x] CodeMirror code editor (code artifacts, Python)
- [x] DataGrid spreadsheet editor (sheet artifacts)
- [x] Real-time streaming updates
- [x] Artifact side panel UI
- [x] Version history via composite primary key

---

## Phase 3 — Business Automation ✅

> Virtual office manager for MonkeyCode Digital.

### Completed

- [x] Business config system (services, pricing, contact)
- [x] `getBusinessInfo` tool — service catalog
- [x] `getServiceQuote` tool — price calculator
- [x] `createLeadRecord` tool — lead capture
- [x] `getLeadStatus` tool — lead lookup
- [x] `updateLeadRecord` tool — lead pipeline
- [x] `scheduleMeeting` tool — appointment booking
- [x] `listMeetings` tool — calendar view
- [x] `confirmMeeting` tool — confirm/cancel
- [x] Office Manager prompt persona
- [x] Office Manager page (`/office`)
- [x] Lead database table with status pipeline
- [x] Appointment database table with status pipeline

---

## Phase 4 — Multi-Channel Communication ✅

> Reach customers across email, WhatsApp, and phone.

### Completed

- [x] SMTP email sending (Nodemailer)
- [x] IMAP inbox reading (ImapFlow)
- [x] Email thread persistence in DB
- [x] `sendEmailMessage` tool
- [x] `listEmailInbox` tool
- [x] `readEmailThread` tool
- [x] WhatsApp Cloud API integration (Meta Graph API v19.0)
- [x] `sendWhatsAppMessage` tool
- [x] WhatsApp inbound webhook (`/api/webhooks/whatsapp`)
- [x] WhatsApp signature verification
- [x] Auto-lead creation from inbound WhatsApp
- [x] Twilio outbound voice calls
- [x] `makePhoneCall` tool
- [x] Twilio voice webhook with TwiML menu
- [x] Social media inbound webhook (`/api/webhooks/social`)
- [x] Graceful degradation when channels not configured

---

## Phase 5 — Voice & Accessibility ✅

> Hands-free interaction via browser speech API.

### Completed

- [x] Web Speech API speech recognition
- [x] Speech synthesis (text-to-speech)
- [x] Voice mode (continuous listening loop)
- [x] Voice settings persistence (localStorage)
- [x] Voice assistant UI component
- [x] Microphone button with visual feedback
- [x] Interim transcript display

---

## Phase 6 — Polish & Production ✅

> Security, testing, and deployment readiness.

### Completed

- [x] NextAuth.js 5 (credentials + guest)
- [x] BotID bot detection
- [x] Playwright E2E test suite
- [x] OpenTelemetry observability (server + client)
- [x] Vercel deployment config
- [x] Biome linter/formatter (Ultracite)
- [x] Resumable streams via Redis
- [x] File upload via Vercel Blob
- [x] Error boundary with ChatbotError class
- [x] Dark/light theme support

---

## Phase 7 — Future Enhancements 🔲

> What's planned or could be built next.

### High Priority

- [ ] **User dashboard** — lead list, appointment calendar, email inbox
- [ ] **Multi-user support** — team accounts with roles
- [ ] **Lead assignment** — assign leads to team members
- [ ] **Email templates** — pre-built quote/follow-up templates
- [ ] **Calendar integration** — Google Calendar / Outlook sync

### Medium Priority

- [ ] **CRM dashboard** — pipeline visualization, conversion metrics
- [ ] **WhatsApp templates** — pre-approved message templates
- [ ] **Call recording** — store call recordings in Vercel Blob
- [ ] **SMS support** — Twilio SMS in addition to voice
- [ ] **File parsing** — extract data from uploaded PDFs/docs

### Low Priority

- [ ] **Analytics** — chat volume, lead conversion, response times
- [ ] **Custom branding** — white-label support for multiple businesses
- [ ] **API access** — REST API for external integrations
- [ ] **Webhook builder** — custom webhook destinations
- [ ] **AI training** — fine-tune on business-specific Q&A

---

## Milestones

| Milestone | Date | Status |
|-----------|------|--------|
| v1.0 — Core chatbot | — | ✅ Done |
| v2.0 — Artifact system | — | ✅ Done |
| v3.0 — Business automation | — | ✅ Done |
| v3.1 — Multi-channel comms | — | ✅ Done |
| v4.0 — User dashboard | — | 🔲 Planned |
| v5.0 — Multi-user + CRM | — | 🔲 Planned |
