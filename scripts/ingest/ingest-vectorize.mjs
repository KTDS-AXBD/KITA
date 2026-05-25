/** F014 — Vectorize 코퍼스 적재: D1 엔티티(기업·국가·제품) → bge-m3 임베딩 → upsert(mutation 폴링) */
import { query } from './lib/d1.mjs';

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const INDEX = process.env.VECTORIZE_INDEX ?? 'kita-givc-poc';
const MODEL = '@cf/baai/bge-m3';
const BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}`;
const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function embed(texts) {
  const r = await fetch(`${BASE}/ai/run/${MODEL}`, { method: 'POST', headers: H, body: JSON.stringify({ text: texts }) });
  const j = await r.json();
  if (!j.success) throw new Error('embed 실패: ' + JSON.stringify(j.errors));
  return j.result.data;
}
async function upsertVectors(vectors) {
  const r = await fetch(`${BASE}/vectorize/v2/indexes/${INDEX}/upsert`, {
    method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/x-ndjson' },
    body: vectors.map((v) => JSON.stringify(v)).join('\n'),
  });
  const j = await r.json();
  if (!j.success) throw new Error('upsert 실패: ' + JSON.stringify(j.errors));
  return j.result.mutationId;
}
async function waitMutation(id, timeoutMs = 90000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const j = await (await fetch(`${BASE}/vectorize/v2/indexes/${INDEX}/info`, { headers: H })).json();
    if (j.result?.processedUpToMutation === id) return j.result;
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error('mutation 반영 타임아웃');
}

function buildCorpus() {
  const nodes = query('SELECT id,type,label,meta FROM graph_nodes;');
  const comps = query('SELECT id,name,sales,role FROM companies;');
  const salesById = Object.fromEntries(comps.map((c) => [c.id, c]));
  return nodes.map((n) => {
    let text = n.label;
    if (n.type === 'company') { const c = salesById[n.id]; text = `${n.label} — ${c?.role ?? '석유화학'} 기업, 매출 ${c?.sales ?? 'N/A'}. 톨루엔 밸류체인.`; }
    else if (n.type === 'country') { const m = n.meta ? JSON.parse(n.meta) : {}; text = `${n.label} — 톨루엔(HS290230) 교역 상대국, 수입 비중 ${m['비중'] ?? ''}.`; }
    else if (n.id === 'TOL') text = '톨루엔(Toluene) 방향족 탄화수소 용제. HS 290230, CAS 108-88-3. 도료·잉크·합성원료.';
    else if (n.type === 'hscode') text = 'HS코드 290230 — 톨루엔 품목 국제 통일 상품분류, 무역통계 집계 단위.';
    return { id: n.id, values: null, text };
  });
}

export async function ingestVectorize() {
  if (!ACCOUNT || !TOKEN) throw new Error('CLOUDFLARE_ACCOUNT_ID/API_TOKEN 미설정');
  const corpus = buildCorpus();
  const vecs = await embed(corpus.map((d) => d.text));
  const id = await upsertVectors(corpus.map((d, i) => ({ id: d.id, values: vecs[i] })));
  const info = await waitMutation(id);
  return { docs: corpus.length, vectorCount: info.vectorCount };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestVectorize().then((r) => console.log('✓ Vectorize 적재:', JSON.stringify(r)))
    .catch((e) => { console.error('✖ Vectorize 적재 실패:', e.message); process.exit(1); });
}
