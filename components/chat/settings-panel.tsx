"use client";

import {
  BotIcon,
  BrainCircuitIcon,
  BuildingIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  FolderOpenIcon,
  LayersIcon,
  LinkIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  PuzzleIcon,
  SettingsIcon,
  Share2Icon,
  SunIcon,
  XIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { chatModels } from "@/lib/ai/models";
import { cn } from "@/lib/utils";
import { BusinessSettings } from "./business-settings";

export type ChatMode =
  | "general"
  | "architecture"
  | "coding"
  | "creative"
  | "research";

export type AgentType =
  | "default"
  | "coder"
  | "writer"
  | "analyst"
  | "architect";

export type MCPConfig = {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
};

export type SettingsData = {
  mode: ChatMode;
  agent: AgentType;
  model: string;
  mcpServers: MCPConfig[];
  skills: string[];
  theme: string;
};

const CHAT_MODES: {
  id: ChatMode;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    id: "general",
    label: "General",
    icon: <MonitorIcon className="size-3.5" />,
    description: "Balanced assistant for all tasks",
  },
  {
    id: "architecture",
    label: "Architecture",
    icon: <LayersIcon className="size-3.5" />,
    description: "System design & architecture expert",
  },
  {
    id: "coding",
    label: "Coding",
    icon: <BotIcon className="size-3.5" />,
    description: "Code generation & debugging",
  },
  {
    id: "creative",
    label: "Creative",
    icon: <PaletteIcon className="size-3.5" />,
    description: "Writing, brainstorming, creative tasks",
  },
  {
    id: "research",
    label: "Research",
    icon: <BrainCircuitIcon className="size-3.5" />,
    description: "Deep analysis & research",
  },
];

const AGENTS: { id: AgentType; label: string; description: string }[] = [
  {
    id: "default",
    label: "Default Assistant",
    description: "General-purpose AI assistant",
  },
  {
    id: "coder",
    label: "Code Expert",
    description: "Specialized in programming & debugging",
  },
  {
    id: "writer",
    label: "Content Writer",
    description: "Expert in writing & editing",
  },
  {
    id: "analyst",
    label: "Data Analyst",
    description: "Analysis & data interpretation",
  },
  {
    id: "architect",
    label: "System Architect",
    description: "Software architecture & design patterns",
  },
];

const _DEFAULT_MCP_SERVERS: MCPConfig[] = [
  {
    id: "filesystem",
    name: "Filesystem",
    enabled: true,
    description: "Read & write local files",
  },
  {
    id: "browser",
    name: "Browser",
    enabled: false,
    description: "Web browsing & scraping",
  },
  {
    id: "memory",
    name: "Memory",
    enabled: true,
    description: "Long-term conversation memory",
  },
  {
    id: "codebase",
    name: "Codebase",
    enabled: true,
    description: "Code search & analysis",
  },
  {
    id: "database",
    name: "Database",
    enabled: false,
    description: "SQL & NoSQL queries",
  },
];

const SKILLS = [
  { id: "code-generation", label: "Code Generation" },
  { id: "code-review", label: "Code Review" },
  { id: "debugging", label: "Debugging" },
  { id: "refactoring", label: "Refactoring" },
  { id: "testing", label: "Test Writing" },
  { id: "documentation", label: "Documentation" },
  { id: "architecture", label: "Architecture Design" },
  { id: "api-design", label: "API Design" },
  { id: "database-design", label: "Database Design" },
  { id: "ui-design", label: "UI/UX Design" },
  { id: "performance", label: "Performance Optimization" },
  { id: "security", label: "Security Review" },
];

