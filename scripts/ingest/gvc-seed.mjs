/**
 * F025 — GVC 멀티도메인 시드 적재 (기계 + 반도체).
 * gvc_products → gvc_network → gvc_metrics 순서로 적재 (FK 순서 준수).
 * ⚠️ virt GVC코드만 (GVC-MACH-xxx / GVC-SEMI-xxx) — 실 GVC코드 미포함 (Public 레포 제약).
 * ⚠️ 실 컬럼코드 미포함 — 의미명 metric_key만 사용.
 * 사용: node scripts/ingest/gvc-seed.mjs [--local]
 */
import { run, query, validate, esc } from './lib/d1.mjs';

// 기계 도메인 (GVC-MACH-*, provenance=virt)
const MACH_PRODUCTS = [
  { gvc_code: 'GVC-MACH-MC001', domain: 'mach', label: '머시닝센터', hs_codes: '["845710"]', tier: '장비', sort: 3 },
  { gvc_code: 'GVC-MACH-GB001', domain: 'mach', label: '볼베어링', hs_codes: '["848210"]', tier: '부품', sort: 2 },
  { gvc_code: 'GVC-MACH-GR001', domain: 'mach', label: '기어감속기', hs_codes: '["848340"]', tier: '부품', sort: 2 },
  { gvc_code: 'GVC-MACH-SS001', domain: 'mach', label: '특수강', hs_codes: '["722840"]', tier: '소재', sort: 1 },
];

// 반도체 도메인 (GVC-SEMI-*, provenance=virt)
const SEMI_PRODUCTS = [
  { gvc_code: 'GVC-SEMI-WF001', domain: 'semi', label: '실리콘웨이퍼', hs_codes: '["381800"]', tier: '소재', sort: 1 },
  { gvc_code: 'GVC-SEMI-SL001', domain: 'semi', label: 'CMP슬러리', hs_codes: '["382490"]', tier: '소재', sort: 1 },
  { gvc_code: 'GVC-SEMI-PG001', domain: 'semi', label: '포토마스크', hs_codes: '["903190"]', tier: '부품', sort: 2 },
  { gvc_code: 'GVC-SEMI-RI001', domain: 'semi', label: '포토레지스트', hs_codes: '["370130"]', tier: '소재', sort: 1 },
];

// product_network 엣지 — 기계 (소재→부품→장비)
const MACH_EDGES = [
  { gvc_from: 'GVC-MACH-SS001', gvc_to: 'GVC-MACH-GB001', tier_label: '소재→부품', sort: 1 },
  { gvc_from: 'GVC-MACH-SS001', gvc_to: 'GVC-MACH-GR001', tier_label: '소재→부품', sort: 2 },
  { gvc_from: 'GVC-MACH-GB001', gvc_to: 'GVC-MACH-MC001', tier_label: '부품→장비', sort: 3 },
  { gvc_from: 'GVC-MACH-GR001', gvc_to: 'GVC-MACH-MC001', tier_label: '부품→장비', sort: 4 },
];

// product_network 엣지 — 반도체
const SEMI_EDGES = [
  { gvc_from: 'GVC-SEMI-SL001', gvc_to: 'GVC-SEMI-WF001', tier_label: '소재→소재(폴리싱)', sort: 1 },
  { gvc_from: 'GVC-SEMI-WF001', gvc_to: 'GVC-SEMI-PG001', tier_label: '소재→부품', sort: 2 },
  { gvc_from: 'GVC-SEMI-RI001', gvc_to: 'GVC-SEMI-PG001', tier_label: '소재→부품', sort: 3 },
];

// scmm 계열 지표 6종 (의미명, provenance=est — 공개 산업보고서 기반 추정)
const METRIC_TEMPLATES = [
  { metric_key: 'metric_sales_growth',         value: 4.2,   unit: '%' },
  { metric_key: 'metric_capital_efficiency',    value: 112.5, unit: '%' },
  { metric_key: 'metric_financial_cost_ratio',  value: 2.1,   unit: '%' },
  { metric_key: 'metric_inventory_turnover',    value: 5.8,   unit: '회' },
  { metric_key: 'metric_employment_change',     value: 1.3,   unit: '%' },
  { metric_key: 'metric_rnd_growth',            value: 6.7,   unit: '%' },
];

