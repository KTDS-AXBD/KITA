/** F014 — 관세청 무역 적재: 15101609 총량→trade_stats(분기) + 15100475 국가별→trade_by_country */
import { upsert, validate, esc } from './lib/d1.mjs';
import { fetchItemTrade, fetchNitemTrade, toQuarter } from './lib/datagokr.mjs';

const KEY = process.env.DATA_GO_KR_KEY;
const HS = '290230';
const STRT = process.env.STRT_YYMM ?? '202401';
const END = process.env.END_YYMM ?? '202412';
const COUNTRIES = (process.env.CNTY_CDS ?? 'JP,CN,US').split(',');

export async function ingestTrade() {
  if (!KEY) throw new Error('DATA_GO_KR_KEY 미설정 (.dev.vars)');

  // 1) 총량 → trade_stats (월 → 분기 집계)
  const items = await fetchItemTrade(KEY, HS, STRT, END);
  const byQ = {};
  for (const it of items) {
    if (!it.year?.includes('.')) continue;
    const q = toQuarter(it.year);
    (byQ[q] ??= { period: q, exports: 0, imports: 0 });
    byQ[q].exports += Number(it.expDlr || 0);
    byQ[q].imports += Number(it.impDlr || 0);
  }
  const trows = Object.values(byQ).sort((a, b) => a.period.localeCompare(b.period))
    .map((r) => ({ ...r, hs_code: HS, provenance: 'real' }));
  validate(trows, ['hs_code', 'period'], 'trade_stats');
  upsert('trade_stats', ['hs_code', 'period', 'exports', 'imports', 'unit', 'src_date', 'provenance'],
    trows.map((r) => `('${HS}','${esc(r.period)}',${r.exports},${r.imports},'USD',NULL,'real')`));

  // 2) 국가별 → trade_by_country (기간 합산 + 수입 비중)
  const crows = [];
  for (const c of COUNTRIES) {
    const its = await fetchNitemTrade(KEY, HS, c, STRT, END);
    let exp = 0, imp = 0, nm = c;
    for (const it of its) { exp += Number(it.expDlr || 0); imp += Number(it.impDlr || 0); if (it.cntyNm) nm = it.cntyNm; }
    crows.push({ cnty_cd: c, cnty_nm: nm, exports: exp, imports: imp });
  }
  const totImp = crows.reduce((s, r) => s + r.imports, 0) || 1;
  for (const r of crows) r.share = r.imports / totImp;
  validate(crows, ['cnty_cd', 'cnty_nm'], 'trade_by_country');
  upsert('trade_by_country', ['hs_code', 'cnty_cd', 'cnty_nm', 'exports', 'imports', 'share', 'provenance'],
    crows.map((r) => `('${HS}','${esc(r.cnty_cd)}','${esc(r.cnty_nm)}',${r.exports},${r.imports},${r.share.toFixed(4)},'real')`));

  return { quarters: trows.length, countries: crows.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestTrade().then((r) => console.log('✓ 무역 적재:', JSON.stringify(r)))
    .catch((e) => { console.error('✖ 무역 적재 실패:', e.message); process.exit(1); });
}
