/** F014 — 관세청 무역통계 (data.go.kr) fetch + XML 파서
 *  ⚠️ Encoding 키(%2B 등)는 raw append 필수 (URLSearchParams 이중 인코딩→401).
 *     curl은 %-키 URL을 malformed로 거부(F013 교훈) → node fetch 사용. */
const BASE = 'https://apis.data.go.kr/1220000';
const UA = { 'User-Agent': 'Mozilla/5.0' };

async function get(url) {
  const res = await fetch(url, { headers: UA });
  const text = await res.text();
  if (!res.ok) throw new Error(`data.go.kr ${res.status}: ${text.slice(0, 100)}`);
  const code = (text.match(/<resultCode>([\s\S]*?)<\/resultCode>/) ?? [, ''])[1].trim();
  if (code && code !== '00') {
    const msg = (text.match(/<resultMsg>([\s\S]*?)<\/resultMsg>/) ?? [, ''])[1].trim();
    throw new Error(`data.go.kr resultCode ${code}: ${msg}`);
  }
  return text;
}

function parseItems(xml) {
  const items = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const b = m[1];
    const g = (t) => (b.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) ?? [, ''])[1].trim();
    items.push({
      year: g('year'), expDlr: g('expDlr'), impDlr: g('impDlr'),
      cntyNm: g('statCdCntnKor1'), cntyCd: g('statCd'), hsCd: g('hsCd'),
    });
  }
  return items;
}

export const toQuarter = (ym) => { const [y, m] = ym.split('.').map(Number); return `${y}Q${Math.ceil(m / 3)}`; };

/** 15101609 품목별 총량 (Itemtrade) */
export async function fetchItemTrade(key, hs, strt, end) {
  return parseItems(await get(`${BASE}/Itemtrade/getItemtradeList?serviceKey=${key}&strtYymm=${strt}&endYymm=${end}&hsSgn=${hs}`));
}

/** 15100475 품목별 국가별 (nitemtrade) — cntyCd별 */
export async function fetchNitemTrade(key, hs, cntyCd, strt, end) {
  return parseItems(await get(`${BASE}/nitemtrade/getNitemtradeList?serviceKey=${key}&strtYymm=${strt}&endYymm=${end}&hsSgn=${hs}&cntyCd=${cntyCd}`));
}
