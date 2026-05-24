// ============================================================
// F009 — What-If 실 LLM Worker (Hono)
// 같은 Worker에 /api/chat(CF Workers AI) + 정적 자산(ASSETS fallthrough) 공존.
// ============================================================
import { Hono } from 'hono';
import { createRateLimitMiddleware } from '@ktds-axbd/harness-kit';
import { WHATIF_MODEL, WHATIF_MAX_TOKENS, WHATIF_SYSTEM_PROMPT } from '../../config/whatif';

interface Env {
  AI: Ai;
  ASSETS: Fetcher;
}

const app = new Hono<{ Bindings: Env }>();

// /api/* 만 rate-limit — 세션당 3회 (X-Session-Id 헤더 기준). KV 없으면 in-memory fallback.
app.use(
  '/api/*',
  createRateLimitMiddleware({
    limit: 3,
    windowSec: 3600,
    keyFn: (c) => c.req.header('X-Session-Id') ?? 'anon',
  }),
);

// What-If 실 LLM
app.post('/api/chat', async (c) => {
  let query: string | undefined;
  try {
    ({ query } = await c.req.json<{ query?: string }>());
  } catch {
    return c.json({ error: 'invalid json' }, 400);
  }
  if (!query?.trim()) return c.json({ error: 'empty query' }, 400);

  const result = (await c.env.AI.run(WHATIF_MODEL, {
    max_tokens: WHATIF_MAX_TOKENS,
    messages: [
      { role: 'system', content: WHATIF_SYSTEM_PROMPT },
      { role: 'user', content: query },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)) as { response?: string };

  return c.json({ answer: result.response ?? '' });
});

// 그 외 전부 정적 자산 (SPA — hash routing이라 fallback도 index.html)
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
