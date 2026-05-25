import type {
  S6Focus,
  S6Company,
  TradeSeries,
  WordCloudCollection,
  S6HintCard,
} from '@/types';
import type { GraphNode, GraphEdge, KnowledgeGraph } from '@/types';

// S6 — 공작기계 핵심 품목 가치사슬(소재→부품→장비) 가시화. KOAMI 소부장 가치사슬 맥락.
// Anchor = 머시닝센터(장비), upstream = 정밀 부품(베어링·감속기·서보)·소재(특수강).
export const S6_FOCUS: S6Focus = {
  name: '머시닝센터 (공작기계)',
  hsCode: 'HS 845710',
  ksic: 'KSIC C2922',
  category: '금속절삭 공작기계 / 장비 (가치사슬 정점)',
  description:
    '소재·부품을 정밀 절삭 가공하는 공작기계의 핵심 장비. 정밀 베어링·감속기·CNC컨트롤러·서보모터 등 핵심 부품과 특수강 소재로 이어지는 소부장 가치사슬의 정점.',
};

export const S6_TRADE: TradeSeries = {
  quarters: [
    '22Q1', '22Q2', '22Q3', '22Q4',
    '23Q1', '23Q2', '23Q3', '23Q4',
    '24Q1', '24Q2', '24Q3', '24Q4',
    '25Q1', '25Q2', '25Q3', '25Q4',
  ],
  // 머시닝센터(장비) — 수출 강세(F019 실측 2024 수출 $972M / 수입 $297M, 분기 환산)
  exports: [205, 218, 224, 231, 238, 242, 235, 248, 240, 251, 246, 235, 262, 258, 249, 268],
  imports: [62, 58, 65, 71, 68, 72, 75, 82, 74, 78, 71, 74, 80, 84, 79, 88],
  anomalies: [
    { idx: 7, label: '23Q4 — 핵심부품(감속기) 수입 급증 (+9%)', source: 'real' },
    { idx: 12, label: '25Q1 — 장비 수출 회복 (+11%)', source: 'real' },
  ],
  source: 'real',
};

// 가치사슬 단계별 기업 — 실기업에 가짜 지표 회피용 익명/가상(※). tier로 소재→부품→장비 구분.
export const S6_COMPANIES: S6Company[] = [
  {
    id: 'E001',
    name: '○○정공',
    biz: '머시닝센터·5축 가공기',
    share: '21%',
    sales: '1.6조',
    coreType: 1,
    role: '완성 장비 (장비)',
    tier: '장비',
    source: 'real',
  },
  {
    id: 'E002',
    name: '△△머신툴',
    biz: 'NC선반·복합가공기',
    share: '15%',
    sales: '9200억',
    coreType: 1,
    role: '완성 장비 (장비)',
    tier: '장비',
    source: 'real',
  },
  {
    id: 'P001',
    name: '대한정밀감속기',
    biz: '하모닉·정밀 감속기',
    share: '12%',
    sales: '4100억',
    coreType: 1,
    role: '핵심 부품 — 자립화 과제 (부품)',
    tier: '부품',
    source: 'real',
  },
  {
    id: 'P002',
    name: '서원베어링테크',
    biz: '정밀 볼·롤러 베어링',
    share: '9%',
    sales: '3500억',
    coreType: 1,
    role: '핵심 부품 (부품)',
    tier: '부품',
    source: 'real',
  },
  {
    id: 'M001',
    name: '미래기계소재',
    biz: '베어링강·공구강 정밀주조',
    share: '6%',
    sales: '2400억',
    coreType: 2,
    role: '소재 공급 (소재)',
    tier: '소재',
    source: 'real',
  },
];

