#!/usr/bin/env node
/**
 * F013 옵션A 검증 (Design §2.2) — D1 → 정적 스냅샷 JSON.
 * 동기 인터페이스 보존: 실데이터를 D1에 적재하되, SPA 화면은 이 스냅샷을 동기 import.
 * 산출 shape = KnowledgeGraph / TradeSeries (src/types) → F015 SnapshotTolueneRepository가 소비.
 *
 * 실행: node scripts/poc/build-snapshot.mjs  → scripts/poc/out/s6.real.snapshot.json
 * 검증: tsc로 shape 일치 확인(Design §7) — F015에서 타입 import.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const DB = 'koami-givc-poc';
const LOC = process.argv.includes('--local') ? '--local' : '--remote';

function q(sql) {
  const out = execFileSync('npx', ['wrangler', 'd1', 'execute', DB, LOC, '--json', '--command', sql],
    { encoding: 'utf8' });
  const parsed = JSON.parse(out);
  return (Array.isArray(parsed) ? parsed[0] : parsed)?.results ?? [];
}

console.log(`▶ 스냅샷 생성 — DB=${DB} ${LOC}`);

const nodes = q('SELECT id,type,label,r,meta,provenance AS source FROM graph_nodes;')
  .map((n) => ({ ...n, meta: n.meta ? JSON.parse(n.meta) : undefined }));
const edges = q('SELECT src,dst FROM graph_edges WHERE src < dst;') // 무방향 dedup
  .map((e) => [e.src, e.dst]);
const trade = q("SELECT period,exports,imports FROM trade_stats WHERE hs_code='290230' ORDER BY period;");

// KnowledgeGraph shape (viewBox는 빌드타임 layout과 머지 — PoC는 placeholder)
const graph = { nodes, edges, viewBox: '0 0 800 500' };
// TradeSeries shape
const tradeSeries = {
  quarters: trade.map((t) => t.period),
  exports: trade.map((t) => t.exports),
  imports: trade.map((t) => t.imports),
  anomalies: [],
  source: 'real',
};

const snapshot = {
  _generated: new Date().toISOString(),
  _note: 'F013 PoC 스냅샷 (옵션A). 본 생성은 F014/F015에서 정식화.',
  graph,
  tradeSeries,
};

const outDir = join(__dir, 'out');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 's6.real.snapshot.json');
writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
console.log(`  ✓ ${outPath}  (노드 ${nodes.length} · 엣지 ${edges.length} · 분기 ${trade.length})`);
