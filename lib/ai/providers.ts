import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { customProvider, gateway } from "ai";
import { isTestEnvironment } from "../constants";
import { titleModel } from "./models";

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": titleModel,
        },
      });
    })()
  : null;

// --- Local LLM (Ollama) ---
const hasLocalLlm = Boolean(process.env.LOCAL_LLM_BASE_URL);
const localLlm = hasLocalLlm
  ? createOpenAICompatible({
      name: "local-llm",
      apiKey: process.env.LOCAL_LLM_API_KEY || "ollama",
      baseURL: process.env.LOCAL_LLM_BASE_URL as string,
    })
  : null;

function localModel(modelId: string) {
  if (!localLlm) {
    return null;
  }
  const ollamaModel = modelId.includes("/") ? modelId.split("/")[1] : modelId;
  return localLlm(ollamaModel);
}

// --- Remote LLM (DeepSeek, OpenAI, etc.) ---
const hasRemoteLlm = Boolean(
  process.env.REMOTE_LLM_API_KEY &&
    process.env.REMOTE_LLM_BASE_URL &&
    process.env.REMOTE_LLM_MODEL
);
const remoteLlm = hasRemoteLlm
  ? createOpenAICompatible({
      name: "remote-llm",
      apiKey: process.env.REMOTE_LLM_API_KEY as string,
      baseURL: process.env.REMOTE_LLM_BASE_URL as string,
    })
  : null;

function remoteModel(modelId: string) {
  if (!remoteLlm) {
    return null;
  }
  return remoteLlm(modelId);
}

