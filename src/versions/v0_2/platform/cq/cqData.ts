export type CqStatus = 'verified' | 'draft' | 'pending';

export interface CqEntityTag {
  name: string;
  color: string;
}

export interface CqDataReq {
  data: string;
  source: string;
  status: 'confirmed' | 'partial' | 'pending';
}

export interface CqItem {
  id: string;
  tier: 1 | 2;
  status: CqStatus;
  question: string;
  background: string;
  entityCount: number;
  relationCount: number;
  entities: CqEntityTag[];
  relations: string[];
  cypher: string;
  verifiedAt?: string;
  statsNodes?: number;
  statsEdges?: number;
  statsTime?: number;
  resultItems?: string[];
  dataRequirements?: CqDataReq[];
}

const COLORS = {
  event: '#E60012',
  region: '#FF9F0A',
  country: '#4A90D9',
  raw: '#8B6914',
  intermediate: '#7B68EE',
  product: '#2ECC71',
  industry: '#E74C3C',
  company: '#3498DB',
  ews: '#F39C12',
  policy: '#34495E',
  rnd: '#9B59B6',
};

export const CQ_ITEMS: CqItem[] = [
  {
    id: 'CQ-001',
    tier: 1,
    status: 'verified',
    question: '호르무즈 해협 봉쇄 시, 소부장(공작기계) 밸류체인에서 가장 크게 영향받는 품목 5개와 인과 경로는?',
    background: '고객 Pain Point #6(정량 분석 한계), #7(전후방 영향도 한계)에 대응하는 핵심 시나리오 질의. 호르무즈 → 원유 → 석유화학 중간재 → 소부장 부품 경로 추적.',
    entityCount: 8,
    relationCount: 6,
    entities: [
      { name: 'Event', color: COLORS.event },
      { name: 'Region', color: COLORS.region },
      { name: 'Country', color: COLORS.country },
      { name: 'RawMaterial', color: COLORS.raw },
      { name: 'IntermediateGoods', color: COLORS.intermediate },
      { name: 'Product', color: COLORS.product },
      { name: 'Industry', color: COLORS.industry },
      { name: 'Company', color: COLORS.company },
    ],
    relations: ['DISRUPTS', 'CONTROLS_ROUTE', 'EXPORTS', 'REFINES_TO', 'INPUT_TO', 'BELONGS_TO'],
    cypher: `MATCH path = (e:Event {name:'호르무즈 해협 봉쇄'})
  -[:DISRUPTS]->(r:Region)
  -[:CONTROLS_ROUTE]->(c:Country)
  -[:EXPORTS]->(rm:RawMaterial)
  -[:REFINES_TO*1..3]->(ig:IntermediateGoods)
  -[:INPUT_TO]->(p:Product)
  -[:BELONGS_TO]->(ind:Industry)
RETURN p.name, ind.name,
  reduce(coeff=1.0, rel IN relationships(path)
    | coeff * rel.input_coefficient) AS impact_score
ORDER BY impact_score DESC LIMIT 5`,
    verifiedAt: '2026-05-26',
    statsNodes: 42,
    statsEdges: 67,
    statsTime: 0.23,
    resultItems: ['감속기', '볼스크류', '스핀들', '베어링', '공압 밸브'],
    dataRequirements: [
      { data: '산업연관표', source: 'ECOS', status: 'confirmed' },
      { data: '원유 수입통계', source: 'Petronet', status: 'confirmed' },
      { data: 'HS별 수출입', source: 'UNIPASS', status: 'confirmed' },
      { data: '기업 DB', source: 'GIVC', status: 'confirmed' },
      { data: '공작기계 생산통계', source: 'KOAMI', status: 'confirmed' },
    ],
  },
  {
    id: 'CQ-002',
    tier: 1,
    status: 'verified',
    question: '소부장 자립화 R&D 공고 시, GIVC 데이터 기반으로 공작기계 분야 적합 기업 Top 5와 선정 근거, 반대 추천을 제시할 수 있는가?',
    background: '소부장 R&D 지원 정책의 실효성 제고. GIVC 데이터(기업 재무·특허·수출)와 온톨로지 기반 가중치 스코어링으로 정량 근거 제시. 의사결정자 판단 보조.',
    entityCount: 5,
    relationCount: 5,
    entities: [
      { name: 'Company', color: COLORS.company },
      { name: 'Product', color: COLORS.product },
      { name: 'Industry', color: COLORS.industry },
      { name: 'RnD', color: COLORS.rnd },
      { name: 'Policy', color: COLORS.policy },
    ],
    relations: ['PRODUCES', 'BELONGS_TO', 'INVESTS_IN', 'APPLIES_FOR', 'TARGETS'],
    cypher: `MATCH (c:Company)-[:PRODUCES]->(p:Product)-[:BELONGS_TO]->(ind:Industry {ksic:'28'})
OPTIONAL MATCH (c)-[:INVESTS_IN]->(r:RnD)
WITH c, p, ind,
  c.export_ratio * 0.3 +
  c.rnd_ratio * 0.3 +
  c.operating_margin * 0.2 +
  c.patent_count * 0.1 +
  coalesce(r.gov_support_ratio, 0) * 0.1 AS score
RETURN c.name, p.name, round(score, 2) AS score
ORDER BY score DESC LIMIT 5`,
    verifiedAt: '2026-05-26',
    statsNodes: 28,
    statsEdges: 45,
    statsTime: 0.17,
    resultItems: ['대한정밀감속기', '서원베어링테크', '화천기공', '스맥', '삼익THK'],
    dataRequirements: [
      { data: '기업 재무데이터', source: 'DART', status: 'confirmed' },
      { data: 'R&D 투자 현황', source: 'NTIS', status: 'confirmed' },
      { data: '수출 통계', source: 'UNIPASS', status: 'confirmed' },
      { data: '특허 DB', source: 'KIPRIS', status: 'partial' },
      { data: 'GIVC 기업 DB', source: 'GIVC', status: 'confirmed' },
    ],
  },
  {
    id: 'CQ-003',
    tier: 2,
    status: 'draft',
    question: '공작기계 핵심 소재(초경합금·특수강) 수입 의존도 80%+ 상황에서 대체 수입선과 전환 비용은?',
    background: '소부장 소재 자립화 과제. 특정 국가(중국·일본) 의존 리스크를 정량화하고 대체 수입선 전환 비용(가격·리드타임)을 추산.',
    entityCount: 5,
    relationCount: 4,
    entities: [
      { name: 'Country', color: COLORS.country },
      { name: 'RawMaterial', color: COLORS.raw },
      { name: 'IntermediateGoods', color: COLORS.intermediate },
      { name: 'Company', color: COLORS.company },
      { name: 'Product', color: COLORS.product },
    ],
    relations: ['EXPORTS', 'REFINES_TO', 'INPUT_TO', 'PRODUCES'],
    cypher: `// 대체 수입선 탐색 — 현재 상위 수입국 제외
MATCH (c:Country)-[e:EXPORTS]->(rm:RawMaterial {type:'carbide'})
WHERE NOT c.name IN ['China','Japan']
RETURN c.name, rm.name, e.volume AS alt_volume,
  e.price_premium AS cost_delta
ORDER BY alt_volume DESC LIMIT 5`,
    dataRequirements: [
      { data: 'HS 수입통계', source: 'UNIPASS', status: 'confirmed' },
      { data: '소재 가격 DB', source: 'S&P', status: 'pending' },
    ],
  },
  {
    id: 'CQ-004',
    tier: 2,
    status: 'draft',
    question: 'EWS 경보 발동 기준 초과 소부장 품목은 몇 개이며, 어떤 정책 조치가 연결되어 있는가?',
    background: '조기경보 시스템과 정책 연계성 검증. EWS 지수(무역 의존도·가격 변동성·재고 수준) 복합 산출 후 임계 초과 품목을 자동 식별.',
    entityCount: 4,
    relationCount: 3,
    entities: [
      { name: 'EWS', color: COLORS.ews },
      { name: 'Product', color: COLORS.product },
      { name: 'Policy', color: COLORS.policy },
      { name: 'Industry', color: COLORS.industry },
    ],
    relations: ['TRIGGERS_POLICY', 'BELONGS_TO', 'MONITORS'],
    cypher: `MATCH (w:EWS)-[:MONITORS]->(p:Product)
WHERE w.index > w.threshold
OPTIONAL MATCH (w)-[:TRIGGERS_POLICY]->(pol:Policy)
RETURN p.name, w.index, w.threshold,
  collect(pol.title) AS policies
ORDER BY w.index DESC`,
    dataRequirements: [
      { data: 'EWS 지수 시계열', source: 'GIVC', status: 'confirmed' },
      { data: '정책 DB', source: 'MOTIE', status: 'partial' },
    ],
  },
  {
    id: 'CQ-005',
    tier: 2,
    status: 'draft',
    question: '국산화율 임계점(30%) 이하인 소부장 기업 중 R&D 지원 집중 대상 Top 3는?',
    background: '선별적 R&D 자원 배분. 국산화율이 낮으면서 기술 역량(R&D 비율·특허)이 있는 기업을 식별하여 전략적 지원 집중.',
    entityCount: 4,
    relationCount: 3,
    entities: [
      { name: 'Company', color: COLORS.company },
      { name: 'Product', color: COLORS.product },
      { name: 'RnD', color: COLORS.rnd },
      { name: 'Policy', color: COLORS.policy },
    ],
    relations: ['PRODUCES', 'INVESTS_IN', 'APPLIES_FOR'],
    cypher: `MATCH (c:Company)-[:PRODUCES]->(p:Product)
WHERE p.domestic_ratio < 0.30
OPTIONAL MATCH (c)-[:INVESTS_IN]->(r:RnD)
WITH c, p,
  c.rnd_ratio * 0.5 + coalesce(r.patent_count, 0) * 0.3 +
  (0.30 - p.domestic_ratio) * 0.2 AS priority_score
RETURN c.name, p.name,
  round(p.domestic_ratio * 100, 1) AS domestic_pct,
  round(priority_score, 2) AS score
ORDER BY score DESC LIMIT 3`,
    dataRequirements: [
      { data: '국산화율 DB', source: 'KOAMI', status: 'partial' },
      { data: 'R&D 현황', source: 'NTIS', status: 'confirmed' },
    ],
  },
  {
    id: 'CQ-006',
    tier: 2,
    status: 'draft',
    question: '소부장 공급망 충격 시 산업부가 우선 검토해야 할 정책 조치 3가지는?',
    background: '의사결정자(산업부) 대응 매뉴얼 자동화. 온톨로지 기반 영향도 분석 → 정책 옵션 우선순위 자동 산출.',
    entityCount: 6,
    relationCount: 5,
    entities: [
      { name: 'Event', color: COLORS.event },
      { name: 'Product', color: COLORS.product },
      { name: 'Industry', color: COLORS.industry },
      { name: 'Company', color: COLORS.company },
      { name: 'Policy', color: COLORS.policy },
      { name: 'EWS', color: COLORS.ews },
    ],
    relations: ['DISRUPTS', 'INPUT_TO', 'BELONGS_TO', 'TRIGGERS_POLICY', 'MONITORS'],
    cypher: `// 충격 이벤트 → 정책 매핑
MATCH (e:Event)-[:DISRUPTS*1..4]->(p:Product)-[:BELONGS_TO]->(ind:Industry)
MATCH (w:EWS)-[:MONITORS]->(p)
MATCH (w)-[:TRIGGERS_POLICY]->(pol:Policy)
WITH pol, count(p) AS affected_products,
  avg(w.index - w.threshold) AS avg_excess
RETURN pol.title, affected_products, round(avg_excess, 2) AS urgency
ORDER BY urgency DESC LIMIT 3`,
    dataRequirements: [
      { data: '정책 DB', source: 'MOTIE', status: 'partial' },
      { data: 'EWS 지수', source: 'GIVC', status: 'confirmed' },
    ],
  },
  {
    id: 'CQ-007',
    tier: 2,
    status: 'pending',
    question: '공급망 충격 해소 후에도 구조적으로 취약한 소부장 품목은? (일시적 vs 구조적 취약성 구분)',
    background: '단기 충격과 장기 구조 문제를 분리하는 것이 정책 실효성의 핵심. 재고 회복 속도·수입 다변화 진행·국산화 추진 현황을 복합 분석.',
    entityCount: 5,
    relationCount: 4,
    entities: [
      { name: 'Product', color: COLORS.product },
      { name: 'Country', color: COLORS.country },
      { name: 'Industry', color: COLORS.industry },
      { name: 'EWS', color: COLORS.ews },
      { name: 'Company', color: COLORS.company },
    ],
    relations: ['EXPORTS', 'BELONGS_TO', 'MONITORS', 'PRODUCES'],
    cypher: `// 구조적 취약성 = 시계열 EWS 지수가 복수 분기 임계 초과
MATCH (w:EWS)-[:MONITORS]->(p:Product)
WITH p, collect(w.index) AS history,
  w.threshold AS threshold
WHERE size([x IN history WHERE x > threshold]) >= 3
RETURN p.name,
  size([x IN history WHERE x > threshold]) AS quarters_above,
  max(history) AS peak_ews
ORDER BY quarters_above DESC`,
    dataRequirements: [
      { data: 'EWS 시계열', source: 'GIVC', status: 'partial' },
      { data: '재고 통계', source: 'KOAMI', status: 'pending' },
    ],
  },
];
