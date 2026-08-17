# Rules.md — Development Rules & Conventions

> Code standards, patterns, and conventions for this project.

---

## 1. Tech Stack Rules

- **Framework**: Next.js 16 App Router (no Pages Router)
- **Language**: TypeScript strict mode (no `any` types)
- **React**: React 19 with React Compiler enabled
- **Styling**: Tailwind CSS 4 — no inline styles, no CSS modules
- **Components**: shadcn/ui — use existing primitives, don't rebuild
- **State**: Server Components by default, Client Components only when needed
- **Package manager**: pnpm (never npm or yarn)

---

## 2. File Organization

```
app/           → Pages, layouts, API routes (App Router)
components/    → React components (ui/, chat/, ai-elements/)
hooks/         → Custom React hooks (use-* prefix)
lib/           → Business logic, utilities, DB
  ai/          → Models, providers, prompts, tools
  business/    → External integrations
  db/          → Schema, queries, migrations
artifacts/     → Artifact type implementations
tests/         → Playwright E2E tests
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `multimodal-input.tsx` |
| Components | PascalCase | `AppSidebar` |
| Hooks | `use-` prefix | `useActiveChat` |
| Functions | camelCase | `getBusinessConfig` |
| Types | PascalCase | `BusinessConfig` |
| DB tables | PascalCase | `Lead`, `Appointment` |
| DB columns | camelCase | `createdAt`, `serviceInterest` |
| API routes | kebab-case | `/api/webhooks/whatsapp` |
| Env vars | SCREAMING_SNAKE | `POSTGRES_URL` |

---

## 3. Component Rules

### Server vs Client

- **Default to Server Components** — only add `"use client"` when you need:
  - Browser APIs (localStorage, window, speech)
  - Event handlers (onClick, onChange)
  - State (useState, useRef)
  - Effects (useEffect)

### Component Structure

```tsx
// 1. Imports (external, then internal)
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Types
type Props = { title: string };

// 3. Component
export function MyComponent({ title }: Props) {
  // 4. Hooks
  const [state, setState] = useState("");

  // 5. Handlers
  const handleClick = () => {};

  // 6. Render
  return <div>{title}</div>;
}
```

### shadcn/ui Usage

- Always import from `@/components/ui/`, never from `@radix-ui` directly
- Extend via `cn()` utility for class overrides
- Never modify primitive components — create wrappers instead

---

## 4. API Route Rules

### Structure

```ts
// app/(chat)/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";

export async function GET(request: NextRequest) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate input
  // 3. Execute logic
  // 4. Return response
}
```

### Error Handling

- Use `ChatbotError` for all business errors
- Never expose raw database errors to clients
- Always return structured JSON errors with status codes

---

## 5. Database Rules

### Schema

- Use Drizzle ORM — never raw SQL
- UUID primary keys (default random)
- Timestamps: `createdAt` (default now), `updatedAt` (default now)
- Enums: use `varchar` with `enum` array (Drizzle pattern)
- Foreign keys: use `.references()` with `onDelete` where appropriate

### Queries

- Always wrap in try/catch with `ChatbotError`
- Use transactions for multi-step deletions
- Validate inputs before querying
- Return `.returning()` for write operations

---

## 6. AI Tool Rules

### Creating a New Tool

```ts
export const myTool = tool({
  description: "Clear description of what this does. Be specific.",
  inputSchema: z.object({
    param: z.string().describe("What this param is for"),
  }),
  execute: async (input) => {
    // 1. Validate input
    // 2. Execute business logic
    // 3. Return structured result
    return { ok: true, data: result };
  },
});
```

### Guidelines

- Always use `zod` for input validation
- Include `.describe()` on every field
- Return `{ ok: true, ... }` or `{ ok: false, error: "..." }`
- Never throw from tools — return error objects
- Keep tools focused — one responsibility each

---

## 7. Prompt Rules

### System Prompt Composition

- `regularPrompt`: Base personality (always loaded)
- `officeManagerPrompt`: Business context (loaded when tools available)
- `artifactsPrompt`: Artifact rules (loaded when tools available)

### Guidelines

- Be specific about tool usage in prompts
- Include examples of when NOT to use tools
- Never hardcode prices in prompts — always reference the catalog
- Keep prompts under 2000 tokens

---

## 8. Security Rules

- Never log secrets, API keys, or passwords
- Never commit `.env` files
- Always verify webhook signatures
- Always authenticate API routes
- Use `server-only` import for server code
- Validate all external inputs with zod
- Rate limit all public endpoints

---

## 9. Git Rules

### Commit Messages

```
type(scope): description

feat(chat): add voice input support
fix(whatsapp): verify webhook signature
docs(readme): update setup instructions
refactor(db): consolidate query functions
```

### Branch Naming

```
feature/voice-input
fix/whatsapp-signature
refactor/db-queries
```

---

## 10. Testing Rules

- E2E tests with Playwright
- Test critical paths: auth, chat, API, office tools
- Run `pnpm check` before committing (Biome linter)
- Run `pnpm test` for E2E tests

---

## 11. Performance Rules

- Use React Server Components by default
- Lazy load heavy components (editors, voice)
- Cache AI Gateway responses (24h revalidate)
- Use `next: { revalidate }` for API fetches
- Never block the main thread with large operations

---

## 12. Deployment Rules

- `pnpm build` must pass before merge
- No secrets in source code
- Environment variables documented in `.env.example`
- Vercel deployment via `vercel.json`
- Self-hosted: set `USER_LLM_*` env vars
