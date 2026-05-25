#!/usr/bin/env node
/**
 * F013 0d — 적재 1라운드 PoC (Design §5)
 * 톨루엔(HS 290230): 추출(관세청) → 정규화 → 출처메타 → 검증/롤백 → D1 적재 → 조회.
 * + --graph-only: 0b 벤치용 톨루엔 그래프 시드만 적재.
 *
 * 사전(👤 Master):
 *   - wrangler d1 create kita-givc-poc + schema-poc.sql 적용
 *   - .dev.vars: DATA_GO_KR_KEY (관세청 OpenAPI serviceKey)
 * 실행:
 *   node scripts/ingest/poc-toluene.mjs --graph-only      # 0b 시드
 *   node scripts/ingest/poc-toluene.mjs                    # full 1라운드 (trade + graph)
 */
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const DB = 'kita-givc-poc';
const LOC = args.includes('--local') ? '--local' : '--remote';
const GRAPH_ONLY = args.includes('--graph-only');
const HS = '290230';

// ── 톨루엔 그래프 시드 (KnowledgeGraph subset, provenance=real) ─────────────
// 깊이2 탐색(0b) 검증용 최소 그래프. 본 적재는 F014에서 소스 파생.
const NODES = [
  ['TOL', 'rnd', '톨루엔', 'real'], ['HS290230', 'hscode', 'HS 290230', 'real'],
  ['JP', 'country', '일본', 'real'], ['CN', 'country', '중국', 'real'], ['US', 'country', '미국', 'real'],
  ['T001', 'company', '기업 A', 'real'], ['T002', 'company', '기업 B', 'real'], ['T003', 'company', '기업 C', 'real'],
  ['SOLVENT', 'metric', '용제 용도', 'est'], ['REGULATE', 'metric', '규제', 'est'],
];
const EDGES = [
  ['TOL', 'HS290230'], ['TOL', 'JP'], ['TOL', 'CN'], ['TOL', 'US'],
  ['TOL', 'T001'], ['TOL', 'T002'], ['TOL', 'T003'], ['TOL', 'SOLVENT'], ['TOL', 'REGULATE'],
  ['HS290230', 'JP'], ['HS290230', 'CN'], ['T001', 'SOLVENT'],
];

const esc = (s) => String(s).replace(/'/g, "''");

function d1(sql) {
  execFileSync('npx', ['wrangler', 'd1', 'execute', DB, LOC, '--command', sql],
    { stdio: ['ignore', 'inherit', 'inherit'] });
}

function seedGraph() {
  const nVals = NODES.map(([id, t, l, p]) => `('${esc(id)}','${t}','${esc(l)}',8,NULL,'${p}')`).join(',');
  d1(`INSERT OR REPLACE INTO graph_nodes(id,type,label,r,meta,provenance) VALUES ${nVals};`);
  // 무방향 → 양방향 2행
  const eVals = EDGES.flatMap(([a, b]) => [`('${a}','${b}')`, `('${b}','${a}')`]).join(',');
  d1(`INSERT OR REPLACE INTO graph_edges(src,dst) VALUES ${eVals};`);
  console.log(`  ✓ 그래프 시드: 노드 ${NODES.length} · 엣지 ${EDGES.length}(×2)`);
}

// ── 관세청 무역통계 추출 (0d full) ──────────────────────────────────────────
async function fetchTrade() {
  const KEY = process.env.DATA_GO_KR_KEY;
  if (!KEY) throw new Error('DATA_GO_KR_KEY 미설정 (.dev.vars) — 관세청 OpenAPI serviceKey 필요');
  // 관세청_품목별 국가별 수출입실적 (data ID 15100475)
  // endpoint: apis.data.go.kr/1220000/nitemtrade/getNitemtradeList
  const url = new URL('https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList');
  url.searchParams.set('serviceKey', KEY);
  url.searchParams.set('hsSgn', HS);
  url.searchParams.set('strtYymm', process.env.STRT_YYMM ?? '202301');
  url.searchParams.set('endYymm', process.env.END_YYMM ?? '202412');
  url.searchParams.set('type', 'json');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`관세청 API ${res.status}`);
  return res.json();
}

// TODO(0d): 실제 응답 필드 → TradeSeries 정규화. API 응답 shape 확인 후 매핑.
function normalizeTrade(raw) {
  const items = raw?.response?.body?.items?.item ?? [];
  const rows = items.map((it) => ({
    hs_code: HS,
    period: it.year ? `${it.year}Q?` : it.statKor ?? 'unknown', // TODO: 분기 매핑
    exports: Number(it.expDlr ?? 0),
    imports: Number(it.impDlr ?? 0),
    src_date: raw?.response?.header?.resultMsg ?? null,
    provenance: 'real',
  }));
  return rows;
}

function validateTrade(rows) {
  if (rows.length === 0) throw new Error('검증 실패: 0행 (적재 중단/롤백)');
  for (const r of rows) {
    if (!r.hs_code || !r.period || r.provenance == null) throw new Error('검증 실패: 필수컬럼 NULL');
    if (Number.isNaN(r.exports) || Number.isNaN(r.imports)) throw new Error('검증 실패: 수치 타입');
  }
  return true;
}

function upsertTrade(rows) {
  const vals = rows.map((r) =>
    `('${HS}','${esc(r.period)}',${r.exports},${r.imports},'USD',${r.src_date ? `'${esc(r.src_date)}'` : 'NULL'},'${r.provenance}')`
  ).join(',');
  d1(`INSERT OR REPLACE INTO trade_stats(hs_code,period,exports,imports,unit,src_date,provenance) VALUES ${vals};`);
}

(async () => {
  console.log(`▶ 0d 적재 — DB=${DB} ${LOC} ${GRAPH_ONLY ? '(graph-only)' : '(full)'}`);
  seedGraph();
  if (GRAPH_ONLY) { console.log('  ✓ graph-only 완료 (0b bench 준비)'); return; }

  const raw = await fetchTrade();
  const rows = normalizeTrade(raw);
  validateTrade(rows);
  upsertTrade(rows);
  console.log(`  ✓ trade_stats 적재 ${rows.length}행`);
  d1(`SELECT period, exports, imports FROM trade_stats WHERE hs_code='${HS}' ORDER BY period;`);
  console.log('  ✓ 0d 1라운드 재현 완료 (검증 PASS)');
})().catch((e) => {
  console.error('✖ 0d 실패(롤백):', e.message);
  process.exit(1);
});
