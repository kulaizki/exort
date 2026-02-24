import { GoogleGenAI, FunctionCallingConfigMode, type Content, type Part } from '@google/genai';
import type { ChatMessage } from '@exort/db';
import { config } from '../../config/index.js';
import { coachTools } from './tools.js';
import { executeToolCall } from './handlers.js';
import { buildSystemPrompt } from './prompt.js';

const MAX_ROUNDS = 5;
const MODEL = 'gemini-2.5-flash';

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
    role: m.role === 'USER' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));
}

/** Run the agentic Gemini loop: send message, handle function calls, return final text. */
export async function geminiChat(
  userId: string,
  userMessage: string,
  history: ChatMessage[],
  gameId?: string | null
): Promise<GeminiResult> {
  const ai = getClient();
  const toolCalls: ToolCallLog[] = [];

  // Build conversation contents: history + current user message
  const contents: Content[] = [
    ...buildHistory(history),
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: buildSystemPrompt(gameId),
        tools: [{ functionDeclarations: coachTools }],
        toolConfig: {
          functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO }
        }
      }
    });

    const functionCallParts = response.functionCalls;

    if (functionCallParts && functionCallParts.length > 0) {
      // Append the model's function call turn
      const modelParts: Part[] = functionCallParts.map((fc) => ({
        functionCall: { name: fc.name!, args: fc.args ?? {} }
      }));
      contents.push({ role: 'model', parts: modelParts });

      // Execute each function call and build response parts
      const responseParts: Part[] = [];
      for (const fc of functionCallParts) {
        const name = fc.name!;
        const args = (fc.args ?? {}) as Record<string, unknown>;

        // Inject session gameId if tool is get_game_analysis and no gameId provided
        if (name === 'get_game_analysis' && !args.gameId && gameId) {
          args.gameId = gameId;
        }

        toolCalls.push({ name, args });
        const result = await executeToolCall(userId, name, args);
        responseParts.push({
          functionResponse: { name, response: result as Record<string, unknown> }
        });
      }

      contents.push({ role: 'user', parts: responseParts });
      continue;
    }

    // No function calls — return text response
    const text = response.text ?? 'I wasn\'t able to generate a response. Please try again.';
    return { text, toolCalls };
  }

  // Safety limit reached
  return {
    text: 'I gathered a lot of data but hit my analysis limit. Here\'s what I can tell you based on what I found — please ask a follow-up for more details.',
    toolCalls
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
        'Generate a short title (max 6 words) for a chess coaching conversation that starts with this message. Return ONLY the title, no quotes, no punctuation at the end.',
      maxOutputTokens: 30
    }
  });
  return response.text?.trim() || 'New conversation';
}
