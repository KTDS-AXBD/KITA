// ============================================================
// F009 — What-If 실 LLM Worker (Hono)
// 같은 Worker에 /api/chat(CF Workers AI) + 정적 자산(ASSETS fallthrough) 공존.
// ============================================================
import { Hono } from 'hono';
import { createRateLimitMiddleware } from '@ktds-axbd/harness-kit';
import { WHATIF_MODEL, WHATIF_MAX_TOKENS, WHATIF_SYSTEM_PROMPT } from '../../config/whatif';
import {
  graphReachSql,
  nodesByIdsSql,
  edgesWithinSql,
  tradeSeriesSql,
  tradeByCountrySql,
  entitySearchSql,
} from '../shared/givc-queries.mjs';

interface Env {
  AI: Ai;
  ASSETS: Fetcher;
  RATE_LIMIT_KV: KVNamespace;
  DB: D1Database; // F016 — koami-givc 읽기전용 조회
}

const app = new Hono<{ Bindings: Env }>();

// /api/chat 만 rate-limit — 세션당 3회 (LLM 비용 제한). F016 읽기전용 조회(/api/givc/*)는 무제한.
// KV 바인딩 필수: 분산 Worker에서 in-memory 카운터는 인스턴스 간 공유 안 됨(429 미작동) → KV로 일관 카운트.
app.use(
  '/api/chat',
  createRateLimitMiddleware({
    limit: 3,
    windowSec: 3600,
    keyFn: (c) => c.req.header('X-Session-Id') ?? 'anon',
    kvBinding: 'RATE_LIMIT_KV',
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

// ── F016 koami-givc 읽기전용 조회 (하이브리드: 화면은 스냅샷, 본 엔드포인트는 라이브 조회 증거) ──
// SELECT-only(공용 SQL 빌더만 사용·입력 전량 sanitize). rate-limit 미적용.

// 그래프 재귀 CTE — 루트에서 깊이 N 도달 노드/엣지
app.get('/api/givc/graph', async (c) => {
  const root = c.req.query('root') ?? 'TOL';
  const depth = Number(c.req.query('depth') ?? 2);
  const reach = await c.env.DB.prepare(graphReachSql(root, depth)).all<{ id: string }>();
  const ids = reach.results.map((r) => r.id);
  if (!ids.length) return c.json({ nodes: [], edges: [] });
  const nodes = await c.env.DB.prepare(nodesByIdsSql(ids)).all();
  const edges = await c.env.DB.prepare(edgesWithinSql(ids)).all<{ src: string; dst: string }>();
  return c.json({ nodes: nodes.results, edges: edges.results.map((e) => [e.src, e.dst]) });
});

// 정형 SQL — 무역 시계열 + 국가별 비중
app.get('/api/givc/trade', async (c) => {
  const hs = c.req.query('hs') ?? '290230';
  const series = await c.env.DB.prepare(tradeSeriesSql(hs)).all();
  const byCountry = await c.env.DB.prepare(tradeByCountrySql(hs)).all();
  return c.json({ series: series.results, byCountry: byCountry.results });
});

// FTS5 전문검색 — 기업·그래프 코퍼스
app.get('/api/givc/search', async (c) => {
  const q = c.req.query('q') ?? '';
  if (!q.trim()) return c.json({ error: 'empty query' }, 400);
  const limit = Number(c.req.query('limit') ?? 20);
  const hits = await c.env.DB.prepare(entitySearchSql(q, limit)).all();
  return c.json({ hits: hits.results });
});

// 그 외 전부 정적 자산 (SPA — hash routing이라 fallback도 index.html)
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
