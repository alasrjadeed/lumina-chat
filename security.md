# security.md — Security Documentation

> Threat model, security controls, and hardening guide.

---

## 1. Threat Model

### Assets to Protect

| Asset | Sensitivity | Location |
|-------|-------------|----------|
| User credentials | Critical | PostgreSQL |
| Chat messages | High | PostgreSQL |
| Business leads | High | PostgreSQL |
| Email credentials | Critical | Env vars |
| WhatsApp tokens | Critical | Env vars |
| Twilio credentials | Critical | Env vars |
| API keys | Critical | Env vars |
| Session tokens | High | Redis/Cookie |

### Attack Surface

| Vector | Entry Point | Risk |
|--------|-------------|------|
| Web UI | Browser | XSS, CSRF, session hijack |
| API routes | HTTP requests | Injection, auth bypass |
| Webhooks | External services | Spoofing, replay attacks |
| LLM | Prompt injection | Data exfiltration, tool abuse |
| File uploads | Vercel Blob | Malicious files |
| Database | Direct queries | SQL injection |

---

## 2. Authentication & Authorization

### Session Management

- **Provider**: NextAuth.js 5 (beta) with credentials + guest providers
- **Storage**: Encrypted session cookie
- **Duration**: Browser session (no persistent tokens)

### Access Control

| Resource | Auth Required | Owner Check |
|----------|---------------|-------------|
| Chat messages | Yes | `chat.userId === session.user.id` |
| Documents | Yes | `document.userId === session.user.id` |
| API routes | Yes (most) | Per-route validation |
| Webhooks | Signature | HMAC verification |
| Email sync | Yes | `auth()` check added |

### Guest Access

- Rate limited: 10 messages/hour
- Cannot access other users' data
- Anonymous session (no PII stored)

---

## 3. Input Validation

### API Inputs

All API inputs validated with Zod schemas:

```ts
// app/(chat)/api/chat/schema.ts
export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({...}).optional(),
  messages: z.array(z.object({...})).optional(),
  selectedChatModel: z.string(),
  selectedVisibilityType: z.enum(["public", "private"]),
});
```

### Tool Inputs

All AI tools use Zod validation:

```ts
inputSchema: z.object({
  to: z.string().email().describe("Recipient email"),
  subject: z.string().describe("Email subject"),
  body: z.string().describe("Plain text email body"),
});
```

### Webhook Inputs

- WhatsApp: HMAC-SHA256 signature verification
- Voice: Twilio request validation (FormData)
- Social: Signature verification

---

## 4. Webhook Security

### WhatsApp Webhook

```
1. Verify WHATSAPP_WEBHOOK_VERIFY_TOKEN is set
2. Check x-hub-signature-256 header
3. Compute HMAC-SHA256 of raw body with token
4. Compare with header value
5. Reject if mismatch
```

**Critical**: If `WHATSAPP_WEBHOOK_VERIFY_TOKEN` is not set, the webhook **rejects all requests** (fail-closed).

### GET Verification (Meta challenge)

- Only responds to `hub.mode === "subscribe"`
- Only responds when `hub.verify_token` matches env var
- Returns challenge string on success

---

## 5. Rate Limiting

### IP-Based

- `checkIpRateLimit(ipAddress)` on every chat request
- Prevents abuse from single IPs

### User-Based

| User Type | Limit | Window |
|-----------|-------|--------|
| Guest | 10 messages | 1 hour |
| Regular | 10 messages | 1 hour |

Enforced in `POST /api/chat` before processing.

---

## 6. Data Protection

### At Rest

- Passwords hashed with bcrypt (`bcrypt-ts`)
- Session data encrypted in cookie
- Database: PostgreSQL with SSL

### In Transit

- All external communication over HTTPS
- Database connections via SSL
- Redis connections via TLS (when configured)

### PII Handling

- Chat messages stored per-user (owner check on every access)
- Leads contain contact info (name, email, phone)
- Email content stored in DB (body text)
- No analytics/tracking of message content

---

## 7. LLM Security

### Prompt Injection Mitigation

- System prompts clearly define AI boundaries
- AI cannot access other users' data
- AI cannot modify system configuration
- Tool approval flow for destructive actions (email, WhatsApp, calls)

### Tool Guardrails

- Tools return `{ ok: false, error: "..." }` on failure — never throw
- Email/WhatsApp tools require recipient confirmation before sending
- Phone calls require explicit user request
- All tool results fed back to LLM — no direct execution

### Rate Limits

- Max 5 tool steps per response (`stepCountIs(5)`)
- Prevents infinite tool call loops

---

## 8. Infrastructure Security

### Vercel

- Automatic HTTPS
- Edge network DDoS protection
- BotID bot detection on all routes
- `poweredByHeader: false` (hides framework)

### Environment Variables

- Never committed to git (`.env` in `.gitignore`)
- Documented in `.env.example` without values
- Separate vars for dev/staging/production

### Dependencies

- Regular `pnpm update` for security patches
- No known vulnerabilities in current lockfile

---

## 9. Error Handling

### Error Leaks

- Raw database errors logged but not exposed to clients
- `ChatbotError` wraps all errors with safe messages
- `visibilityBySurface` controls what gets logged vs returned
- Stack traces never sent to client

### Logging

- OpenTelemetry for server + client observability
- Structured error logging with codes
- No PII in logs (error codes only)

---

## 10. Security Checklist

### Deployment

- [ ] `AUTH_SECRET` is set and strong (32+ chars)
- [ ] `POSTGRES_URL` uses SSL
- [ ] `WHATSAPP_WEBHOOK_VERIFY_TOKEN` is set
- [ ] `SMTP_*` credentials are strong
- [ ] `TWILIO_*` credentials are secure
- [ ] No secrets in source code
- [ ] `.env` is in `.gitignore`
- [ ] `poweredByHeader: false` in next.config

### Runtime

- [ ] HTTPS enforced (Vercel default)
- [ ] Rate limiting active
- [ ] Webhook signatures verified
- [ ] Auth checks on all API routes
- [ ] Tool approval for destructive actions
- [ ] Error messages don't leak internals

### Monitoring

- [ ] OpenTelemetry configured
- [ ] Error alerts set up
- [ ] Rate limit alerts set up
- [ ] Webhook failure alerts set up

---

## 11. Incident Response

### If Credentials Leak

1. Rotate all affected credentials immediately
2. Check access logs for unauthorized use
3. Review git history for committed secrets
4. Force re-deploy with new env vars

### If Webhook Compromised

1. Remove `WHATSAPP_WEBHOOK_VERIFY_TOKEN` to reject all requests
2. Verify and regenerate token
3. Review created leads for spam
4. Update token in Meta dashboard

### If Database Compromised

1. Rotate `POSTGRES_URL` password
2. Review query logs for suspicious patterns
3. Audit lead/contact data access
4. Notify affected users if PII exposed