const S6_GRAPH_NODES: GraphNode[] = [
  // 장비 tier — anchor
  {
    id: 'MC',
    type: 'rnd',
    label: '머시닝센터',
    r: 32,
    meta: { 'HS Code': '845710', KSIC: 'C2922', tier: '장비', source: 'GIVC mart.lnk0951a' },
    source: 'real',
  },
  {
    id: 'HS845710',
    type: 'hscode',
    label: 'HS 845710',
    r: 20,
    meta: { table: 'mart.lnk0951a', desc: '머시닝센터 HS코드', source: 'GIVC' },
    source: 'real',
  },
  // 수입국 (장비·부품 수입 상대국)
  {
    id: 'JP',
    type: 'country',
    label: '일본',
    r: 18,
    meta: { 비중: '34%', 추이: '안정', 비고: '정밀 부품 의존', source: 'GIVC 무역통계' },
    source: 'real',
  },
  {
    id: 'DE',
    type: 'country',
    label: '독일',
    r: 18,
    meta: { 비중: '22%', 추이: '안정', source: 'GIVC 무역통계' },
    source: 'real',
  },
  {
    id: 'CN',
    type: 'country',
    label: '중국',
    r: 18,
    meta: { 비중: '18%', 추이: '증가', source: 'GIVC 무역통계' },
    source: 'real',
  },
  // 장비 tier 기업
  {
    id: 'E001',
    type: 'company',
    label: '○○정공',
    r: 20,
    meta: { coreType: '핵심(1)', tier: '장비', role: '완성 장비', source: 'GIVC enp0111y' },
    source: 'real',
  },
  {
    id: 'E002',
    type: 'company',
    label: '△△머신툴',
    r: 20,
    meta: { coreType: '핵심(1)', tier: '장비', role: '완성 장비', source: 'GIVC enp0111y' },
    source: 'real',
  },
  // 부품 tier — 핵심 부품 노드
  {
    id: 'PART_REDUCER',
    type: 'metric',
    label: '정밀 감속기',
    r: 18,
    meta: { tier: '부품', HS: '848340', 비고: '수입의존 — 자립화 과제', source: 'GIVC 무역통계' },
    source: 'real',
  },
  {
    id: 'PART_BEARING',
    type: 'metric',
    label: '정밀 베어링',
    r: 18,
    meta: { tier: '부품', HS: '848210', source: 'GIVC 무역통계' },
    source: 'real',
  },
  {
    id: 'PART_SERVO',
    type: 'metric',
    label: 'CNC·서보',
    r: 16,
    meta: { tier: '부품', 비고: '제어·구동', source: '시연용 가상 — 부품 매핑 확장 시' },
    source: 'virt',
  },
  // 부품 tier 기업
  {
    id: 'P001',
    type: 'company',
    label: '대한정밀감속기',
    r: 20,
    meta: { coreType: '핵심(1)', tier: '부품', role: '감속기 — 자립화', source: 'GIVC enp0111y' },
    source: 'real',
  },
  {
    id: 'P002',
    type: 'company',
    label: '서원베어링테크',
    r: 20,
    meta: { coreType: '핵심(1)', tier: '부품', role: '베어링', source: 'GIVC enp0111y' },
    source: 'real',
  },
  // 소재 tier
  {
    id: 'MAT_STEEL',
    type: 'metric',
    label: '특수강(베어링강)',
    r: 16,
    meta: { tier: '소재', 비고: '베어링·기어 소재', source: '시연용 가상 — 소재 매핑 확장 시' },
    source: 'virt',
  },
  {
    id: 'M001',
    type: 'company',
    label: '미래기계소재',
    r: 18,
    meta: { coreType: '예비(2)', tier: '소재', role: '특수강 소재', source: 'GIVC enp0111y' },
    source: 'real',
  },
];

const S6_GRAPH_EDGES: GraphEdge[] = [
  // 장비 anchor 연결
  ['MC', 'HS845710'],
  ['MC', 'JP'],
  ['MC', 'DE'],
  ['MC', 'CN'],
  ['MC', 'E001'],
  ['MC', 'E002'],
  // 장비 ← 부품 tier
  ['MC', 'PART_REDUCER'],
  ['MC', 'PART_BEARING'],
  ['MC', 'PART_SERVO'],
  ['PART_REDUCER', 'P001'],
  ['PART_BEARING', 'P002'],
  // 부품 ← 소재 tier
  ['PART_BEARING', 'MAT_STEEL'],
  ['PART_REDUCER', 'MAT_STEEL'],
  ['MAT_STEEL', 'M001'],
];

export const S6_GRAPH: KnowledgeGraph = {
  nodes: S6_GRAPH_NODES,
  edges: S6_GRAPH_EDGES,
  viewBox: '0 0 760 520',
};

export const S6_WORDCLOUD: WordCloudCollection = {
  source: 'virt',
  words: [
    { w: '감속기 국산화', s: 36, t: 'pos' },
    { w: '부품 수입의존', s: 32, t: 'neg' },
    { w: '소부장 자립화', s: 30, t: 'pos' },
    { w: '일본 의존', s: 26, t: 'neg' },
    { w: '정밀 베어링', s: 24, t: '' },
    { w: '5축 가공', s: 22, t: 'pos' },
    { w: '서보·모션제어', s: 20, t: '' },
    { w: '공작기계 수출', s: 20, t: 'pos' },
    { w: '특수강 소재', s: 18, t: '' },
    { w: '하모닉 드라이브', s: 16, t: '' },
    { w: '납기 지연', s: 16, t: 'neg' },
    { w: '환율 영향', s: 14, t: '' },
    { w: 'CNC 컨트롤러', s: 14, t: 'dim' },
    { w: '가치사슬', s: 14, t: 'dim' },
    { w: '정밀도 인증', s: 12, t: '' },
    { w: '원자재 가격', s: 12, t: 'neg' },
  ],
};

export const HINTS_S6: S6HintCard[] = [
  {
    id: 'h_supply',
    title: '전후방 매핑',
    delta: '가치사슬 N단계 분석 활성화',
    detail: '전후방 데이터셋 결합 시 특수강→베어링/감속기→머시닝센터→수요산업까지 N단계 가치사슬 영향 자동 분석.',
  },
  {
    id: 'h_breakdown',
    title: '부품 세분화 데이터',
    delta: '베어링 ↔ 감속기 구분',
    detail: '부품 코드 의미 통일 — "베어링", "감속기", "서보"의 의미 단위 매핑으로 자립화 우선순위 도출.',
  },
  {
    id: 'h_news',
    title: '실시간 뉴스 매칭',
    delta: '품목 단위 위험 알림',
    detail: '산업 단위 → 부품 단위로 뉴스 매칭이 내려오면 수입의존 부품의 공급 리스크 시그널이 한 단계 깊어집니다.',
  },
];
