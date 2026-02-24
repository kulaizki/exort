import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  type Content,
  type Part,
} from "@google/genai";
import type { ChatMessage } from "@exort/db";
import { config } from "../../config/index.js";
import { coachTools } from "./tools.js";
import { executeToolCall } from "./handlers.js";
import { buildSystemPrompt, type PromptContext } from "./prompt.js";

const MAX_ROUNDS = 5;
const MODEL = "gemini-2.5-flash";

function getClient() {
  return new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
}

interface ToolCallLog {
  name: string;
  args: Record<string, unknown>;
}

export interface GeminiResult {
  text: string;
  toolCalls: ToolCallLog[];
}

/** Convert stored ChatMessages to Gemini Content[] (text only, no replayed function calls). */
function buildHistory(messages: ChatMessage[]): Content[] {
  return messages.map((m) => ({
    role: m.role === "USER" ? "user" : "model",
    parts: [{ text: m.content }],
  }));
}

/** Run the agentic Gemini loop: send message, handle function calls, return final text. */
export async function geminiChat(
  userId: string,
  userMessage: string,
  history: ChatMessage[],
  gameId?: string | null,
  lichessUsername?: string | null,
): Promise<GeminiResult> {
  const ai = getClient();
  const toolCalls: ToolCallLog[] = [];
  const promptCtx: PromptContext = { gameId, lichessUsername };

  // Build conversation contents: history + current user message
  const contents: Content[] = [
    ...buildHistory(history),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: buildSystemPrompt(promptCtx),
        tools: [{ functionDeclarations: coachTools }],
        toolConfig: {
          functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
        },
      },
    });

    const functionCallParts = response.functionCalls;

    if (functionCallParts && functionCallParts.length > 0) {
      // Append the model's function call turn
      const modelParts: Part[] = functionCallParts.map((fc) => ({
        functionCall: { name: fc.name!, args: fc.args ?? {} },
      }));
      contents.push({ role: "model", parts: modelParts });

      // Execute each function call and build response parts
      const responseParts: Part[] = [];
      for (const fc of functionCallParts) {
        const name = fc.name!;
        const args = (fc.args ?? {}) as Record<string, unknown>;

        // Inject session gameId if tool is get_game_analysis and no gameId provided
        if (name === "get_game_analysis" && !args.gameId && gameId) {
          args.gameId = gameId;
        }

        toolCalls.push({ name, args });
        const result = await executeToolCall(userId, name, args);

        // Wrap arrays in an object — Gemini expects response to be Record<string, unknown>
        const response = Array.isArray(result) ? { data: result } : result;
        responseParts.push({
          functionResponse: {
            name,
            response: response as Record<string, unknown>,
          },
        });
      }

      contents.push({ role: "user", parts: responseParts });
      continue;
    }

    // No function calls — return text response
    const text =
      response.text ??
      "I wasn't able to generate a response. Please try again.";
    return { text, toolCalls };
  }

  // Safety limit reached
  return {
    text: "I gathered a lot of data but hit my analysis limit. Here's what I can tell you based on what I found — please ask a follow-up for more details.",
    toolCalls,
  };
}

// ─── Streaming ──────────────────────────────────────────

export type StreamEvent =
  | { type: "tool_call"; name: string; label: string }
  | { type: "tool_result"; name: string }
  | { type: "text"; content: string }
  | { type: "error"; message: string };

const TOOL_LABELS: Record<string, string> = {
  get_performance_summary: "Checking performance stats",
  get_recent_games: "Looking at recent games",
  get_game_analysis: "Analyzing game details",
  get_opening_stats: "Reviewing openings",
  get_weakness_report: "Identifying areas to improve",
  get_rating_history: "Checking rating trend",
};

/** Streaming agentic loop — yields SSE events as they happen. */
export async function* geminiChatStream(
  userId: string,
  userMessage: string,
  history: ChatMessage[],
  gameId?: string | null,
  lichessUsername?: string | null,
): AsyncGenerator<StreamEvent> {
  const ai = getClient();

  const contents: Content[] = [
    ...buildHistory(history),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const requestConfig = {
    systemInstruction: buildSystemPrompt({ gameId, lichessUsername }),
    tools: [{ functionDeclarations: coachTools }],
    toolConfig: {
      functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
    },
  };

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents,
      config: requestConfig,
    });

    // Collect all chunks to detect function calls vs text
    const functionCalls: { name: string; args: Record<string, unknown> }[] = [];
    let hasText = false;

    for await (const chunk of stream) {
      if (chunk.functionCalls && chunk.functionCalls.length > 0) {
        for (const fc of chunk.functionCalls) {
          functionCalls.push({
            name: fc.name!,
            args: (fc.args ?? {}) as Record<string, unknown>,
          });
        }
      }
      if (chunk.text) {
        hasText = true;
        yield { type: "text", content: chunk.text };
      }
    }

    if (hasText) return;

    if (functionCalls.length > 0) {
      const modelParts: Part[] = functionCalls.map((fc) => ({
        functionCall: { name: fc.name, args: fc.args },
      }));
      contents.push({ role: "model", parts: modelParts });

      const responseParts: Part[] = [];
      for (const fc of functionCalls) {
        if (fc.name === "get_game_analysis" && !fc.args.gameId && gameId) {
          fc.args.gameId = gameId;
        }

        yield {
          type: "tool_call",
          name: fc.name,
          label: TOOL_LABELS[fc.name] ?? fc.name,
        };

        const result = await executeToolCall(userId, fc.name, fc.args);
        const wrappedResponse = Array.isArray(result)
          ? { data: result }
          : result;
        responseParts.push({
          functionResponse: {
            name: fc.name,
            response: wrappedResponse as Record<string, unknown>,
          },
        });

        yield { type: "tool_result", name: fc.name };
      }

      contents.push({ role: "user", parts: responseParts });
      continue;
    }
  }

  yield {
    type: "text",
    content:
      "I gathered a lot of data but hit my analysis limit. Please ask a follow-up for more details.",
  };
}

/** Generate a short title for a chat session based on the user's first message. */
export async function generateTitle(userMessage: string): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: userMessage,
    config: {
      systemInstruction:
        "Generate a short title (max 6 words) for a chess coaching conversation that starts with this message. Return ONLY the title, no quotes, no punctuation at the end.",
      maxOutputTokens: 30,
    },
  });
  return response.text?.trim() || "New conversation";
}
