/** F014/F016/F023 — D1 → 정적 스냅샷 (옵션A, 동기 인터페이스). graph·tradeSeries·companies·KPI shape.
 *  F016: 그래프는 공용 재귀 CTE(graphReachSql)로 정식화. F023: tierTrade·byCountry 구조화(KPI 산출용, 문자열 파싱 회피).
 *  SnapshotS6Repository가 이 JSON을 동기 import. → src/data/snapshot */
import { query } from './lib/d1.mjs';
import {
  graphReachSql,
  nodesByIdsSql,
  edgesWithinSql,
  tradeSeriesSql,
  tradeByCountrySql,
  companiesSql,
} from '../../src/shared/givc-queries.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HS = '845710'; // F023: 머시닝센터(공작기계) 앵커 — 시계열 차트
const __dir = dirname(fileURLToPath(import.meta.url));

// 그래프: MC(머시닝센터 anchor)에서 재귀 CTE 도달 노드 → 노드 상세 + 부분 엣지(src<dst dedup)
const reachIds = query(graphReachSql('MC', 4)).map((r) => r.id);
const nodes = query(nodesByIdsSql(reachIds))
  .map((n) => ({ ...n, meta: n.meta ? JSON.parse(n.meta) : undefined }));
const edges = query(edgesWithinSql(reachIds)).map((e) => [e.src, e.dst]);
const trade = query(tradeSeriesSql(HS));
const companies = query(companiesSql());
const byCountry = query(tradeByCountrySql(HS)); // 앵커 수입국 (KPI '주요 수입국')

// tier 무역수지(기간 합계) — KPI '핵심부품 수입' + 메타. 핵심부품/소재 HS.
const TIER_HS = { bearing: '848210', reducer: '848340', steel: '722840' };
const tierTrade = {};
for (const [k, hs] of Object.entries(TIER_HS)) {
  const r = query(`SELECT SUM(exports) e, SUM(imports) i FROM trade_stats WHERE hs_code='${hs}';`)[0] ?? {};
  tierTrade[k] = { hs, exports: Number(r.e || 0), imports: Number(r.i || 0) };
}

const snapshot = {
  _generated: new Date().toISOString(),
  _note: 'F023 실데이터 스냅샷 (옵션A). 관세청 기계 무역(머시닝센터 845710 + 베어링/감속기/특수강 tier) + DART 상장 기계사. 다단계 가치사슬 그래프.',
  graph: { nodes, edges, viewBox: '0 0 800 500' },
  tradeSeries: {
    quarters: trade.map((t) => t.period),
    exports: trade.map((t) => t.exports),
    imports: trade.map((t) => t.imports),
    anomalies: [],
    source: 'real',
  },
  tierTrade,
  byCountry: byCountry.map((c) => ({ cnty_nm: c.cnty_nm, share: c.share, imports: c.imports })),
  companies,
};

// committed 위치(SPA import 가능) — F015/F023 SnapshotS6Repository가 소비
const outDir = join(__dir, '..', '..', 'src', 'data', 'snapshot');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 's6.real.snapshot.json');
writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
console.log(`✓ 스냅샷: ${outPath}`);
console.log(`  노드 ${nodes.length} · 엣지 ${edges.length} · 분기 ${trade.length} · 기업 ${companies.length}`);
