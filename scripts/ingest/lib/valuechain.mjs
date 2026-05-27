/** 공작기계 소부장 가치사슬 SSOT (보강 적재 2026-05-28).
 *  ingest-trade(무역 HS 대상) + build-graph(다단계 노드/엣지)가 공유.
 *  노드 id는 안정 유지 — dart.mjs ATTACH(MC/PART_BEARING/PART_REDUCER/MAT_STEEL)가 참조.
 *  tier: 소재(RawMaterial) → 부품(IntermediateGoods) → 장비(Product, anchor).
 *  HS는 전부 관세청 실데이터 검증됨(2026-05-28 probe). r=노드 반경(tier별). */
export const ANCHOR_HS = '845710';

export const CHAIN = [
  // 장비 tier — 완성 공작기계 (수출 흑자, anchor)
  { id: 'MC',           label: '머시닝센터',        tier: '장비', hs: '845710', r: 30 },
  { id: 'EQ_LATHE',     label: 'NC 선반',           tier: '장비', hs: '845811', r: 26 },
  // 부품 tier — 자립화 핵심 (감속기·제어반 수입적자)
  { id: 'PART_BEARING',   label: '정밀 베어링',      tier: '부품', hs: '848210', r: 18 },
  { id: 'PART_REDUCER',   label: '정밀 감속기',      tier: '부품', hs: '848340', r: 18 },
  { id: 'PART_NCCTRL',    label: 'NC 제어반',        tier: '부품', hs: '853710', r: 18 },
  { id: 'PART_BALLSCREW', label: '볼스크류·기어박스', tier: '부품', hs: '848350', r: 16 },
  { id: 'PART_PARTS',     label: '공작기계 부품',     tier: '부품', hs: '846693', r: 16 },
  { id: 'PART_TOOL',      label: '절삭·교환공구',     tier: '부품', hs: '820730', r: 16 },
  // 소재 tier — 특수강 (베어링·기어 소재, 수입적자)
  { id: 'MAT_STEEL',    label: '특수강',            tier: '소재', hs: '722840', r: 16 },
];

/** 가치사슬 위상 [src, dst]: 소재→부품, 부품→장비. build-graph가 양방향 전개. */
export const CHAIN_EDGES = [
  ['MAT_STEEL', 'PART_BEARING'], ['MAT_STEEL', 'PART_REDUCER'], ['MAT_STEEL', 'PART_BALLSCREW'],
  ['PART_BEARING', 'MC'], ['PART_BEARING', 'EQ_LATHE'],
  ['PART_REDUCER', 'MC'],
  ['PART_NCCTRL', 'MC'], ['PART_NCCTRL', 'EQ_LATHE'],
  ['PART_BALLSCREW', 'MC'], ['PART_BALLSCREW', 'EQ_LATHE'],
  ['PART_PARTS', 'MC'], ['PART_PARTS', 'EQ_LATHE'],
  ['PART_TOOL', 'MC'], ['PART_TOOL', 'EQ_LATHE'],
];

/** 무역 적재 대상 HS (중복 제거). */
export const ALL_HS = [...new Set(CHAIN.map((c) => c.hs))];

/** 앵커 HS 국가별 수입 상대국 (관세청 nitem). 그래프 country 노드 파생. */
export const TRADE_COUNTRIES = (process.env.CNTY_CDS ?? 'JP,DE,CN,TW,IT').split(',');
