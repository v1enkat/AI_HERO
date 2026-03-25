import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, '.env.local') });

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const clientOrigin =
  process.env.CLIENT_ORIGIN ||
  process.env.VITE_DEV_ORIGIN ||
  'http://localhost:5173';

app.use(
  cors({
    origin: [clientOrigin, 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '512kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'ai-heros-api' });
});

/**
 * OpenAI-compatible chat completions proxy — keeps GROQ_API_KEY on the server.
 * Client may send Authorization: Bearer <user-key> to override (Settings UI).
 */
app.post('/api/v1/chat/completions', async (req, res) => {
  const headerKey = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7).trim()
    : '';
  const apiKey = headerKey || process.env.GROQ_API_KEY?.trim() || '';

  if (!apiKey) {
    res.status(401).json({
      error: {
        message:
          'No Groq API key. Set GROQ_API_KEY in the server .env or send Authorization: Bearer from the client.',
      },
    });
    return;
  }

  const body = req.body as Record<string, unknown>;
  if (!body || typeof body !== 'object' || !Array.isArray(body.messages)) {
    res.status(400).json({ error: { message: 'Invalid body: expected { messages: [...], model, ... }' } });
    return;
  }

  const payload = {
    model: typeof body.model === 'string' ? body.model : process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    messages: body.messages,
    max_tokens: typeof body.max_tokens === 'number' ? body.max_tokens : 1024,
    temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
  };

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await groqRes.text();
    res.status(groqRes.status).type('application/json').send(text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Upstream request failed';
    res.status(502).json({ error: { message: msg } });
  }
});

const clientDist = path.join(repoRoot, 'client', 'dist');
const spaIndex = path.join(clientDist, 'index.html');
const serveSpa = existsSync(spaIndex);

if (serveSpa) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(spaIndex);
  });
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: { message: 'Not found' } });
  });
}

app.listen(PORT, () => {
  console.log(
    `[server] http://127.0.0.1:${PORT}  (API${serveSpa ? ' + static client' : ' only — run Vite on 5173 in dev'})`
  );
});
