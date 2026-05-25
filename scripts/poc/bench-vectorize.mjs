#!/usr/bin/env node
/**
 * F013 0c — Vectorize 의미검색 PoC (Design §4)
 * 통과 = top-k 정확도 ≥ 0.80. + 월 비용 추산.
 *
 * 임베딩: CF Workers AI @cf/baai/bge-m3 (다국어/한국어, 1024차원) — REST run.
 * 인덱스: Vectorize v2 (cosine). corpus upsert → query top-k.
 *
 * 사전(👤 Master):
 *   - wrangler vectorize create koami-givc-poc --dimensions=1024 --metric=cosine
 *   - env: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN (AI Run + Vectorize Edit 권한)
 * 실행: node scripts/poc/bench-vectorize.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const INDEX = process.env.VECTORIZE_INDEX ?? 'koami-givc-poc';
const MODEL = '@cf/baai/bge-m3';
const DIM = 1024;
const K = 3;
const THRESHOLD = 0.8;
const BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}`;

if (!ACCOUNT || !TOKEN) {
  console.error('✖ env 누락: CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN');
  process.exit(2);
}

const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function embed(texts) {
  const res = await fetch(`${BASE}/ai/run/${MODEL}`, {
    method: 'POST', headers: H, body: JSON.stringify({ text: texts }),
  });
  const j = await res.json();
  if (!j.success) throw new Error('embed 실패: ' + JSON.stringify(j.errors));
  return j.result.data; // number[][]
}

async function upsert(vectors) {
  // Vectorize v2 upsert: NDJSON {id, values, metadata}. mutation은 비동기 처리.
  const ndjson = vectors.map((v) => JSON.stringify(v)).join('\n');
  const res = await fetch(`${BASE}/vectorize/v2/indexes/${INDEX}/upsert`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/x-ndjson' },
    body: ndjson,
  });
  const j = await res.json();
  if (!j.success) throw new Error('upsert 실패: ' + JSON.stringify(j.errors));
  return j.result; // { mutationId }
}

async function info() {
  const res = await fetch(`${BASE}/vectorize/v2/indexes/${INDEX}/info`, { headers: H });
  const j = await res.json();
  if (!j.success) throw new Error('info 실패: ' + JSON.stringify(j.errors));
  return j.result; // { vectorCount, dimensions, processedUpToMutation }
}

/** upsert mutation이 인덱스에 반영(processedUpToMutation 도달)될 때까지 폴링 */
async function waitForMutation(mutationId, { timeoutMs = 90000, intervalMs = 3000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const i = await info();
    if (i.processedUpToMutation === mutationId) return i;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`mutation ${mutationId} 반영 타임아웃 (${timeoutMs}ms)`);
}

async function query(vector) {
  const res = await fetch(`${BASE}/vectorize/v2/indexes/${INDEX}/query`, {
    method: 'POST', headers: H, body: JSON.stringify({ vector, topK: K, returnMetadata: 'none' }),
  });
  const j = await res.json();
  if (!j.success) throw new Error('query 실패: ' + JSON.stringify(j.errors));
  return j.result.matches.map((m) => m.id);
}

function estimateCost(nDocs, queriesPerMonth) {
  // TODO(0c): CF 공식 단가표 기입 후 확정. 아래는 산식 골격.
  const PRICE = {
    embed_per_1k_tokens: 0,   // Workers AI 임베딩 단가
    store_per_100m_dim: 0,    // Vectorize stored dimensions
    query_per_1m_dim: 0,      // Vectorize queried dimensions
  };
  const storedDim = nDocs * DIM;
  const queriedDim = queriesPerMonth * DIM;
  return { storedDim, queriedDim, note: 'PRICE 상수에 CF 단가 기입 → 월 비용 산출', PRICE };
}

(async () => {
  console.log(`▶ 0c Vectorize 벤치 — index=${INDEX} model=${MODEL} k=${K}`);
  const fx = JSON.parse(readFileSync(join(__dir, 'fixtures', 'semantic-eval.json'), 'utf8'));
  const { corpus, queries } = fx;

  console.log(`  · corpus ${corpus.length}건 임베딩…`);
  const cVecs = await embed(corpus.map((d) => d.text));
  const { mutationId } = await upsert(corpus.map((d, i) => ({ id: d.doc_id, values: cVecs[i] })));
  console.log(`  · upsert 완료 (mutation ${mutationId}). 인덱스 반영 폴링…`);
  const idx = await waitForMutation(mutationId);
  console.log(`  · 반영 완료 (vectorCount=${idx.vectorCount})`);

  let hit = 0;
  for (const { q, expected } of queries) {
    const [qv] = await embed([q]);
    const top = await query(qv);
    const ok = expected.some((e) => top.includes(e));
    if (ok) hit++;
    console.log(`    ${ok ? '✓' : '✗'} "${q}" → [${top.join(', ')}]  (정답 ${expected.join('/')})`);
  }

  const acc = hit / queries.length;
  const pass = acc >= THRESHOLD;
  console.log(`\n  정확도 ${(acc * 100).toFixed(1)}% (${hit}/${queries.length}) · 판정 ${pass ? '✅ PASS' : '❌ FAIL'} (기준 ≥${THRESHOLD * 100}%)`);
  console.log('  비용 추산:', JSON.stringify(estimateCost(corpus.length, 1000)));
  if (!pass) {
    console.log('  → 대안(Design §4.2): k/전처리/청킹 튜닝 · 모델 교체 · RAG P1 후순위');
    process.exit(1);
  }
})().catch((e) => {
  console.error('✖ 0c 실패:', e.message);
  process.exit(2);
});