// --- Groq (free tier: 1K req/day, fast inference) ---
const hasGroq = Boolean(process.env.GROQ_API_KEY);
const groqLlm = hasGroq
  ? createOpenAICompatible({
      name: "groq",
      apiKey: process.env.GROQ_API_KEY as string,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

// --- Google AI Studio / Gemini (free tier: 1.5K req/day) ---
const hasGoogleAi = Boolean(process.env.GOOGLE_AI_API_KEY);
const googleAiLlm = hasGoogleAi
  ? createOpenAICompatible({
      name: "google-ai",
      apiKey: process.env.GOOGLE_AI_API_KEY as string,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    })
  : null;

// --- OpenRouter (free tier: 50-1000 req/day, 25+ free models) ---
const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
const openRouterLlm = hasOpenRouter
  ? createOpenAICompatible({
      name: "openrouter",
      apiKey: process.env.OPENROUTER_API_KEY as string,
      baseURL: "https://openrouter.ai/api/v1",
    })
  : null;

// --- Cerebras (free tier: 1M tokens/day, super fast) ---
const hasCerebras = Boolean(process.env.CEREBRAS_API_KEY);
const cerebrasLlm = hasCerebras
  ? createOpenAICompatible({
      name: "cerebras",
      apiKey: process.env.CEREBRAS_API_KEY as string,
      baseURL: "https://api.cerebras.ai/v1",
    })
  : null;

// --- Legacy fallback (USER_LLM_* env vars) ---
const hasUserLlmConfig = Boolean(
  process.env.USER_LLM_API_KEY &&
    process.env.USER_LLM_BASE_URL &&
    process.env.USER_LLM_MODEL
);

const userLlm = hasUserLlmConfig
  ? createOpenAICompatible({
      name: "user-llm",
      apiKey: process.env.USER_LLM_API_KEY as string,
      baseURL: process.env.USER_LLM_BASE_URL as string,
    })
  : null;

function userLlmModel() {
  if (!userLlm) {
    return null;
  }
  return userLlm(process.env.USER_LLM_MODEL as string);
}

/**
 * Resolve a language model by ID.
 *
 * Priority:
 * 1. Test mock (if IS_TEST)
 * 2. Model ID prefix match:
 *    - "local/*" or "ollama/*" -> local Ollama
 *    - "remote/*" or "deepseek/*" or "openai/*" -> remote API
 *    - "groq/*" -> Groq (free tier)
 *    - "google/*" or "gemini/*" -> Google AI Studio (free tier)
 *    - "openrouter/*" -> OpenRouter (free tier)
 *    - "cerebras/*" -> Cerebras (free tier)
 * 3. Legacy USER_LLM_* env vars (if set)
 * 4. Vercel AI Gateway (if available)
 */
export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("chat-model");
  }

  // Explicit prefix routing
  if (modelId.startsWith("local/") || modelId.startsWith("ollama/")) {
    const local = localModel(modelId);
    if (local) {
      return local;
    }
    throw new Error(
      "Local LLM not configured. Set LOCAL_LLM_BASE_URL in .env.local"
    );
  }

  if (
    modelId.startsWith("remote/") ||
    modelId.startsWith("deepseek/") ||
    modelId.startsWith("openai/")
  ) {
    const remote = remoteModel(modelId);
    if (remote) {
      return remote;
    }
    throw new Error(
      "Remote LLM not configured. Set REMOTE_LLM_API_KEY, REMOTE_LLM_BASE_URL, and REMOTE_LLM_MODEL in .env.local"
    );
  }

  if (modelId.startsWith("groq/")) {
    if (!groqLlm) {
      throw new Error("Groq not configured. Set GROQ_API_KEY in .env.local");
    }
    return groqLlm(modelId.replace("groq/", ""));
  }

  if (modelId.startsWith("google/") || modelId.startsWith("gemini/")) {
    if (!googleAiLlm) {
      throw new Error(
        "Google AI Studio not configured. Set GOOGLE_AI_API_KEY in .env.local"
      );
    }
    const googleModel = modelId.replace("google/", "").replace("gemini/", "");
    return googleAiLlm(googleModel);
  }

  if (modelId.startsWith("openrouter/")) {
    if (!openRouterLlm) {
      throw new Error(
        "OpenRouter not configured. Set OPENROUTER_API_KEY in .env.local"
      );
    }
    return openRouterLlm(modelId.replace("openrouter/", ""));
  }

  if (modelId.startsWith("cerebras/")) {
    if (!cerebrasLlm) {
      throw new Error(
        "Cerebras not configured. Set CEREBRAS_API_KEY in .env.local"
      );
    }
    return cerebrasLlm(modelId.replace("cerebras/", ""));
  }

  // Auto-detect: try local first, then remote, then legacy, then gateway
  const local = localModel(modelId);
  if (local) {
    return local;
  }

  const remote = remoteModel(modelId);
  if (remote) {
    return remote;
  }

  const userModel = userLlmModel();
  if (userModel) {
    return userModel;
  }

  // Gateway fallback (Vercel deployments)
  try {
    return gateway.languageModel(modelId);
  } catch {
    throw new Error(
      `No provider found for model "${modelId}". Configure LOCAL_LLM_*, REMOTE_LLM_*, GROQ_API_KEY, GOOGLE_AI_API_KEY, OPENROUTER_API_KEY, or CEREBRAS_API_KEY in .env.local, or deploy to Vercel with AI Gateway.`
    );
  }
}

/**
 * Resolve the title generation model.
 * Tries local -> remote -> groq -> google -> legacy -> gateway.
 */
export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }

  const local = localModel(titleModel.id);
  if (local) {
    return local;
  }

  const remote = remoteModel(titleModel.id);
  if (remote) {
    return remote;
  }

  // Use Groq for title generation if available (fast)
  if (groqLlm) {
    return groqLlm("llama-3.1-8b-instant");
  }

  // Use Google AI Studio if available
  if (googleAiLlm) {
    return googleAiLlm("gemini-2.0-flash");
  }

  const userModel = userLlmModel();
  if (userModel) {
    return userModel;
  }

  try {
    return gateway.languageModel(titleModel.id);
  } catch {
    const anyLocal = localModel("qwen2.5:1.5b");
    if (anyLocal) {
      return anyLocal;
    }
    throw new Error("No model available for title generation.");
  }
}

/**
 * Check which providers are available.
 */
export function getAvailableProviders() {
  return {
    local: hasLocalLlm,
    remote: hasRemoteLlm,
    groq: hasGroq,
    googleAi: hasGoogleAi,
    openRouter: hasOpenRouter,
    cerebras: hasCerebras,
    gateway: true, // Always try gateway as fallback
  };
}
