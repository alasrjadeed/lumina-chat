# Brain.md — AI Brain & Model Logic

> How the AI thinks, decides, and acts.

---

## Overview

The Lumina AI Chat Bot uses a **tool-augmented LLM pipeline** powered by the Vercel AI SDK. The AI doesn't just generate text — it calls tools to interact with the real business: creating leads, sending emails, scheduling meetings, and making phone calls.

---

## Model Selection

### Available Models

| Model ID | Name | Provider | Gateway Order | Notes |
|----------|------|----------|---------------|-------|
| `deepseek/deepseek-v3.2` | DeepSeek V3.2 | deepseek | bedrock, deepinfra | Fast, tool-capable |
| `moonshotai/kimi-k2.5` | Kimi K2.5 | moonshotai | fireworks, bedrock | Default model |
| `openai/gpt-oss-20b` | GPT OSS 20B | openai | groq, bedrock | Reasoning (low) |
| `openai/gpt-oss-120b` | GPT OSS 120B | openai | fireworks, bedrock | Reasoning (low) |
| `xai/grok-4.1-fast-non-reasoning` | Grok 4.1 Fast | xai | xai | Non-reasoning, tools |

### Model Resolution Chain

```
User selects model → getLanguageModel(modelId)
  1. Test environment? → mock provider
  2. USER_LLM_* env vars set? → custom OpenAI-compatible endpoint
  3. Default → Vercel AI Gateway
```

The `USER_LLM_*` fallback allows running without Vercel — useful for self-hosted deployments (e.g., pointing at a DeepSeek API).

### Capability Detection

Capabilities (tools, vision, reasoning) are fetched from the AI Gateway API at runtime and cached for 24h. This determines:
- Which tools are enabled per model
- Whether reasoning output is streamed
- Whether the model selector shows badges

---

## Prompt Architecture

### System Prompt Composition

```
systemPrompt(requestHints, supportsTools)
  ├── regularPrompt          (base personality)
  ├── requestHints           (geo-location context)
  ├── officeManagerPrompt    (if tools supported)
  └── artifactsPrompt        (if tools supported)
```

### Prompt Hierarchy

| Prompt | Purpose | Loaded |
|--------|---------|--------|
| `regularPrompt` | Concise, helpful assistant | Always |
| `officeManagerPrompt` | MonkeyCode Digital virtual office manager | When tools available |
| `artifactsPrompt` | Rules for creating/editing documents | When tools available |
| `codePrompt` | Code generation rules | When creating code artifacts |
| `sheetPrompt` | Spreadsheet creation rules | When creating sheet artifacts |
| `titlePrompt` | Chat title generation | Title model only |

### Office Manager Persona

The AI acts as a virtual office manager for **MonkeyCode Digital**. It:
1. Answers questions about services/pricing from `businessSummary()`
2. Generates quotes via `getServiceQuote` tool
3. Records leads via `createLeadRecord` tool
4. Schedules meetings via `scheduleMeeting` tool
5. Sends emails/WhatsApp/makes calls via dedicated tools
6. Escalates to humans when it cannot help

**Critical rule**: Never fabricate prices. Always call `getBusinessInfo` first.

---

## Tool System

### Tool Registration (18 tools)

**Business Tools (13):**
| Tool | Function | DB Table |
|------|----------|----------|
| `getBusinessInfo` | Service catalog + pricing | — |
| `getServiceQuote` | Calculate total + deposit | — |
| `createLeadRecord` | New sales lead | `Lead` |
| `getLeadStatus` | Lookup leads by email | `Lead` |
| `updateLeadRecord` | Update lead status/notes | `Lead` |
| `scheduleMeeting` | Book appointment | `Appointment` |
| `listMeetings` | Check calendar | `Appointment` |
| `confirmMeeting` | Confirm/cancel appointment | `Appointment` |
| `sendEmailMessage` | Send email via SMTP | `EmailMessage` |
| `sendWhatsAppMessage` | Send WhatsApp via Meta API | — |
| `makePhoneCall` | Outbound Twilio call | — |
| `listEmailInbox` | Read inbox via IMAP | `EmailThread` |
| `readEmailThread` | Read email thread | `EmailMessage` |

**Artifact Tools (4):**
| Tool | Function |
|------|----------|
| `createDocument` | Create text/code/sheet artifact |
| `editDocument` | Find-and-replace edit |
| `updateDocument` | Full document rewrite |
| `requestSuggestions` | AI improvement suggestions |

**Utility (1):**
| Tool | Function |
|------|----------|
| `getWeather` | Weather lookup |

### Tool Execution Flow

```
User message → AI processes → Decides to call tool
  → Tool executes (DB write, API call, etc.)
  → Result returned to AI
  → AI generates response using tool output
  → Response streamed to client
```

### Tool Approval Flow

When the AI calls a tool that requires user confirmation (e.g., sending an email), the system:
1. Streams the tool call to the UI with `state: "approval-required"`
2. User approves/denies in the UI
3. Response is sent back with approval state
4. AI continues with `state: "approval-responded"` or `state: "output-denied"`

---

## Streaming Pipeline

```
streamText()
  → createUIMessageStream()
    → execute: AI generates + calls tools
    → dataStream.merge() streams to client
    → onFinish: save messages to DB
    → onError: return error message
  → createUIMessageStreamResponse()
    → SSE stream to client
    → Optional: resumable stream via Redis
```

### Resumable Streams

If `REDIS_URL` is configured, streams are persisted so interrupted connections can resume without losing the AI's in-progress response.

---

## Rate Limiting

| User Type | Max Messages/Hour |
|-----------|-------------------|
| Guest | 10 |
| Regular | 10 |

IP-based rate limiting is also applied via `checkIpRateLimit`.

---

## Error Handling

| Error | Behavior |
|-------|----------|
| Invalid request | `bad_request:api` |
| No session | `unauthorized:chat` |
| Wrong user | `forbidden:chat` |
| Rate limit exceeded | `rate_limit:chat` |
| AI Gateway billing | Redirect to Vercel billing |
| Unhandled | `offline:chat` |

All errors use the `ChatbotError` class for consistent HTTP responses.