function insertProducts(products) {
  run('DELETE FROM gvc_products WHERE domain = \'' + products[0].domain + '\'');
  for (const p of products) {
    run(`INSERT INTO gvc_products (gvc_code, domain, label, hs_codes, tier, sort, provenance)
         VALUES ('${esc(p.gvc_code)}','${p.domain}','${esc(p.label)}','${p.hs_codes}','${p.tier}',${p.sort},'virt')`);
  }
}

function insertEdges(edges) {
  // 도메인 전체 삭제 후 재삽입 (FK orphan 방지)
  const codes = [...new Set([...edges.map(e => e.gvc_from), ...edges.map(e => e.gvc_to)])];
  const inClause = codes.map(c => `'${esc(c)}'`).join(',');
  run(`DELETE FROM gvc_network WHERE gvc_from IN (${inClause}) OR gvc_to IN (${inClause})`);
  for (const e of edges) {
    run(`INSERT INTO gvc_network (gvc_from, gvc_to, tier_label, sort, provenance)
         VALUES ('${esc(e.gvc_from)}','${esc(e.gvc_to)}','${esc(e.tier_label)}',${e.sort},'virt')`);
  }
}

function insertMetrics(products) {
  const codes = products.map(p => `'${esc(p.gvc_code)}'`).join(',');
  run(`DELETE FROM gvc_metrics WHERE gvc_code IN (${codes})`);
  for (const p of products) {
    for (const m of METRIC_TEMPLATES) {
      run(`INSERT INTO gvc_metrics (gvc_code, metric_key, value, unit, period, provenance)
           VALUES ('${esc(p.gvc_code)}','${m.metric_key}',${m.value},'${esc(m.unit)}','2023','est')`);
    }
  }
}

(async () => {
  console.log('▶ GVC 멀티도메인 시드 적재 (F025)');

  // 기계
  insertProducts(MACH_PRODUCTS);
  insertEdges(MACH_EDGES);
  insertMetrics(MACH_PRODUCTS);
  console.log('  기계(mach): products', MACH_PRODUCTS.length, '/ edges', MACH_EDGES.length, '/ metrics', MACH_PRODUCTS.length * METRIC_TEMPLATES.length);

  // 반도체
  insertProducts(SEMI_PRODUCTS);
  insertEdges(SEMI_EDGES);
  insertMetrics(SEMI_PRODUCTS);
  console.log('  반도체(semi): products', SEMI_PRODUCTS.length, '/ edges', SEMI_EDGES.length, '/ metrics', SEMI_PRODUCTS.length * METRIC_TEMPLATES.length);

  // 검증
  const stats = query(`
    SELECT 'gvc_products' tbl, COUNT(*) n FROM gvc_products
    UNION ALL SELECT 'gvc_network', COUNT(*) FROM gvc_network
    UNION ALL SELECT 'gvc_metrics', COUNT(*) FROM gvc_metrics
  `);
  console.log('\n적재 통계:');
  stats.forEach(s => console.log(`  ${s.tbl}: ${s.n}`));

  const prov = query(`
    SELECT provenance, COUNT(*) n FROM (
      SELECT provenance FROM gvc_products
      UNION ALL SELECT provenance FROM gvc_network
      UNION ALL SELECT provenance FROM gvc_metrics
    ) GROUP BY provenance
  `);
  console.log('provenance 분포:', prov.map(p => `${p.provenance}=${p.n}`).join(' '));

  validate(stats.filter(s => s.tbl === 'gvc_products'), ['n'], 'gvc_products');
  validate(stats.filter(s => s.tbl === 'gvc_network'), ['n'], 'gvc_network');
  validate(stats.filter(s => s.tbl === 'gvc_metrics'), ['n'], 'gvc_metrics');

  console.log('\n✓ gvc-seed 완료');
})().catch(e => { console.error('✖ gvc-seed 실패:', e.message); process.exit(1); });
