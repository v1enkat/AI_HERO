/**
 * Groq chat completions.
 * - Default: same-origin `/api/v1/chat/completions` (Vite proxies to the Node server in dev; Express serves API + SPA in prod).
 * - Optional `VITE_API_URL`: absolute API base for split deployments.
 * - Optional `VITE_GROQ_DIRECT=1`: call Groq from the browser (needs client key + CORS); static-only hosting.
 */
import type { ChatTurn } from '../types/herai';

const GROQ_PUBLIC = 'https://api.groq.com/openai/v1/chat/completions';
const API_PATH = '/api/v1/chat/completions';

export function groqChatUrl(): string {
  if (import.meta.env.VITE_GROQ_DIRECT === 'true' || import.meta.env.VITE_GROQ_DIRECT === '1') {
    return GROQ_PUBLIC;
  }
  const base = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (base) return `${base}${API_PATH}`;
  return API_PATH;
}

/** True when the browser talks to Groq directly (must send a client API key). */
export function isDirectGroqPublicEndpoint(): boolean {
  return groqChatUrl().startsWith('https://api.groq.com');
}

export type GroqChatResult =
  | { ok: true; content: string }
  | { ok: false; status: number; message: string };

type GroqErrorBody = {
  error?: { message?: string; code?: string };
};

export async function groqChatCompletion(params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  messages: ChatTurn[];
  maxTokens?: number;
  temperature?: number;
}): Promise<GroqChatResult> {
  const { apiKey, model, systemPrompt, messages, maxTokens = 700, temperature = 0.7 } = params;

  const body = JSON.stringify({
    model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: maxTokens,
    temperature,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  let res: Response;
  try {
    res = await fetch(groqChatUrl(), {
      method: 'POST',
      headers,
      body,
    });
  } catch (e) {
    const hint =
      import.meta.env.DEV
        ? ' Network error — is the API server running on port 3001?'
        : ' Network error — check your connection or API URL.';
    return {
      ok: false,
      status: 0,
      message: e instanceof Error ? e.message + hint : 'Request failed.' + hint,
    };
  }

  const raw = await res.text();
  let data: { choices?: { message?: { content?: string | null } }[] } & GroqErrorBody = {};
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    const apiMsg = data.error?.message || raw.slice(0, 200) || res.statusText;
    return {
      ok: false,
      status: res.status,
      message: apiMsg ? `${apiMsg} (${res.status})` : `Groq request failed (${res.status})`,
    };
  }

  const content = data.choices?.[0]?.message?.content?.trim() ?? '';
  if (!content) {
    return { ok: false, status: res.status, message: 'Empty response from model.' };
  }

  return { ok: true, content };
}
