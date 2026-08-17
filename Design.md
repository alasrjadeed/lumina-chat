# Design.md — UI/UX Design System

> Visual language, component library, and design patterns.

---

## Design System

### Core Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| CSS Framework | Tailwind CSS | 4.x |
| Component Library | shadcn/ui (Radix Maia) | 22 primitives |
| Animation | Framer Motion / Motion | 11.x / 12.x |
| Icons | Lucide React | 0.446 |
| Theme | next-themes | 0.3 |
| Fonts | Geist Sans + Geist Mono | — |

### Design Tokens

Defined in `globals.css` via CSS custom properties:

```css
--background, --foreground       /* Base colors */
--card, --card-foreground        /* Card surfaces */
--popover, --popover-foreground  /* Popover surfaces */
--primary, --primary-foreground  /* Primary actions */
--secondary, --secondary-foreground
--muted, --muted-foreground      /* Subtle elements */
--accent, --accent-foreground    /* Accent highlights */
--destructive                    /* Error/danger */
--border                         /* Borders */
--input                          /* Input fields */
--ring                           /* Focus rings */
--radius                         /* Border radius */
```

### Theme Support

- **Dark mode** (default): Full dark theme
- **Light mode**: Light theme variant
- Toggle via `ThemeToggle` component
- Persisted via `next-themes`

---

## Layout System

### Root Layout (`app/layout.tsx`)

```
<html>
  <body>
    <ThemeProvider>
      <SessionProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </SessionProvider>
    </ThemeProvider>
  </body>
</html>
```

### Chat Layout (`app/(chat)/layout.tsx`)

```
┌──────────────────────────────────────────┐
│  Sidebar (AppSidebar)  │   Main Content  │
│  ┌──────────────────┐  │   ┌──────────┐  │
│  │ Logo / Brand     │  │   │  Header  │  │
│  │                  │  │   ├──────────┤  │
│  │ Chat History     │  │   │          │  │
│  │ ├─ Chat 1       │  │   │  Chat /  │  │
│  │ ├─ Chat 2       │  │   │  Office  │  │
│  │ └─ Chat N       │  │   │  Page    │  │
│  │                  │  │   │          │  │
│  │ ─────────────── │  │   │          │  │
│  │ Office Manager   │  │   │          │  │
│  │ Settings         │  │   ├──────────┤  │
│  │                  │  │   │  Input   │  │
│  └──────────────────┘  │   └──────────┘  │
└──────────────────────────────────────────┘
```

---

## Component Library

### shadcn/ui Primitives (22)

`components/ui/` contains the standard shadcn/ui set:
- **Layout**: `sidebar`, `separator`, `scroll-area`
- **Forms**: `button`, `input`, `select`, `checkbox`, `radio-group`, `slider`, `switch`, `textarea`
- **Overlay**: `dialog`, `sheet`, `popover`, `tooltip`, `dropdown-menu`
- **Navigation**: `command`, `tabs`, `breadcrumb`
- **Feedback**: `sonner` (toast), `skeleton`

### Chat Components (`components/chat/`)

35+ files covering the full chat experience:

| Component | Purpose |
|-----------|---------|
| `app-sidebar.tsx` | Main sidebar with navigation |
| `chat-header.tsx` | Top bar with model selector |
| `multimodal-input.tsx` | Message input with attachments |
| `message.tsx` | Single message rendering |
| `messages.tsx` | Message list |
| `artifact.tsx` | Artifact side panel |
| `toolbar.tsx` | Message action toolbar |
| `voice-assistant.tsx` | Voice input/output UI |
| `greeting.tsx` | Welcome screen |
| `model-selector/` | Model selection dropdown |
| `block/` | Code block rendering |

### AI Elements (`components/ai-elements/`)

Reusable AI-specific UI primitives:

| Element | Purpose |
|---------|---------|
| `conversation.tsx` | Conversation container |
| `message.tsx` | AI message with streaming |
| `code-block.tsx` | Syntax-highlighted code |
| `model-selector.tsx` | Model picker |
| `prompt-input.tsx` | Input with suggestions |
| `reasoning.tsx` | Reasoning/thinking display |
| `shimmer.tsx` | Loading skeleton |
| `suggestion.tsx` | Quick suggestion chips |
| `tool.tsx` | Tool call display |

---

## Key Pages

### 1. Chat Page (`/`)

- Greeting message with quick actions
- Multimodal input (text + file upload)
- Message list with streaming responses
- Vote buttons (thumbs up/down)
- Artifact side panel (toggled)

### 2. Individual Chat (`/chat/[id]`)

- Same as chat page but loads existing conversation
- Chat title in header
- Delete chat option

### 3. Office Manager (`/office`)

- Dedicated interface for business operations
- Business info display
- Service catalog
- Lead management
- Meeting scheduling
- Email/WhatsApp integration

### 4. Login/Register (`/login`, `/register`)

- Simple credential-based auth
- Guest access option

---

## Interaction Patterns

### Streaming Responses

AI responses stream in real-time via SSE:
- Text appears character by character
- Tool calls show as expandable blocks
- Reasoning/thinking shows in collapsible section
- Markdown renders as it arrives

### Artifact Panel

Side panel for document/code/spreadsheet editing:
- Opens when AI creates or references an artifact
- Split view: chat on left, artifact on right
- Real-time updates as AI edits
- CodeMirror for code, ProseMirror for text, DataGrid for sheets

### Voice Input

Browser-based Web Speech API:
- Click microphone to start listening
- Interim transcripts shown while speaking
- Final transcript sent as message
- Optional: text-to-speech for AI responses

### Tool Approval

When AI wants to send email/WhatsApp/make call:
- Tool call displayed with details
- User sees exactly what will happen
- Approve or deny with one click
- AI continues based on approval

---

## Responsive Design

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 768px | Single column, collapsed sidebar |
| Tablet | 768-1024px | Sidebar overlay |
| Desktop | > 1024px | Full sidebar + content |

### Mobile Considerations

- Touch-friendly input areas
- Swipeable sidebar
- Full-width messages
- Stacked artifact panel (replaces chat view)

---

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management in modals/dialogs
- Screen reader compatible message list
- High contrast in both themes
- `role="log"` on message container

---

## Animation

- **Page transitions**: Framer Motion `AnimatePresence`
- **Message appear**: Slide up + fade in
- **Typing indicator**: Pulse animation
- **Sidebar**: Slide in/out on mobile
- **Artifact panel**: Slide from right
- **Tool calls**: Expand/collapse with height animation

---

## Color System

### Dark Theme (Default)

| Token | Usage |
|-------|-------|
| `--background` | Page background |
| `--foreground` | Primary text |
| `--card` | Card/panel backgrounds |
| `--primary` | Primary buttons, links |
| `--muted` | Subtle backgrounds |
| `--accent` | Highlights, hover states |
| `--destructive` | Errors, delete actions |
| `--border` | Dividers, borders |

### Light Theme

Inverted values with appropriate contrast ratios for WCAG AA compliance.
