/** F014 — D1 → 정적 스냅샷 (옵션A, 동기 인터페이스). graph·tradeSeries·companies shape.
 *  F015 SnapshotTolueneRepository가 이 JSON을 동기 import. → scripts/ingest/out/s6.real.snapshot.json */
import { query } from './lib/d1.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HS = '290230';
const __dir = dirname(fileURLToPath(import.meta.url));

const nodes = query('SELECT id,type,label,r,meta,provenance AS source FROM graph_nodes;')
  .map((n) => ({ ...n, meta: n.meta ? JSON.parse(n.meta) : undefined }));
const edges = query('SELECT src,dst FROM graph_edges WHERE src < dst;').map((e) => [e.src, e.dst]);
const trade = query(`SELECT period,exports,imports FROM trade_stats WHERE hs_code='${HS}' ORDER BY period;`);
const companies = query('SELECT id,name,biz,sales,share,core_type AS coreType,role,provenance AS source FROM companies ORDER BY core_type, name;');

const snapshot = {
  _generated: new Date().toISOString(),
  _note: 'F014 실데이터 스냅샷 (옵션A). 관세청 무역 + DART 기업.',
  graph: { nodes, edges, viewBox: '0 0 800 500' },
  tradeSeries: {
    quarters: trade.map((t) => t.period),
    exports: trade.map((t) => t.exports),
    imports: trade.map((t) => t.imports),
    anomalies: [],
    source: 'real',
  },
  companies,
};

const outDir = join(__dir, 'out');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 's6.real.snapshot.json');
writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
console.log(`✓ 스냅샷: ${outPath}`);
console.log(`  노드 ${nodes.length} · 엣지 ${edges.length} · 분기 ${trade.length} · 기업 ${companies.length}`);
