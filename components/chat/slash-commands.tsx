"use client";

import {
  BombIcon,
  BotIcon,
  BrainCircuitIcon,
  CircleHelpIcon,
  CopyIcon,
  ExternalLinkIcon,
  LayersIcon,
  LinkIcon,
  ListIcon,
  PaletteIcon,
  PenLineIcon,
  PenSquareIcon,
  PuzzleIcon,
  Share2Icon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type SlashCommand = {
  name: string;
  description: string;
  icon: ReactNode;
  action: string;
  category: string;
  shortcut?: string;
};

export const slashCommands: SlashCommand[] = [
  // Help
  {
    name: "help",
    description: "Show all available commands",
    icon: <CircleHelpIcon className="size-3.5" />,
    action: "help",
    category: "Help",
  },

  // Chat management
  {
    name: "new",
    description: "Start a new chat",
    icon: <PenSquareIcon className="size-3.5" />,
    action: "new",
    category: "Chat",
  },
  {
    name: "clear",
    description: "Clear current chat messages",
    icon: <Trash2Icon className="size-3.5" />,
    action: "clear",
    category: "Chat",
  },
  {
    name: "rename",
    description: "Rename current chat session",
    icon: <PenLineIcon className="size-3.5" />,
    action: "rename",
    category: "Chat",
  },
  {
    name: "delete",
    description: "Delete current chat",
    icon: <XIcon className="size-3.5" />,
    action: "delete",
    category: "Chat",
  },
  {
    name: "purge",
    description: "Delete all chats",
    icon: <BombIcon className="size-3.5" />,
    action: "purge",
    category: "Chat",
  },

  // Session
  {
    name: "session",
    description: "Switch to another chat session",
    icon: <ListIcon className="size-3.5" />,
    action: "session",
    category: "Session",
  },
  {
    name: "copy-session",
    description: "Copy current session ID to clipboard",
    icon: <CopyIcon className="size-3.5" />,
    action: "copy-session",
    category: "Session",
  },
  {
    name: "copy-transcript",
    description: "Copy full chat transcript to clipboard",
    icon: <CopyIcon className="size-3.5" />,
    action: "copy-transcript",
    category: "Session",
  },
  {
    name: "share-session",
    description: "Share session link to clipboard",
    icon: <Share2Icon className="size-3.5" />,
    action: "share-session",
    category: "Session",
  },

  // Model & Agent
  {
    name: "model",
    description: "Switch AI model",
    icon: <BrainCircuitIcon className="size-3.5" />,
    action: "model",
    category: "Model",
    shortcut: "Ctrl+M",
  },
  {
    name: "agent",
    description: "Switch AI agent persona",
    icon: <BotIcon className="size-3.5" />,
    action: "agent",
    category: "Agent",
  },

  // Mode
  {
    name: "mode",
    description:
      "Switch chat mode (general, architecture, coding, creative, research)",
    icon: <LayersIcon className="size-3.5" />,
    action: "mode",
    category: "Mode",
  },

  // MCP
  {
    name: "mcp",
    description: "Toggle MCP servers on/off",
    icon: <PuzzleIcon className="size-3.5" />,
    action: "mcp",
    category: "MCP",
  },

  // Skills
  {
    name: "skills",
    description: "View and manage active skills",
    icon: <BrainCircuitIcon className="size-3.5" />,
    action: "skills",
    category: "Skills",
  },

  // Share & Link
  {
    name: "share",
    description: "Share this chat via link",
    icon: <ExternalLinkIcon className="size-3.5" />,
    action: "share",
    category: "Share",
  },
  {
    name: "link",
    description: "Copy chat link to clipboard",
    icon: <LinkIcon className="size-3.5" />,
    action: "link",
    category: "Share",
  },

  // Theme
  {
    name: "theme",
    description: "Toggle dark/light mode",
    icon: <PaletteIcon className="size-3.5" />,
    action: "theme",
    category: "Appearance",
  },

  // Settings & Editor
  {
    name: "settings",
    description: "Open settings panel",
    icon: <ListIcon className="size-3.5" />,
    action: "settings",
    category: "System",
  },
  {
    name: "editor",
    description: "Open code editor",
    icon: <ExternalLinkIcon className="size-3.5" />,
    action: "editor",
    category: "System",
  },
  {
    name: "exit",
    description: "Exit to home screen",
    icon: <XIcon className="size-3.5" />,
    action: "exit",
    category: "System",
  },
];

type SlashCommandMenuProps = {
  query: string;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
  selectedIndex: number;
};

export function SlashCommandMenu({
  query,
  onSelect,
  onClose: _onClose,
  selectedIndex,
}: SlashCommandMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const filtered = slashCommands.filter((cmd) =>
    cmd.name.startsWith(query.toLowerCase())
  );

  const grouped = filtered.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) {
        acc[cmd.category] = [];
      }
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, SlashCommand[]>
  );

  useEffect(() => {
    const selected = menuRef.current?.querySelector("[data-selected='true']");
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, []);

  if (filtered.length === 0) {
    return null;
  }

  let globalIndex = 0;

  return (
    <div
      className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-border/50 bg-card/95 shadow-[var(--shadow-float)] backdrop-blur-xl"
      ref={menuRef}
    >
      <div className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
        Commands
      </div>
      <div className="max-h-80 overflow-y-auto pb-1 no-scrollbar">
        {Object.entries(grouped).map(([category, commands]) => (
          <div key={category}>
            <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/30">
              {category}
            </div>
            {commands.map((cmd) => {
              const idx = globalIndex++;
              return (
                <button
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
                    idx === selectedIndex ? "bg-muted/70" : "hover:bg-muted/40"
                  )}
                  data-selected={idx === selectedIndex}
                  key={cmd.name}
                  onClick={() => onSelect(cmd)}
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center text-muted-foreground/60">
                    {cmd.icon}
                  </div>
                  <span className="font-mono text-[13px] text-foreground">
                    /{cmd.name}
                  </span>
                  <span className="text-[12px] text-muted-foreground/50">
                    {cmd.description}
                  </span>
                  {cmd.shortcut && (
                    <span className="ml-auto text-[11px] text-muted-foreground/30">
                      {cmd.shortcut}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
