/** F023 — DART(OpenDART) 기업 fetch. 키 1개(crtfc_key)가 전 API 커버.
 *  corp_code는 corpCode.xml(118k엔트리)에서 사전 해소한 큐레이션 목록 사용(아래 TARGETS). */
const BASE = 'https://opendart.fss.or.kr/api';

/** 공작기계 소부장 가치사슬 대상 기업 (실제 상장사, corpCode.xml 해소·DART 실매출 검증 2026-05-25 F023 게이트)
 *  core_type: 1=핵심(완성장비·자립화 핵심부품) / 2=보조(소재·예비).
 *  tier: 소재/부품/장비 (가치사슬 단계). attach: 그래프 부착 노드(build-graph 위상). role은 △est 큐레이션. */
export const TARGETS = [
  // 장비 tier — 머시닝센터·공작기계 완성 (anchor MC, 수출흑자)
  { corp_code: '00166519', name: '화천기공',       core_type: 1, tier: '장비', attach: 'MC',           role: '완성 장비(머시닝센터·공작기계)' },
  { corp_code: '00580056', name: '스맥',           core_type: 1, tier: '장비', attach: 'MC',           role: '완성 장비(공작기계·CNC제어·로봇)' },
  { corp_code: '00257732', name: '한국정밀기계',   core_type: 2, tier: '장비', attach: 'MC',           role: '완성 장비(정밀 공작기계)' },
  // 부품 tier — 정밀 베어링·감속기 (자립화 핵심, 감속기 수입적자)
  { corp_code: '00127802', name: '삼익THK',        core_type: 1, tier: '부품', attach: 'PART_BEARING', role: '정밀 베어링·LM가이드·볼스크류' },
  { corp_code: '00220686', name: '에스피지',       core_type: 1, tier: '부품', attach: 'PART_REDUCER', role: '정밀 감속기·기어드모터 — 자립화' },
  { corp_code: '00567897', name: '에스비비테크',   core_type: 1, tier: '부품', attach: 'PART_REDUCER', role: '하모닉 감속기 — 자립화 핵심' },
  { corp_code: '00567222', name: '우림피티에스',   core_type: 2, tier: '부품', attach: 'PART_REDUCER', role: '산업용 감속기·동력전달' },
  // 소재 tier — 특수강 (베어링·기어 소재, 수입적자)
  { corp_code: '00106669', name: '세아베스틸지주', core_type: 2, tier: '소재', attach: 'MAT_STEEL',    role: '특수강 — 베어링·기어 소재' },
  { corp_code: '00133991', name: '세아특수강',     core_type: 2, tier: '소재', attach: 'MAT_STEEL',    role: '특수강 선재·마봉강' },
  { corp_code: '00145880', name: '현대제철',       core_type: 2, tier: '소재', attach: 'MAT_STEEL',    role: '특수강 포함 종합 철강' },
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
