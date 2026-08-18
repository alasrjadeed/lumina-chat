export const DEFAULT_CHAT_MODEL = "remote/deepseek-v4-flash";

export const titleModel = {
  id: "deepseek-v4-flash",
  name: "DeepSeek V4 Flash",
  provider: "deepseek",
  description: "Fast remote model for title generation",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  type: "local" | "remote" | "free";
  gatewayOrder?: string[];
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

export const chatModels: ChatModel[] = [
  // --- Free Models (Daily tokens, no API key needed for some) ---
  {
    id: "groq/llama-3.3-70b-versatile",
    name: "Llama 3.3 70B (Groq)",
    provider: "groq",
    description: "Free — 1K req/day, ultra-fast on Groq hardware",
    type: "free",
  },
  {
    id: "groq/qwen3-32b",
    name: "Qwen3 32B (Groq)",
    provider: "groq",
    description: "Free — strong coding & reasoning, fast inference",
    type: "free",
  },
  {
    id: "groq/gpt-oss-120b",
    name: "GPT-OSS 120B (Groq)",
    provider: "groq",
    description: "Free — largest open model on Groq, high quality",
    type: "free",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    description: "Free — 1M context, multimodal (text/image/audio/video)",
    type: "free",
  },
  {
    id: "google/gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    description: "Free — fast, multimodal, 1M context",
    type: "free",
  },
  {
    id: "openrouter/deepseek/deepseek-r1:free",
    name: "DeepSeek R1 (Free)",
    provider: "openrouter",
    description: "Free — top reasoning model, GPT-4 class",
    type: "free",
  },
  {
    id: "openrouter/meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B (Free)",
    provider: "openrouter",
    description: "Free — solid all-purpose, 128K context",
    type: "free",
  },
  {
    id: "openrouter/qwen/qwen3-coder-480b:free",
    name: "Qwen3 Coder 480B (Free)",
    provider: "openrouter",
    description: "Free — strongest free coding model, 262K context",
    type: "free",
  },
  {
    id: "cerebras/llama-3.3-70b",
    name: "Llama 3.3 70B (Cerebras)",
    provider: "cerebras",
    description: "Free — 1M tokens/day, fastest inference globally",
    type: "free",
  },

  // --- Local Models (Ollama) ---
  {
    id: "local/qwen2.5:1.5b",
    name: "Qwen 2.5 1.5B",
    provider: "ollama",
    description: "Fast local model with tool support",
    type: "local",
  },
  {
    id: "local/qwen2.5-coder:1.5b",
    name: "Qwen Coder 1.5B",
    provider: "ollama",
    description: "Local coding model with tool support",
    type: "local",
  },
  {
    id: "local/qwen2.5:0.5b",
    name: "Qwen 2.5 0.5B",
    provider: "ollama",
    description: "Tiny local model, fastest responses",
    type: "local",
  },
  // --- Remote Models (DeepSeek / OpenAI-compatible) ---
  {
    id: "remote/deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    provider: "deepseek",
    description: "DeepSeek V4 Flash — fast, cheap, tool use",
    type: "remote",
  },
  {
    id: "remote/deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    provider: "deepseek",
    description: "DeepSeek V4 Pro — best quality",
    type: "remote",
    reasoningEffort: "high",
  },
  {
    id: "remote/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "OpenAI compact model",
    type: "remote",
  },
  // --- Gateway Models (Vercel AI Gateway) ---
  {
    id: "deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2",
    provider: "deepseek",
    description: "Fast and capable model with tool use",
    type: "remote",
    gatewayOrder: ["bedrock", "deepinfra"],
  },
  {
    id: "moonshotai/kimi-k2.5",
    name: "Kimi K2.5",
    provider: "moonshotai",
    description: "Moonshot AI flagship model",
    type: "remote",
    gatewayOrder: ["fireworks", "bedrock"],
  },
  {
    id: "xai/grok-4.1-fast-non-reasoning",
    name: "Grok 4.1 Fast",
    provider: "xai",
    description: "Fast non-reasoning model with tool use",
    type: "remote",
    gatewayOrder: ["xai"],
  },
];

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  const localCapabilities: Record<string, ModelCapabilities> = {
    "local/qwen2.5:1.5b": { tools: true, vision: false, reasoning: false },
    "local/qwen2.5-coder:1.5b": {
      tools: true,
      vision: false,
      reasoning: false,
    },
    "local/qwen2.5:0.5b": { tools: true, vision: false, reasoning: false },
    "remote/deepseek-v4-flash": {
      tools: true,
      vision: false,
      reasoning: false,
    },
    "remote/deepseek-v4-pro": {
      tools: true,
      vision: false,
      reasoning: true,
    },
    "remote/gpt-4o-mini": { tools: true, vision: true, reasoning: false },
    // Free models — all support tools, some support vision/reasoning
    "groq/llama-3.3-70b-versatile": {
      tools: true,
      vision: false,
      reasoning: false,
    },
    "groq/qwen3-32b": { tools: true, vision: false, reasoning: true },
    "groq/gpt-oss-120b": { tools: true, vision: false, reasoning: false },
    "google/gemini-2.5-flash": {
      tools: true,
      vision: true,
      reasoning: true,
    },
    "google/gemini-2.0-flash": {
      tools: true,
      vision: true,
      reasoning: false,
    },
    "openrouter/deepseek/deepseek-r1:free": {
      tools: false,
      vision: false,
      reasoning: true,
    },
    "openrouter/meta-llama/llama-3.3-70b-instruct:free": {
      tools: true,
      vision: false,
      reasoning: false,
    },
    "openrouter/qwen/qwen3-coder-480b:free": {
      tools: true,
      vision: false,
      reasoning: false,
    },
    "cerebras/llama-3.3-70b": {
      tools: true,
      vision: false,
      reasoning: false,
    },
  };

  // Fetch gateway model capabilities
  const gatewayModels = chatModels.filter((m) => m.gatewayOrder);
  const results = await Promise.all(
    gatewayModels.map(async (model) => {
      try {
        const res = await fetch(
          `https://ai-gateway.vercel.sh/v1/models/${model.id}/endpoints`,
          { next: { revalidate: 86_400 } }
        );
        if (!res.ok) {
          return [model.id, { tools: false, vision: false, reasoning: false }];
        }

        const json = await res.json();
        const endpoints = json.data?.endpoints ?? [];
        const params = new Set(
          endpoints.flatMap(
            (e: { supported_parameters?: string[] }) =>
              e.supported_parameters ?? []
          )
        );
        const inputModalities = new Set(
          json.data?.architecture?.input_modalities ?? []
        );

        return [
          model.id,
          {
            tools: params.has("tools"),
            vision: inputModalities.has("image"),
            reasoning: params.has("reasoning"),
          },
        ];
      } catch {
        return [model.id, { tools: false, vision: false, reasoning: false }];
      }
    })
  );

  return { ...localCapabilities, ...Object.fromEntries(results) };
}

