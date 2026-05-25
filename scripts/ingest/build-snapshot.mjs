/** F014/F016 — D1 → 정적 스냅샷 (옵션A, 동기 인터페이스). graph·tradeSeries·companies shape.
 *  F016: 그래프는 공용 재귀 CTE(graphReachSql)로 정식화 — 11노드 소규모라 산출 동일, 경로만 정식.
 *  F015 SnapshotTolueneRepository가 이 JSON을 동기 import. → scripts/ingest/out → src/data/snapshot */
import { query } from './lib/d1.mjs';
import {
  graphReachSql,
  nodesByIdsSql,
  edgesWithinSql,
  tradeSeriesSql,
  companiesSql,
} from '../../src/shared/givc-queries.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HS = '290230';
const __dir = dirname(fileURLToPath(import.meta.url));

// 그래프: TOL에서 재귀 CTE 도달 노드 → 노드 상세 + 부분 엣지(src<dst dedup)
const reachIds = query(graphReachSql('TOL', 4)).map((r) => r.id);
const nodes = query(nodesByIdsSql(reachIds))
  .map((n) => ({ ...n, meta: n.meta ? JSON.parse(n.meta) : undefined }));
const edges = query(edgesWithinSql(reachIds)).map((e) => [e.src, e.dst]);
const trade = query(tradeSeriesSql(HS));
const companies = query(companiesSql());

const snapshot = {
  _generated: new Date().toISOString(),
  _note: 'F014 실데이터 스냅샷 (옵션A). 관세청 무역 + DART 기업. F016 재귀CTE 정식화.',
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

// committed 위치(SPA import 가능) — F015 SnapshotTolueneRepository가 소비
const outDir = join(__dir, '..', '..', 'src', 'data', 'snapshot');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 's6.real.snapshot.json');
writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
console.log(`✓ 스냅샷: ${outPath}`);
console.log(`  노드 ${nodes.length} · 엣지 ${edges.length} · 분기 ${trade.length} · 기업 ${companies.length}`);
