/** F023 — 관세청 무역 적재(기계 가치사슬): 앵커(머시닝센터)+tier HS 총량→trade_stats(분기)
 *  + 앵커 국가별→trade_by_country. 15101609 품목총량 + 15100475 품목국가별.
 *  HS·국가 목록은 가치사슬 SSOT(lib/valuechain.mjs)에서 — build-graph와 단일 진실원. */
import { upsert, validate, esc } from './lib/d1.mjs';
import { fetchItemTrade, fetchNitemTrade, toQuarter } from './lib/datagokr.mjs';
import { ANCHOR_HS, ALL_HS, TRADE_COUNTRIES } from './lib/valuechain.mjs';

const KEY = process.env.DATA_GO_KR_KEY;
const STRT = process.env.STRT_YYMM ?? '202401';
const END = process.env.END_YYMM ?? '202412';
const COUNTRIES = TRADE_COUNTRIES;

/** HS 한 건 → 분기 집계 trade_stats 행 */
async function quartersFor(hs) {
  const items = await fetchItemTrade(KEY, hs, STRT, END);
  const byQ = {};
  for (const it of items) {
    if (!it.year?.includes('.')) continue;
    const q = toQuarter(it.year);
    (byQ[q] ??= { period: q, exports: 0, imports: 0 });
    byQ[q].exports += Number(it.expDlr || 0);
    byQ[q].imports += Number(it.impDlr || 0);
  }
  return Object.values(byQ).sort((a, b) => a.period.localeCompare(b.period));
}

export async function ingestTrade() {
  if (!KEY) throw new Error('DATA_GO_KR_KEY 미설정 (.dev.vars)');

  // 1) 총량 → trade_stats (앵커 + tier HS 전체, 멱등 재적재)
  const trows = [];
  for (const hs of ALL_HS) {
    const qs = await quartersFor(hs);
    for (const r of qs) trows.push({ hs_code: hs, period: r.period, exports: r.exports, imports: r.imports });
  }
  validate(trows, ['hs_code', 'period'], 'trade_stats');
  upsert('trade_stats', ['hs_code', 'period', 'exports', 'imports', 'unit', 'src_date', 'provenance'],
    trows.map((r) => `('${esc(r.hs_code)}','${esc(r.period)}',${r.exports},${r.imports},'USD',NULL,'real')`));

  // 2) 국가별 → trade_by_country (앵커 HS 기준 수입 상대국 + 비중)
  const crows = [];
  for (const c of COUNTRIES) {
    const its = await fetchNitemTrade(KEY, ANCHOR_HS, c, STRT, END);
    let exp = 0, imp = 0, nm = c;
    for (const it of its) { exp += Number(it.expDlr || 0); imp += Number(it.impDlr || 0); if (it.cntyNm) nm = it.cntyNm; }
    crows.push({ cnty_cd: c, cnty_nm: nm, exports: exp, imports: imp });
  }
  const totImp = crows.reduce((s, r) => s + r.imports, 0) || 1;
  for (const r of crows) r.share = r.imports / totImp;
  validate(crows, ['cnty_cd', 'cnty_nm'], 'trade_by_country');
  upsert('trade_by_country', ['hs_code', 'cnty_cd', 'cnty_nm', 'exports', 'imports', 'share', 'provenance'],
    crows.map((r) => `('${ANCHOR_HS}','${esc(r.cnty_cd)}','${esc(r.cnty_nm)}',${r.exports},${r.imports},${r.share.toFixed(4)},'real')`));

  return { hsCodes: ALL_HS.length, statRows: trows.length, countries: crows.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestTrade().then((r) => console.log('✓ 무역 적재:', JSON.stringify(r)))
    .catch((e) => { console.error('✖ 무역 적재 실패:', e.message); process.exit(1); });
}