export const isDemo = process.env.IS_DEMO === "1";

type GatewayModel = {
  id: string;
  name: string;
  type?: string;
  tags?: string[];
};

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export async function getAllGatewayModels(): Promise<
  GatewayModelWithCapabilities[]
> {
  try {
    const res = await fetch("https://ai-gateway.vercel.sh/v1/models", {
      next: { revalidate: 86_400 },
    });
    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return (json.data ?? [])
      .filter((m: GatewayModel) => m.type === "language")
      .map((m: GatewayModel) => ({
        id: m.id,
        name: m.name,
        provider: m.id.split("/")[0],
        description: "",
        type: "remote" as const,
        capabilities: {
          tools: m.tags?.includes("tool-use") ?? false,
          vision: m.tags?.includes("vision") ?? false,
          reasoning: m.tags?.includes("reasoning") ?? false,
        },
      }));
  } catch {
    return [];
  }
}

export function getActiveModels(): ChatModel[] {
  const models = [...chatModels];

  const hasLocal = Boolean(process.env.LOCAL_LLM_BASE_URL);
  const hasRemote = Boolean(
    process.env.REMOTE_LLM_API_KEY || process.env.USER_LLM_API_KEY
  );
  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  const hasGoogleAi = Boolean(process.env.GOOGLE_AI_API_KEY);
  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
  const hasCerebras = Boolean(process.env.CEREBRAS_API_KEY);

  return models.filter((m) => {
    switch (m.type) {
      case "local":
        return hasLocal;
      case "remote":
        return hasRemote || m.gatewayOrder?.length;
      case "free":
        if (m.provider === "groq") {
          return hasGroq;
        }
        if (m.provider === "google") {
          return hasGoogleAi;
        }
        if (m.provider === "openrouter") {
          return hasOpenRouter;
        }
        if (m.provider === "cerebras") {
          return hasCerebras;
        }
        return false;
      default:
        return true;
    }
  });
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
