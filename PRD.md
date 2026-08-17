# PRD.md — Product Requirements Document

> Lumina AI Chat Bot — Virtual Office Manager for MonkeyCode Digital

---

## 1. Product Overview

**Name**: Lumina AI Chat Bot
**Version**: 3.1.0
**Type**: AI-powered chatbot with business automation
**Target User**: Small-to-medium businesses needing a virtual office manager
**Base Template**: Vercel AI Chatbot (Apache 2.0)

---

## 2. Problem Statement

Digital agencies like MonkeyCode Digital spend significant time on repetitive tasks:
- Answering the same pricing/service questions
- Manually creating leads from website inquiries
- Scheduling meetings via email/phone tag
- Following up with prospects across multiple channels

**Goal**: Automate the front-office workflow so the AI handles inquiries, captures leads, schedules meetings, and communicates across email/WhatsApp/phone — freeing humans for high-value work.

---

## 3. Target Users

| Persona | Role | Needs |
|---------|------|-------|
| Agency Owner | Decision maker | Reduce overhead, capture every lead |
| Sales Rep | Lead follow-up | Qualified leads with context |
| Client (Prospect) | Incoming lead | Fast answers, easy booking |
| Client (Existing) | Repeat customer | Quick support, status updates |

---

## 4. Core Features

### 4.1 AI Chat Engine

- **Multi-model support**: 5 LLMs (DeepSeek, Kimi, GPT OSS, Grok) via AI Gateway
- **Streaming responses**: Real-time SSE output
- **Multi-turn conversations**: Full chat history persistence
- **Model selector**: Users pick their preferred model
- **Artifact system**: Side-panel for code, documents, spreadsheets
- **Voice input**: Browser speech recognition + text-to-speech

### 4.2 Business Automation (Office Manager)

The AI acts as a virtual office manager with these capabilities:

| Capability | Tools | DB Tables |
|------------|-------|-----------|
| Service catalog | `getBusinessInfo` | — |
| Price quotes | `getServiceQuote` | — |
| Lead capture | `createLeadRecord`, `getLeadStatus`, `updateLeadRecord` | `Lead` |
| Meeting scheduling | `scheduleMeeting`, `listMeetings`, `confirmMeeting` | `Appointment` |
| Email | `sendEmailMessage`, `listEmailInbox`, `readEmailThread` | `EmailThread`, `EmailMessage` |
| WhatsApp | `sendWhatsAppMessage` | — |
| Phone calls | `makePhoneCall` | — |

### 4.3 Multi-Channel Communication

| Channel | Inbound | Outbound | Provider |
|---------|---------|----------|----------|
| Website chat | Primary | Primary | — |
| Email | IMAP sync | SMTP send | Nodemailer + ImapFlow |
| WhatsApp | Webhook | Cloud API | Meta Graph API v19.0 |
| Phone | Twilio webhook | Twilio calls | Twilio SDK |
| Social media | Webhook | — | — |

### 4.4 Authentication & Access

- Guest access (rate-limited)
- Registered users (credentials)
- Session-based auth via NextAuth.js 5
- Chat visibility: public/private

---

## 5. Service Catalog

| Service | Price | Duration |
|---------|-------|----------|
| SEO Starter | $499/mo | 3 months |
| SEO Growth | $999/mo | 6 months |
| Landing Page | $1,499 one-time | 1 month |
| Business Website | $3,999 one-time | 1 month |
| E-commerce Store | $6,999 one-time | 1 month |
| Social Media Starter | $599/mo | 1 month |
| Social Media Pro | $999/mo | 1 month |
| Paid Ads Management | $799/mo + 15% ad spend | 1 month |

**Payment terms**: 50% deposit, 50% on delivery. Monthly retainers billed upfront.

---

## 6. Data Model

### Lead Pipeline

```
new → contacted → qualified → proposal → won / lost
```

### Appointment Pipeline

```
requested → scheduled → confirmed → completed
                         ↓
                      cancelled
```

### Email Threading

- Threads grouped by sender email
- Messages linked to threads (cascade delete)
- Threads optionally linked to leads

---

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Response time | < 3s first token (streaming) |
| Availability | 99.9% (Vercel) |
| Rate limit | 10 msgs/hour per user |
| Auth | Session-based, HTTPS only |
| Data retention | Indefinite (user can delete) |
| Deployment | Vercel or self-hosted |

---

## 8. Environment Variables

### Required

| Variable | Purpose |
|----------|---------|
| `POSTGRES_URL` | Database connection |
| `AUTH_SECRET` | NextAuth session secret |

### Optional — AI

| Variable | Purpose |
|----------|---------|
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway (non-Vercel) |
| `USER_LLM_API_KEY` | Self-hosted LLM API key |
| `USER_LLM_BASE_URL` | Self-hosted LLM endpoint |
| `USER_LLM_MODEL` | Self-hosted model name |

### Optional — Business

| Variable | Purpose |
|----------|---------|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Email sending |
| `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASS` | Email receiving |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp messaging |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | WhatsApp webhook security |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | Voice calls |
| `BUSINESS_NAME`, `BUSINESS_EMAIL`, `BUSINESS_PHONE` | Business identity |

### Optional — Infrastructure

| Variable | Purpose |
|----------|---------|
| `REDIS_URL` | Resumable streams |
| `BLOB_READ_WRITE_TOKEN` | File uploads |
| `NEXT_PUBLIC_BASE_URL` | Webhook callbacks |
| `IS_DEMO` | Demo mode flag |

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Lead capture rate | 100% of inbound inquiries |
| Response time | < 3s first token |
| Quote accuracy | 100% (from catalog) |
| Channel coverage | Email + WhatsApp + Phone |
| Zero missed leads | Every inquiry creates a lead record |

---

## 10. Constraints

- No payment processing (quotes only, no checkout)
- No HIPAA/compliance requirements
- Single-tenant (one business per deployment)
- English-only (no i18n)
- No mobile app (web-only)
