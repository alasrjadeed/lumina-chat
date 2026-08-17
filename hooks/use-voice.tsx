"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Minimal Web Speech API typings (not part of standard TS DOM lib).
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

type SpeechRecognitionErrorLike = {
  error?: string;
  message?: string;
};

type VoiceSettings = {
  /** Hands-free automated conversation loop */
  voiceMode: boolean;
  /** Read the assistant response aloud */
  autoRead: boolean;
  /** Speech recognition language */
  lang: string;
  /** Speech synthesis rate (0.1 - 10) */
  rate: number;
  /** Speech synthesis pitch (0 - 2) */
  pitch: number;
};

type VoiceContextValue = {
  /** Whether the browser supports speech recognition and/or synthesis */
  supported: boolean;
  listening: boolean;
  speaking: boolean;
  /** Interim (partial) transcript while listening */
  interimTranscript: string;
  /** Final transcript accumulated during the current listening session */
  finalTranscript: string;
  settings: VoiceSettings;
  updateSettings: (patch: Partial<VoiceSettings>) => void;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  /** Clear the accumulated final transcript for the current session */
  resetTranscript: () => void;
  /** Speak text aloud. When `resume` is true the recognizer restarts when speech ends. */
  speak: (text: string, resume?: boolean) => void;
  cancelSpeech: () => void;
  /** When enabled, keeps the recognizer running (restarting after silence/end). */
  setKeepListening: (enabled: boolean) => void;
};

const DEFAULT_SETTINGS: VoiceSettings = {
  voiceMode: false,
  autoRead: false,
  lang: "en-US",
  rate: 1,
  pitch: 1,
};

const STORAGE_KEY = "voice-settings";

const VoiceContext = createContext<VoiceContextValue | null>(null);

function loadSettings(): VoiceSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function getSpeechRecognitionClass(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") {
    return null;
  }
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [supported, setSupported] = useState(false);

  // Load settings and detect support only on the client to avoid hydration mismatches
  useEffect(() => {
    setSettings(loadSettings());
    setSupported(Boolean(getSpeechRecognitionClass()));
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* storage unavailable */
    }
  }, [settings]);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const settingsRef = useRef(settings);
  const keepListeningRef = useRef(false);
  const sessionFinalRef = useRef("");
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const updateSettings = useCallback((patch: Partial<VoiceSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const stopListening = useCallback(() => {
    keepListeningRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      try {
        recognition.abort();
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null;
    }
    setListening(false);
    setInterimTranscript("");
  }, []);

  const startListening = useCallback(() => {
    const SR = getSpeechRecognitionClass();
    if (!SR) {
      return;
    }

    // Avoid creating a duplicate recognizer when one is already active.
    if (recognitionRef.current) {
      return;
    }

    // Cancel any ongoing speech before starting to listen.
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const recognition = new SR();
    recognition.lang = settingsRef.current.lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (const result of Array.from(event.results)) {
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      setInterimTranscript(interim);
      if (final) {
        sessionFinalRef.current = (
          sessionFinalRef.current +
          " " +
          final
        ).trim();
        setFinalTranscript(sessionFinalRef.current);
      }
    };

    recognition.onerror = (event) => {
      // 'no-speech' and 'aborted' are normal terminations; others stop the loop.
      if (event.error && !["no-speech", "aborted"].includes(event.error)) {
        keepListeningRef.current = false;
      }
    };

    recognition.onend = () => {
      setListening(false);
      setInterimTranscript("");
      if (keepListeningRef.current && recognitionRef.current === recognition) {
        restartTimerRef.current = setTimeout(() => {
          if (
            keepListeningRef.current &&
            recognitionRef.current === recognition
          ) {
            try {
              recognition.start();
            } catch {
              /* start() may throw if already started */
            }
          }
        }, 400);
      } else if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      /* start() may throw if already started */
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      setFinalTranscript("");
      sessionFinalRef.current = "";
      keepListeningRef.current = true;
      startListening();
    }
  }, [listening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    sessionFinalRef.current = "";
    setFinalTranscript("");
    setInterimTranscript("");
  }, []);

  const setKeepListening = useCallback(
    (enabled: boolean) => {
      keepListeningRef.current = enabled;
      if (enabled) {
        startListening();
      } else {
        stopListening();
      }
    },
    [startListening, stopListening]
  );

  const speak = useCallback(
    (text: string, resume = false) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }
      const clean = text.trim();
      if (!clean) {
        return;
      }
      window.speechSynthesis.cancel();

      if (resume) {
        keepListeningRef.current = true;
      }

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = settingsRef.current.lang;
      utterance.rate = settingsRef.current.rate;
      utterance.pitch = settingsRef.current.pitch;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (voice) => voice.lang === settingsRef.current.lang
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        if (keepListeningRef.current) {
          startListening();
        }
      };
      utterance.onerror = () => {
        setSpeaking(false);
        if (keepListeningRef.current) {
          startListening();
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [startListening]
  );

  const cancelSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  useEffect(
    () => () => {
      stopListening();
      cancelSpeech();
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
    },
    [stopListening, cancelSpeech]
  );

  const value = useMemo<VoiceContextValue>(
    () => ({
      supported,
      listening,
      speaking,
      interimTranscript,
      finalTranscript,
      settings,
      updateSettings,
      startListening,
      stopListening,
      toggleListening,
      resetTranscript,
      speak,
      cancelSpeech,
      setKeepListening,
    }),
    [
      supported,
      listening,
      speaking,
      interimTranscript,
      finalTranscript,
      settings,
      updateSettings,
      startListening,
      stopListening,
      toggleListening,
      resetTranscript,
      speak,
      cancelSpeech,
      setKeepListening,
    ]
  );

  return (
    <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
  );
}

export function useVoice(): VoiceContextValue {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error("useVoice must be used within VoiceProvider");
  }
  return context;
}
