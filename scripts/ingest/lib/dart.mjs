/** F014 — DART(OpenDART) 기업 fetch. 키 1개(crtfc_key)가 전 API 커버.
 *  corp_code는 corpCode.xml(118k엔트리)에서 사전 해소한 큐레이션 목록 사용(아래 TARGETS). */
const BASE = 'https://opendart.fss.or.kr/api';

/** 톨루엔/BTX 밸류체인 대상 기업 (corpCode.xml 해소, 2026-05-25 검증)
 *  core_type: 1=원료공급(BTX 생산) / 2=후방수요·가공. role/core_type은 △est 큐레이션. */
export const TARGETS = [
  { corp_code: '00165413', name: '롯데케미칼',       core_type: 1, role: '원료 공급(BTX·아로마틱)' },
  { corp_code: '00461593', name: '한화토탈에너지스',  core_type: 1, role: '원료 공급(아로마틱)' },
  { corp_code: '00278373', name: '여천NCC',           core_type: 1, role: '원료 공급(NCC)' },
  { corp_code: '00106368', name: '금호석유화학',      core_type: 2, role: '후방 수요(합성고무·수지)' },
  { corp_code: '00260383', name: '대한유화',          core_type: 2, role: '후방 수요(올레핀·아로마틱)' },
  { corp_code: '01316236', name: '효성화학',          core_type: 2, role: '후방 수요(TPA·필름)' },
];

/** 기업개황 — corp_name·induty_code·ceo_nm·est_dt·adres */
export async function company(key, corpCode) {
  const j = await (await fetch(`${BASE}/company.json?crtfc_key=${key}&corp_code=${corpCode}`)).json();
  if (j.status !== '000') return null;
  return j;
}

/** 단일회사 주요계정 → 당기 매출액(원, 숫자). 연결(CFS) 우선, 없으면 별도(OFS). null 허용(비상장 등) */
export async function salesAmount(key, corpCode, year = '2024') {
  for (const fs of ['CFS', 'OFS']) {
    const j = await (await fetch(
      `${BASE}/fnlttSinglAcnt.json?crtfc_key=${key}&corp_code=${corpCode}&bsns_year=${year}&reprt_code=11011&fs_div=${fs}`,
    )).json();
    if (j.status === '000' && j.list) {
      const s = j.list.find((x) => x.account_nm === '매출액') ?? j.list.find((x) => x.account_nm.includes('수익'));
      if (s?.thstrm_amount) return Number(String(s.thstrm_amount).replace(/,/g, ''));
    }
  }
  return null;
}

/** 원 → "N.N조" / "N,NNN억" 표기 */
export function fmtKRW(won) {
  if (won == null) return null;
  const jo = won / 1e12;
  if (jo >= 1) return `${jo.toFixed(1)}조`;
  return `${Math.round(won / 1e8).toLocaleString()}억`;
}
