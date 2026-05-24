import type {
  TolueneProduct,
  TolueneCompany,
  TradeSeries,
  WordCloudCollection,
  TolueneHintCard,
} from '@/types';
import type { GraphNode, GraphEdge, KnowledgeGraph } from '@/types';

export const S6_PRODUCT: TolueneProduct = {
  name: '톨루엔 (Toluene)',
  hsCode: 'HS 290230',
  cas: 'CAS 108-88-3',
  category: '방향족 탄화수소 / BTX',
  description:
    '벤젠 핵에 메틸기가 하나 결합한 방향족 화합물. 용제·옥탄가 향상제·TDI·TNT 등 다양한 화학공정 중간체',
};

export const S6_TRADE: TradeSeries = {
  quarters: [
    '22Q1', '22Q2', '22Q3', '22Q4',
    '23Q1', '23Q2', '23Q3', '23Q4',
    '24Q1', '24Q2', '24Q3', '24Q4',
    '25Q1', '25Q2', '25Q3', '25Q4',
  ],
  exports: [180, 195, 188, 175, 210, 205, 198, 215, 232, 245, 251, 248, 262, 258, 244, 268],
  imports: [62, 58, 65, 71, 68, 72, 75, 88, 102, 95, 110, 118, 125, 132, 145, 158],
  anomalies: [
    { idx: 7, label: '23Q4 — 수입 급증 (+17%)', source: 'real' },
    { idx: 14, label: '25Q3 — 수출 일시 감소 (-5%)', source: 'real' },
  ],
  source: 'real',
};

export const S6_COMPANIES: TolueneCompany[] = [
  {
    id: 'T001',
    name: '○○석유화학',
    biz: 'BTX 생산·정제',
    share: '23%',
    sales: '1.8조',
    coreType: 1,
    role: '원료 공급',
    source: 'real',
  },
  {
    id: 'T002',
    name: '△△에너지',
    biz: 'NCC·아로마틱',
    share: '18%',
    sales: '2.1조',
    coreType: 1,
    role: '원료 공급',
    source: 'real',
  },
  {
    id: 'T003',
    name: 'KS케미칼',
    biz: 'TDI 중간체',
    share: '14%',
    sales: '8200억',
    coreType: 1,
    role: '후방 수요',
    source: 'real',
  },
  {
    id: 'T004',
    name: '청해머티리얼',
    biz: '용제 가공',
    share: '7%',
    sales: '3400억',
    coreType: 2,
    role: '용제 가공',
    source: 'real',
  },
  {
    id: 'T005',
    name: '○○폴리머',
    biz: 'TNT·중간체',
    share: '5%',
    sales: '2800억',
    coreType: 2,
    role: '후방 수요',
    source: 'real',
  },
];

const S6_GRAPH_NODES: GraphNode[] = [
  {
    id: 'TOL',
    type: 'rnd',
    label: '톨루엔',
    r: 32,
    meta: { 'HS Code': '290230', CAS: '108-88-3', source: 'GIVC mart.lnk0951a' },
    source: 'real',
  },
  {
    id: 'HS290230',
    type: 'hscode',
    label: 'HS 290230',
    r: 20,
    meta: { table: 'mart.lnk0951a', desc: '톨루엔 HS코드', source: 'GIVC' },
    source: 'real',
  },
  {
    id: 'JP',
    type: 'country',
    label: '일본',
    r: 18,
    meta: { 비중: '38%', 추이: '안정', source: 'GIVC 무역통계' },
    source: 'real',
  },
  {
    id: 'CN',
    type: 'country',
    label: '중국',
    r: 18,
    meta: { 비중: '27%', 추이: '증가', source: 'GIVC 무역통계' },
    source: 'real',
  },
  {
    id: 'US',
    type: 'country',
    label: '미국',
    r: 18,
    meta: { 비중: '14%', 추이: '소폭 증가', source: 'GIVC 무역통계' },
    source: 'real',
  },
  {
    id: 'T001',
    type: 'company',
    label: '○○석유화학',
    r: 20,
    meta: { coreType: '핵심(1)', role: '원료 공급', source: 'GIVC enp0111y' },
    source: 'real',
  },
  {
    id: 'T002',
    type: 'company',
    label: '△△에너지',
    r: 20,
    meta: { coreType: '핵심(1)', role: '원료 공급', source: 'GIVC enp0111y' },
    source: 'real',
  },
  {
    id: 'T003',
    type: 'company',
    label: 'KS케미칼',
    r: 20,
    meta: { coreType: '핵심(1)', role: '후방 수요', source: 'GIVC enp0111y' },
    source: 'real',
  },
  {
    id: 'PROD_TDI',
    type: 'metric',
    label: 'TDI',
    r: 16,
    meta: { 단계: '후방 1단계', source: '시연용 가상 — 전후방 매핑 추가 시 확장' },
    source: 'virt',
  },
  {
    id: 'PROD_SOLVENT',
    type: 'metric',
    label: '용제·도료',
    r: 16,
    meta: { 단계: '후방 1단계', source: '시연용 가상' },
    source: 'virt',
  },
  {
    id: 'RAW_NCC',
    type: 'metric',
    label: 'NCC 부산물',
    r: 16,
    meta: { 단계: '전방 1단계', source: '시연용 가상' },
    source: 'virt',
  },
];

