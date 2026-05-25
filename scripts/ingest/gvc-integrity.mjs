/**
 * F025 §5.4 — GVC 스키마 정합성 검증.
 * 1. orphan_check: gvc_metrics/gvc_network gvc_code → gvc_products 위반 0
 * 2. dangling_check: gvc_network gvc_from/gvc_to → gvc_products 위반 0
 * 3. provenance_check: real/est/virt 외 값 위반 0
 * 4. domain_balance: mach/semi 각 products >= 2, metrics >= 4
 * 사용: node scripts/ingest/gvc-integrity.mjs [--local]
 */
import { query } from './lib/d1.mjs';

let passed = 0;
let failed = 0;
const issues = [];

function check(name, rows, expectZero, onFail) {
  if (expectZero) {
    if (rows.length > 0) {
      failed++;
      issues.push(`✖ ${name}: ${rows.length}건 위반`);
      if (onFail) onFail(rows);
    } else {
      passed++;
      console.log(`  ✓ ${name}: 0건 위반`);
    }
  }
}

function checkMin(name, value, min) {
  if (value < min) {
    failed++;
    issues.push(`✖ ${name}: ${value} < 최소 ${min}`);
  } else {
    passed++;
    console.log(`  ✓ ${name}: ${value} >= ${min}`);
  }
}

console.log('▶ GVC 정합성 검증 (F025 §5.4)');

// 1. orphan_check — gvc_metrics.gvc_code → gvc_products
const orphanMetrics = query(`
  SELECT DISTINCT m.gvc_code
  FROM gvc_metrics m
  LEFT JOIN gvc_products p ON p.gvc_code = m.gvc_code
  WHERE p.gvc_code IS NULL
`);
check('orphan_metrics', orphanMetrics, true);

// 2. orphan_check — gvc_network gvc_from/gvc_to → gvc_products
const dangling = query(`
  SELECT n.gvc_from, n.gvc_to
  FROM gvc_network n
  LEFT JOIN gvc_products pf ON pf.gvc_code = n.gvc_from
  LEFT JOIN gvc_products pt ON pt.gvc_code = n.gvc_to
  WHERE pf.gvc_code IS NULL OR pt.gvc_code IS NULL
`);
check('dangling_edges', dangling, true);

// 3. provenance_check — real/est/virt 외
const badProv = query(`
  SELECT provenance, COUNT(*) n FROM (
    SELECT provenance FROM gvc_products
    UNION ALL SELECT provenance FROM gvc_network
    UNION ALL SELECT provenance FROM gvc_metrics
  ) WHERE provenance NOT IN ('real','est','virt')
  GROUP BY provenance
`);
check('provenance_invalid', badProv, true);

// 4. domain_balance
const domainStats = query(`
  SELECT domain, COUNT(*) n FROM gvc_products GROUP BY domain
`);
const machProducts = domainStats.find(r => r.domain === 'mach')?.n ?? 0;
const semiProducts = domainStats.find(r => r.domain === 'semi')?.n ?? 0;
checkMin('domain_mach_products', machProducts, 2);
checkMin('domain_semi_products', semiProducts, 2);

const metricStats = query(`
  SELECT p.domain, COUNT(*) n
  FROM gvc_metrics m JOIN gvc_products p ON p.gvc_code = m.gvc_code
  GROUP BY p.domain
`);
const machMetrics = metricStats.find(r => r.domain === 'mach')?.n ?? 0;
const semiMetrics = metricStats.find(r => r.domain === 'semi')?.n ?? 0;
checkMin('domain_mach_metrics', machMetrics, 4);
checkMin('domain_semi_metrics', semiMetrics, 4);

// 전체 통계 출력
const totals = query(`
  SELECT 'gvc_products' tbl, COUNT(*) n FROM gvc_products
  UNION ALL SELECT 'gvc_network', COUNT(*) FROM gvc_network
  UNION ALL SELECT 'gvc_metrics', COUNT(*) FROM gvc_metrics
`);
console.log('\n통계:');
totals.forEach(r => console.log(`  ${r.tbl}: ${r.n}건`));

// 판정
console.log(`\n결과: ${passed}/${passed + failed} PASS`);
if (failed > 0) {
  issues.forEach(i => console.error(i));
  console.error('\n✖ 정합성 검증 FAIL');
  process.exit(1);
} else {
  console.log('✓ 정합성 검증 PASS (orphan=0, dangling=0, provenance 무결성)');
}
