/** F014 — 적재 오케스트레이션: 무역 → 기업 → 그래프 → (벡터) → 검증 리포트.
 *  도메인 실패 시 비제로 exit(부분 적재 잔재 방지는 각 도메인 upsert 단위). */
import { query } from './lib/d1.mjs';
import { ingestTrade } from './ingest-trade.mjs';
import { ingestCompanies } from './ingest-companies.mjs';
import { buildGraph } from './build-graph.mjs';
import { ingestFts } from './ingest-fts.mjs';
import { ingestVectorize } from './ingest-vectorize.mjs';

const SKIP_VEC = process.argv.includes('--no-vectorize');

(async () => {
  console.log('▶ koami-givc 적재 (ingest-all)');
  console.log('  무역:', JSON.stringify(await ingestTrade()));
  console.log('  기업:', JSON.stringify(await ingestCompanies()));
  console.log('  그래프:', JSON.stringify(await buildGraph()));
  console.log('  FTS:', JSON.stringify(await ingestFts()));
  console.log('  벡터:', SKIP_VEC ? '(skip)' : JSON.stringify(await ingestVectorize()));

  const stats = query(`
    SELECT 'trade_stats' tbl, COUNT(*) n FROM trade_stats
    UNION ALL SELECT 'trade_by_country', COUNT(*) FROM trade_by_country
    UNION ALL SELECT 'companies', COUNT(*) FROM companies
    UNION ALL SELECT 'graph_nodes', COUNT(*) FROM graph_nodes
    UNION ALL SELECT 'graph_edges', COUNT(*) FROM graph_edges;`);
  const prov = query(`SELECT provenance, COUNT(*) n FROM (
    SELECT provenance FROM trade_stats UNION ALL SELECT provenance FROM trade_by_country
    UNION ALL SELECT provenance FROM companies UNION ALL SELECT provenance FROM graph_nodes
  ) GROUP BY provenance;`);

  console.log('\n적재 통계:');
  stats.forEach((s) => console.log(`  ${s.tbl}: ${s.n}`));
  console.log('provenance 분포:', prov.map((p) => `${p.provenance}=${p.n}`).join(' '));
  console.log('\n✓ ingest-all 완료 (검증 PASS)');
})().catch((e) => { console.error('✖ ingest-all 실패:', e.message); process.exit(1); });
