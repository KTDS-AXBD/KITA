/** F014 — DART 기업 적재: TARGETS → company(개황) + 매출 → companies 테이블
 *  provenance=real(개황·매출 DART). share·core_type·role은 △est(큐레이션/매출proxy) — 화면 DataMark로 표기. */
import { upsert, validate, esc } from './lib/d1.mjs';
import { TARGETS, company, salesAmount, fmtKRW } from './lib/dart.mjs';

const KEY = process.env.OPENDART_KEY;
const YEAR = process.env.DART_YEAR ?? '2024';

export async function ingestCompanies() {
  if (!KEY) throw new Error('OPENDART_KEY 미설정 (.dev.vars)');
  const rows = [];
  for (const t of TARGETS) {
    const c = await company(KEY, t.corp_code);
    const salesWon = await salesAmount(KEY, t.corp_code, YEAR);
    rows.push({
      id: t.corp_code, corp_code: t.corp_code,
      name: c?.corp_name ?? t.name, biz: t.role, salesWon,
      core_type: t.core_type, role: t.role,
    });
  }
  const tot = rows.reduce((s, r) => s + (r.salesWon || 0), 0) || 1; // share proxy 분모
  validate(rows, ['id', 'name'], 'companies');
  upsert('companies', ['id', 'corp_code', 'name', 'biz', 'sales', 'share', 'core_type', 'role', 'provenance'],
    rows.map((r) => `(`
      + `'${esc(r.id)}','${esc(r.corp_code)}','${esc(r.name)}',`
      + `${r.biz ? `'${esc(r.biz)}'` : 'NULL'},`
      + `${r.salesWon ? `'${esc(fmtKRW(r.salesWon))}'` : 'NULL'},`
      + `${r.salesWon ? `'${(r.salesWon / tot * 100).toFixed(0)}%'` : 'NULL'},`
      + `${r.core_type},'${esc(r.role)}','real')`));

  return { companies: rows.length, withSales: rows.filter((r) => r.salesWon).length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestCompanies().then((r) => console.log('✓ 기업 적재:', JSON.stringify(r)))
    .catch((e) => { console.error('✖ 기업 적재 실패:', e.message); process.exit(1); });
}