const S6_GRAPH_EDGES: GraphEdge[] = [
  ['TOL', 'HS290230'],
  ['TOL', 'JP'],
  ['TOL', 'CN'],
  ['TOL', 'US'],
  ['TOL', 'T001'],
  ['TOL', 'T002'],
  ['TOL', 'T003'],
  ['TOL', 'PROD_TDI'],
  ['TOL', 'PROD_SOLVENT'],
  ['TOL', 'RAW_NCC'],
  ['T003', 'PROD_TDI'],
  ['T001', 'RAW_NCC'],
  ['T002', 'PROD_SOLVENT'],
];

export const S6_GRAPH: KnowledgeGraph = {
  nodes: S6_GRAPH_NODES,
  edges: S6_GRAPH_EDGES,
  viewBox: '0 0 760 520',
};

export const S6_WORDCLOUD: WordCloudCollection = {
  source: 'virt',
  words: [
    { w: '수입 증가', s: 36, t: 'neg' },
    { w: '중국 의존', s: 32, t: 'neg' },
    { w: '국산화', s: 30, t: 'pos' },
    { w: 'TDI 단가', s: 26, t: 'neg' },
    { w: 'NCC 공정', s: 22, t: '' },
    { w: '재고 안정', s: 22, t: 'pos' },
    { w: '환율 영향', s: 20, t: '' },
    { w: '안전기준', s: 18, t: '' },
    { w: '도료 시장', s: 18, t: '' },
    { w: '벤젠 대체', s: 16, t: 'pos' },
    { w: '항만 적체', s: 16, t: 'neg' },
    { w: 'BTX 가격', s: 14, t: '' },
    { w: '아로마틱', s: 14, t: 'dim' },
    { w: '석유화학', s: 14, t: 'dim' },
    { w: '용제 회수', s: 12, t: 'dim' },
    { w: '운임 상승', s: 12, t: 'neg' },
  ],
};

export const HINTS_S6: TolueneHintCard[] = [
  {
    id: 'h_supply',
    title: '전후방 매핑',
    delta: '후방 영향 분석 활성화',
    detail: '전후방 데이터셋 결합 시 톨루엔→TDI→자동차 시트까지 N단계 영향 자동 분석.',
  },
  {
    id: 'h_breakdown',
    title: '품목 세분화 데이터',
    delta: '나프타 ↔ 톨루엔 구분',
    detail: '품목 코드 의미 통일 — "나프타", "경질 라프타", "톨루엔"의 의미 단위 매핑.',
  },
  {
    id: 'h_news',
    title: '실시간 뉴스 매칭',
    delta: '품목 단위 위험 알림',
    detail: '산업 단위 → 품목 단위로 뉴스 매칭이 내려오면 위험 시그널이 한 단계 깊어집니다.',
  },
];