function SelectDropdown({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: { value: string; label: string; description?: string }[];
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        className="flex h-9 w-full items-center justify-between rounded-lg border border-border/50 bg-card/50 px-3 text-[13px] text-foreground transition-colors hover:bg-card/80"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronsUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop overlay */}
          {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: backdrop overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border/50 bg-card/95 p-1 shadow-[var(--shadow-float)] backdrop-blur-xl no-scrollbar">
            {options.map((opt) => (
              <button
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
                  value === opt.value
                    ? "bg-muted/70 text-foreground"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                type="button"
              >
                {value === opt.value && (
                  <CheckIcon className="size-3.5 shrink-0" />
                )}
                <div className="flex flex-col">
                  <span>{opt.label}</span>
                  {opt.description && (
                    <span className="text-[11px] text-muted-foreground/60">
                      {opt.description}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  chatId,
  onClose,
}: {
  settings: SettingsData;
  onSettingsChange: (settings: SettingsData) => void;
  chatId: string;
  onClose?: () => void;
}) {
  const { setTheme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<
    "general" | "agent" | "mcp" | "skills" | "business"
  >("general");

  const updateSettings = (partial: Partial<SettingsData>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  const tabs = [
    {
      id: "general" as const,
      label: "General",
      icon: <SettingsIcon className="size-3.5" />,
    },
    {
      id: "agent" as const,
      label: "Agent",
      icon: <BotIcon className="size-3.5" />,
    },
    {
      id: "mcp" as const,
      label: "MCPs",
      icon: <PuzzleIcon className="size-3.5" />,
    },
    {
      id: "skills" as const,
      label: "Skills",
      icon: <BrainCircuitIcon className="size-3.5" />,
    },
    {
      id: "business" as const,
      label: "Businesses",
      icon: <BuildingIcon className="size-3.5" />,
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <SettingsIcon className="size-4 text-muted-foreground" />
          <span className="text-[14px] font-medium">Settings</span>
        </div>
        {onClose && (
          <button
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-border/40 px-4 py-2">
        {tabs.map((tab) => (
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
              activeTab === tab.id
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {activeTab === "general" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label className="text-[12px] font-medium text-muted-foreground">
                Chat Mode
              </Label>
              <div className="grid grid-cols-1 gap-1.5">
                {CHAT_MODES.map((mode) => (
                  <button
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[13px] transition-all",
                      settings.mode === mode.id
                        ? "border-foreground/30 bg-muted/70 text-foreground shadow-sm"
                        : "border-border/30 text-muted-foreground hover:border-border/60 hover:bg-muted/30 hover:text-foreground"
                    )}
                    key={mode.id}
                    onClick={() => updateSettings({ mode: mode.id })}
                    type="button"
                  >
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg",
                        settings.mode === mode.id
                          ? "bg-foreground/10 text-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {mode.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{mode.label}</span>
                      <span className="text-[11px] text-muted-foreground/60">
                        {mode.description}
                      </span>
                    </div>
                    {settings.mode === mode.id && (
                      <CheckIcon className="ml-auto size-3.5 shrink-0 text-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label className="text-[12px] font-medium text-muted-foreground">
                Default Model
              </Label>
              <SelectDropdown
                onChange={(val) => updateSettings({ model: val })}
                options={chatModels.map((m) => ({
                  value: m.id,
                  label: m.name,
                  description: m.description,
                }))}
                placeholder="Select model"
                value={settings.model}
              />
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label className="text-[12px] font-medium text-muted-foreground">
                Theme
              </Label>
              <div className="flex gap-2">
                {[
                  {
                    value: "light",
                    label: "Light",
                    icon: <SunIcon className="size-3.5" />,
                  },
                  {
                    value: "dark",
                    label: "Dark",
                    icon: <MoonIcon className="size-3.5" />,
                  },
                  {
                    value: "system",
                    label: "System",
                    icon: <MonitorIcon className="size-3.5" />,
                  },
                ].map((t) => (
                  <button
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-medium transition-all",
                      resolvedTheme === t.value ||
                        (t.value === "system" && false)
                        ? "border-foreground/30 bg-muted/70 text-foreground"
                        : "border-border/30 text-muted-foreground hover:border-border/60 hover:text-foreground"
                    )}
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    type="button"
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label className="text-[12px] font-medium text-muted-foreground">
                Actions
              </Label>
              <div className="flex flex-col gap-1">
                <button
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  onClick={() => {
                    if (chatId) {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/chat/${chatId}`
                      );
                      toast.success("Chat link copied!");
                    }
                  }}
                  type="button"
                >
                  <Share2Icon className="size-3.5" />
                  Share Chat
                </button>
                <button
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  onClick={() => {
                    if (chatId) {
                      navigator.clipboard.writeText(chatId);
                      toast.success("Session ID copied!");
                    }
                  }}
                  type="button"
                >
                  <LinkIcon className="size-3.5" />
                  Copy Session ID
                </button>
                <button
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  onClick={() => {
                    toast("Opening editor...");
                  }}
                  type="button"
                >
                  <FolderOpenIcon className="size-3.5" />
                  Open Editor
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "agent" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label className="text-[12px] font-medium text-muted-foreground">
                Select Agent
              </Label>
              <div className="grid grid-cols-1 gap-1.5">
                {AGENTS.map((agent) => (
                  <button
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[13px] transition-all",
                      settings.agent === agent.id
                        ? "border-foreground/30 bg-muted/70 text-foreground shadow-sm"
                        : "border-border/30 text-muted-foreground hover:border-border/60 hover:bg-muted/30 hover:text-foreground"
                    )}
                    key={agent.id}
                    onClick={() => updateSettings({ agent: agent.id })}
                    type="button"
                  >
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg",
                        settings.agent === agent.id
                          ? "bg-foreground/10 text-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <BotIcon className="size-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{agent.label}</span>
                      <span className="text-[11px] text-muted-foreground/60">
                        {agent.description}
                      </span>
                    </div>
                    {settings.agent === agent.id && (
                      <CheckIcon className="ml-auto size-3.5 shrink-0 text-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label className="text-[12px] font-medium text-muted-foreground">
                Agent Model Override
              </Label>
              <SelectDropdown
                onChange={(val) => updateSettings({ model: val })}
                options={chatModels.map((m) => ({
                  value: m.id,
                  label: m.name,
                  description: m.description,
                }))}
                placeholder="Use default model"
                value={settings.model}
              />
              <p className="text-[11px] text-muted-foreground/50">
                Override the default model for this agent session.
              </p>
            </div>
          </div>
        )}

        {activeTab === "mcp" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-[12px] font-medium text-muted-foreground">
                  MCP Servers
                </Label>
                <span className="text-[11px] text-muted-foreground/50">
                  {settings.mcpServers.filter((m) => m.enabled).length}/
                  {settings.mcpServers.length} active
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {settings.mcpServers.map((mcp) => (
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all",
                      mcp.enabled
                        ? "border-foreground/20 bg-muted/40"
                        : "border-border/30"
                    )}
                    key={mcp.id}
                  >
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg",
                        mcp.enabled
                          ? "bg-foreground/10 text-foreground"
                          : "bg-muted text-muted-foreground/50"
                      )}
                    >
                      <PuzzleIcon className="size-3.5" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-[13px] font-medium text-foreground">
                        {mcp.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground/60">
                        {mcp.description}
                      </span>
                    </div>
                    <button
                      className={cn(
                        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                        mcp.enabled ? "bg-foreground" : "bg-muted-foreground/30"
                      )}
                      onClick={() => {
                        const updated = settings.mcpServers.map((m) =>
                          m.id === mcp.id ? { ...m, enabled: !m.enabled } : m
                        );
                        updateSettings({ mcpServers: updated });
                      }}
                      type="button"
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 size-4 rounded-full bg-background transition-transform",
                          mcp.enabled ? "translate-x-4" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-[12px] font-medium text-muted-foreground">
                  Active Skills
                </Label>
                <span className="text-[11px] text-muted-foreground/50">
                  {settings.skills.length}/{SKILLS.length} enabled
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SKILLS.map((skill) => {
                  const isActive = settings.skills.includes(skill.id);
                  return (
                    <button
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all",
                        isActive
                          ? "border-foreground/30 bg-muted/70 text-foreground"
                          : "border-border/30 text-muted-foreground hover:border-border/60 hover:text-foreground"
                      )}
                      key={skill.id}
                      onClick={() => {
                        const updated = isActive
                          ? settings.skills.filter((s) => s !== skill.id)
                          : [...settings.skills, skill.id];
                        updateSettings({ skills: updated });
                      }}
                      type="button"
                    >
                      {isActive && <CheckIcon className="size-3" />}
                      {skill.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "business" && (
          <div className="flex flex-col gap-5">
            <BusinessSettings />
          </div>
        )}
      </div>
    </div>
  );
}
