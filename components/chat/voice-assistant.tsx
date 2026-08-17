"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { memo, type SetStateAction, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVoice } from "@/hooks/use-voice";
import type { ChatMessage } from "@/lib/types";
import { cn, getTextFromMessage } from "@/lib/utils";
import { CheckedSquare, UncheckedSquare } from "./icons";

export function isSpeechSupported() {
  if (typeof window === "undefined") {
    return false;
  }
  const hasRecognition = Boolean(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition
  );
  return hasRecognition || "speechSynthesis" in window;
}

function VoiceAssistantControlsImpl({
  status,
  messages,
  sendMessage,
  setInput,
  className,
}: {
  status: UseChatHelpers<ChatMessage>["status"];
  messages: UIMessage[];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  setInput: (value: SetStateAction<string>) => void;
  className?: string;
}) {
  const {
    supported,
    listening,
    speaking,
    interimTranscript,
    finalTranscript,
    settings,
    updateSettings,
    toggleListening,
    stopListening,
    resetTranscript,
    speak,
    cancelSpeech,
    setKeepListening,
  } = useVoice();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const statusRef = useRef(status);
  statusRef.current = status;

  // Tracks which assistant responses we have already handled (for
  // auto-read and the voice mode restart). Prevents speaking or
  // re-listening for messages loaded from history.
  const seenAssistantIdsRef = useRef<Set<string>>(new Set());
  const historyLoadedRef = useRef(false);

  const lastSentTranscriptRef = useRef("");
  const pendingTranscriptRef = useRef<string | null>(null);
  const sendingRef = useRef(false);

  // Mark assistant messages loaded from history as already seen so we
  // do not speak / auto-listen for them on page load.
  useEffect(() => {
    if (!historyLoadedRef.current && messages.length > 0) {
      historyLoadedRef.current = true;
      for (const msg of messages) {
        if (msg.role === "assistant") {
          seenAssistantIdsRef.current.add(msg.id);
        }
      }
    }
  }, [messages]);

  const isGenerating = status === "submitted" || status === "streaming";

  // ---- Automation: handle a completed assistant response ------------
  useEffect(() => {
    if (status !== "ready") {
      return;
    }
    const last = messages.at(-1);
    if (!last || last.role !== "assistant") {
      return;
    }
    if (seenAssistantIdsRef.current.has(last.id)) {
      return;
    }
    seenAssistantIdsRef.current.add(last.id);

    const text = getTextFromMessage(last);
    if (settings.autoRead) {
      speak(text, settings.voiceMode);
    } else if (settings.voiceMode) {
      setKeepListening(true);
    }
  }, [
    status,
    messages,
    settings.autoRead,
    settings.voiceMode,
    speak,
    setKeepListening,
  ]);

  // ---- Automation: keep the recognizer going while voice mode is on ----
  // biome-ignore lint/correctness/useExhaustiveDependencies: restart loop is intentionally dep-free
  useEffect(() => {
    if (!mounted || !supported) {
      return;
    }
    if (settings.voiceMode && status === "ready") {
      setKeepListening(true);
    }
  }, [settings.voiceMode, status]);

  // ---- Automation: stop the recognizer while the model is generating ----
  // biome-ignore lint/correctness/useExhaustiveDependencies: only re-run when generating state changes
  useEffect(() => {
    if (isGenerating && listening) {
      stopListening();
    }
  }, [isGenerating]);

  // ---- Automation: capture transcripts as pending, send when ready -----
  useEffect(() => {
    if (!settings.voiceMode || !finalTranscript.trim()) {
      return;
    }
    const text = finalTranscript.trim();
    if (text === lastSentTranscriptRef.current) {
      return;
    }
    lastSentTranscriptRef.current = text;
    pendingTranscriptRef.current = text;
    resetTranscript();
  }, [finalTranscript, settings.voiceMode, resetTranscript]);

  useEffect(() => {
    if (
      status !== "ready" ||
      !pendingTranscriptRef.current ||
      sendingRef.current
    ) {
      return;
    }
    const text = pendingTranscriptRef.current;
    pendingTranscriptRef.current = null;
    sendingRef.current = true;

    setInput(text);
    sendMessage({
      role: "user",
      parts: [{ type: "text", text }],
    });
    setInput("");
    stopListening();
    lastSentTranscriptRef.current = "";

    // Allow the next transcript to be sent after the model finishes.
    window.setTimeout(() => {
      sendingRef.current = false;
    }, 2000);
  }, [status, sendMessage, setInput, stopListening]);

  // ---- Manual (push-to-talk): append final transcripts to the input ---
  useEffect(() => {
    if (settings.voiceMode) {
      return;
    }
    if (!finalTranscript.trim()) {
      return;
    }
    const text = finalTranscript.trim();
    setInput((prev) => {
      const combined = [prev.trim(), text].filter(Boolean).join(" ");
      return combined;
    });
    resetTranscript();
  }, [finalTranscript, settings.voiceMode, resetTranscript, setInput]);

  // ---- Cleanup when voice mode is turned off --------------------------
  useEffect(() => {
    if (!settings.voiceMode) {
      stopListening();
      pendingTranscriptRef.current = null;
    }
  }, [settings.voiceMode, stopListening]);

  if (!mounted || !supported) {
    return null;
  }

  const toggleAutoRead = () => {
    if (settings.autoRead) {
      cancelSpeech();
    }
    updateSettings({ autoRead: !settings.autoRead });
  };

  const toggleVoiceMode = () => {
    const next = !settings.voiceMode;
    updateSettings({ voiceMode: next });
    if (!next) {
      cancelSpeech();
      stopListening();
    }
  };

  const label = listening
    ? "Stop listening"
    : speaking
      ? "Playing response"
      : settings.voiceMode
        ? "Voice mode active"
        : "Start voice input";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {listening && (
        <div className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-destructive" />
          </span>
          <span className="max-w-40 truncate">
            {interimTranscript || "Listening..."}
          </span>
        </div>
      )}

      <Button
        aria-label={label}
        className={cn(
          "h-7 w-7 rounded-lg border border-border/40 p-1 transition-colors",
          listening
            ? "border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
            : speaking
              ? "text-primary"
              : "text-muted-foreground hover:border-border hover:text-foreground"
        )}
        data-testid="voice-button"
        disabled={isGenerating}
        onClick={(event) => {
          event.preventDefault();
          if (listening) {
            stopListening();
          } else {
            if (speaking) {
              cancelSpeech();
            }
            resetTranscript();
            toggleListening();
          }
        }}
        title={label}
        type="button"
        variant="ghost"
      >
        {listening ? <MicOff size={14} /> : <Mic size={14} />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Voice settings"
            className={cn(
              "h-7 w-7 rounded-lg border border-border/40 p-1 text-muted-foreground transition-colors hover:border-border hover:text-foreground",
              (settings.voiceMode || settings.autoRead) && "text-primary"
            )}
            data-testid="voice-settings-button"
            title="Voice settings"
            type="button"
            variant="ghost"
          >
            {settings.autoRead || settings.voiceMode ? (
              <Volume2 size={14} />
            ) : (
              <VolumeX size={14} />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Voice assistant</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="flex flex-col gap-1 p-1">
            <button
              className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
              data-testid="voice-mode-toggle"
              onClick={(event) => {
                event.preventDefault();
                toggleVoiceMode();
              }}
              type="button"
            >
              <span className="flex flex-col items-start gap-0.5">
                <span className="font-medium">Hands-free voice mode</span>
                <span className="text-xs text-muted-foreground">
                  Automatically listen, send, and reply in a loop
                </span>
              </span>
              {settings.voiceMode ? (
                <CheckedSquare size={16} />
              ) : (
                <UncheckedSquare size={16} />
              )}
            </button>
            <button
              className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
              data-testid="auto-read-toggle"
              onClick={(event) => {
                event.preventDefault();
                toggleAutoRead();
              }}
              type="button"
            >
              <span className="flex flex-col items-start gap-0.5">
                <span className="font-medium">Read responses aloud</span>
                <span className="text-xs text-muted-foreground">
                  Speak the assistant answer with text-to-speech
                </span>
              </span>
              {settings.autoRead ? (
                <CheckedSquare size={16} />
              ) : (
                <UncheckedSquare size={16} />
              )}
            </button>
          </div>
          <DropdownMenuSeparator />
          <div className="flex flex-col gap-2 p-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground" htmlFor="voice-rate">
                Speed
              </label>
              <input
                className="w-28 accent-foreground"
                id="voice-rate"
                max="1.5"
                min="0.5"
                onChange={(event) =>
                  updateSettings({ rate: Number(event.target.value) })
                }
                step="0.1"
                type="range"
                value={settings.rate}
              />
              <span className="w-6 text-right tabular-nums">
                {settings.rate.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground" htmlFor="voice-pitch">
                Pitch
              </label>
              <input
                className="w-28 accent-foreground"
                id="voice-pitch"
                max="1.5"
                min="0.5"
                onChange={(event) =>
                  updateSettings({ pitch: Number(event.target.value) })
                }
                step="0.1"
                type="range"
                value={settings.pitch}
              />
              <span className="w-6 text-right tabular-nums">
                {settings.pitch.toFixed(1)}
              </span>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const VoiceAssistantControls = memo(VoiceAssistantControlsImpl);
