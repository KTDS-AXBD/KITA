export type CqStatus = 'verified' | 'draft' | 'pending';

export interface CqEntityTag {
  name: string;
  color: string;
}

export interface CqDataReq {
  data: string;
  source: string;
  status: 'confirmed' | 'partial' | 'pending';
  /** 질의서 B(데이터 확보의향) 항목 key 연결 - 고객 회신이 이 필드를 채운다(폐루프). */
  surveyKey?: string;
}

/**
 * 빌드업 이력 1건. CQ가 일회성 질문이 아니라 기진회 PoC -> 산업부 보고로
 * 누적되는 자산임을 코드로 강제하는 장치(F040). 라운드/날짜/종류/메모.
 */
export type ProvenanceKind = 'registered' | 'survey' | 'data' | 'verified' | 'report';
export interface CqProvenance {
  round: string;
  date: string;
  kind: ProvenanceKind;
  note: string;
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
  /** 질의서 시나리오 매핑(S1~S7). 우선순위 회신을 CQ로 역추적하는 연결고리. */
  scenarioSid?: string;
  /** 이 CQ가 고객에게 던지는 질의(질의서 항목 연결). */
  customerAsk?: string;
  /** 산업부 보고 연결 - 이 CQ의 답이 들어가는 의사결정 보고 deliverable. */
  reportRef?: string;
  /** 빌드업 이력(기진회 세미나 -> 질의서 -> KG 검증 -> 산업부 보고). */
  provenance?: CqProvenance[];
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

/**
 * 질의서(Google Form) A섹션 시나리오 우선순위 S1~S7.
 * role: main(확정 시연) / sub(보조) / candidate(우선순위 회신 대기).
 * cqIds 비어있으면 backlog - 고객 우선순위 회신이 CQ 승격을 결정한다(F040).
 */
export type ScenarioRole = 'main' | 'sub' | 'candidate';
export interface SurveyScenario {
  sid: string;
  title: string;
  role: ScenarioRole;
  cqIds: string[];
}

export const SURVEY_SCENARIOS: SurveyScenario[] = [
  { sid: 'S1', title: '나프타 공급망 영향도', role: 'candidate', cqIds: [] },
  { sid: 'S2', title: '호르무즈 해협 지정학 리스크', role: 'candidate', cqIds: ['CQ-001'] },
  { sid: 'S3', title: '리튬·니켈 가격 폭등', role: 'candidate', cqIds: [] },
  { sid: 'S4', title: '소부장 자립화 R&D 적합 기업 추천', role: 'main', cqIds: ['CQ-002', 'CQ-005'] },
  { sid: 'S5', title: 'EWS 정책 대응안', role: 'candidate', cqIds: ['CQ-004', 'CQ-006'] },
  { sid: 'S6', title: '공작기계 가치사슬 가시화', role: 'sub', cqIds: ['CQ-003', 'CQ-007'] },
  { sid: 'S7', title: '한일 무역협정 영향', role: 'candidate', cqIds: [] },
];

/**
 * 질의서(Google Form) B섹션 - 추가 데이터 확보 의향 10종.
 * response: 고객 회신값(immediate/partial/later/no) · 미회신=pending.
 * 폼 미활성(GOOGLE_FORM.enabled=false) 상태라 현재 전부 pending(placeholder).
 * 폼 활성화·회신 수집 후 이 값이 채워지고 CQ dataRequirements 상태를 갱신한다.
 */
export type CustomerIntent = 'immediate' | 'partial' | 'later' | 'no' | 'pending';
export interface DataIntentItem {
  key: string;
  title: string;
  response: CustomerIntent;
}

export const DATA_INTENT_ITEMS: DataIntentItem[] = [
  { key: 'rnd_call', title: '산기평 신규 R&D 공고 이력·과거 결과', response: 'pending' },
  { key: 'updown', title: '품목 -> 품목 전후방 매핑', response: 'pending' },
  { key: 'naphtha', title: '나프타 종류별(경질·중질) 통계', response: 'pending' },
  { key: 'machine', title: '공작기계 핵심 부품(감속기·CNC) 가치사슬', response: 'pending' },
  { key: 'chat_log', title: 'ChatGIVC 비식별 로그', response: 'pending' },
  { key: 'faq', title: '산업부 자주 묻는 질문 Top 10~20', response: 'pending' },
  { key: 'pol_card', title: '정책 옵션 카드(과거 정책 이력)', response: 'pending' },
  { key: 'screens', title: 'GIVC 메뉴 트리·화면 캡처(대표)', response: 'pending' },
  { key: 'schema', title: '핵심 테이블 컬럼 사전(scmm_his_chart 등)', response: 'pending' },
  { key: 'ews_rule', title: 'EWS 위험 알림 알고리즘 명세', response: 'pending' },
];

/** key -> 질의서 표시 문구 (UI에서 surveyKey 라벨링용). */
export const DATA_INTENT_LABEL: Record<string, string> = Object.fromEntries(
  DATA_INTENT_ITEMS.map((d) => [d.key, d.title]),
);

export const CUSTOMER_INTENT_LABEL: Record<CustomerIntent, string> = {
  immediate: '즉시 제공',
  partial: '일부 제공',
  later: '추후 제공',
  no: '제공 불가',
  pending: '미회신',
};

export const CQ_ITEMS: CqItem[] = [
  {
    id: 'CQ-001',
    tier: 1,
    status: 'verified',
    question: '호르무즈 해협 봉쇄 시, 소부장(공작기계) 밸류체인에서 가장 크게 영향받는 품목 5개와 인과 경로는?',
    background: '지정학 충격의 정량 영향 분석·전후방 영향도 추적이 고객(기진회·산업부)의 핵심 니즈. 호르무즈 -> 원유 -> 석유화학 중간재 -> 소부장 부품 경로를 온톨로지로 추적해 단순 통계로는 보이지 않는 다단계 전파를 정량화한다.',
    scenarioSid: 'S2',
    customerAsk: '보신 충격 전파 경로는 공개데이터·가상 재현입니다. 귀측 GIVC 품목 전후방 매핑과 과거 정책 대응 이력을 연결하면 그대로 실값 분석이 됩니다. 지정학 리스크 시나리오 우선순위와 두 데이터의 공유 가능 범위를 확인하고 싶습니다.',
    reportRef: '산업부 「공급망 리스크 대응방안」 - 지정학 충격 영향 품목 식별·단계별 정책 권고 근거',
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
      { data: '산업연관표', source: 'ECOS', status: 'confirmed', surveyKey: 'updown' },
      { data: '원유 수입통계', source: 'Petronet', status: 'confirmed' },
      { data: 'HS별 수출입', source: 'UNIPASS', status: 'confirmed' },
      { data: '기업 DB', source: 'GIVC', status: 'confirmed', surveyKey: 'schema' },
      { data: '공작기계 생산통계', source: 'KOAMI', status: 'confirmed' },
    ],
    provenance: [
      { round: '기진회 1차 세미나', date: '2026-05-21', kind: 'registered', note: '지정학 충격 인과추적 니즈 확인 -> CQ 후보 도출' },
      { round: 'Phase 0 질의서', date: '2026-05-26', kind: 'survey', note: 'S2 우선순위·전후방 매핑 데이터 의향 질의 (회신 대기)' },
      { round: 'Phase 2 KG 검증', date: '2026-05-26', kind: 'verified', note: '42노드·67엣지 0.23초 탐색 -> 영향 품목 5종 도출' },
      { round: '산업부 보고', date: '예정', kind: 'report', note: '공급망 리스크 대응 보고 - 정책 권고 3종 근거로 편입' },
    ],
  },
  {
    id: 'CQ-002',
    tier: 1,
    status: 'verified',
    question: '소부장 자립화 R&D 공고 시, GIVC 데이터 기반으로 공작기계 분야 적합 기업 Top 5와 선정 근거, 반대 추천을 제시할 수 있는가?',
    background: '소부장 R&D 지원 정책의 실효성 제고. GIVC 데이터(기업 재무·특허·수출)와 온톨로지 기반 가중치 스코어링으로 정량 근거 제시. 의사결정자 판단 보조.',
    scenarioSid: 'S4',
    customerAsk: 'R&D 적합 기업 추천 정확도를 현재 65%에서 88%까지 끌어올리는 핵심은 산기평 신규 공고 이력과 공작기계 부품 가치사슬입니다. MAIN 시나리오인 만큼 우선순위와 두 데이터의 제공 시점을 협의하고 싶습니다.',
    reportRef: '산업부 「소부장 자립화 R&D 지원사업 기획」 - 적합 기업 선정 근거·반대 추천',
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
      { data: 'R&D 투자 현황', source: 'NTIS', status: 'confirmed', surveyKey: 'rnd_call' },
      { data: '수출 통계', source: 'UNIPASS', status: 'confirmed' },
      { data: '특허 DB', source: 'KIPRIS', status: 'partial' },
      { data: 'GIVC 기업 DB', source: 'GIVC', status: 'confirmed', surveyKey: 'schema' },
    ],
    provenance: [
      { round: '기진회 1차 세미나', date: '2026-05-21', kind: 'registered', note: 'R&D 지원 대상 선정 정량 근거 니즈 -> MAIN 시나리오 채택' },
      { round: 'Phase 0 질의서', date: '2026-05-26', kind: 'survey', note: 'S4 우선순위·산기평 공고 이력 데이터 의향 질의 (회신 대기)' },
      { round: 'Phase 2 KG 검증', date: '2026-05-26', kind: 'verified', note: '28노드·45엣지 0.17초 -> Top5 + 반대 추천 도출' },
      { round: '산업부 보고', date: '예정', kind: 'report', note: '소부장 자립화 R&D 지원 보고 - 선정 근거 자료로 편입' },
    ],
  },
  {
    id: 'CQ-003',
    tier: 2,
    status: 'draft',
    question: '공작기계 핵심 소재(초경합금·특수강) 수입 의존도 80%+ 상황에서 대체 수입선과 전환 비용은?',
    background: '소부장 소재 자립화 과제. 특정 국가(중국·일본) 의존 리스크를 정량화하고 대체 수입선 전환 비용(가격·리드타임)을 추산.',
    scenarioSid: 'S6',
    customerAsk: '초경합금·특수강 대체 수입선 분석을 실값으로 전환하려면 공작기계 부품 가치사슬과 핵심 테이블 컬럼 사전이 필요합니다. 소재 자립화 시나리오 관심도와 두 데이터의 공유 가능 여부를 확인하고 싶습니다.',
    reportRef: '산업부 「핵심소재 공급망 안정화 방안」 - 대체 수입선 다변화 전략 근거',
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
    cypher: `// 대체 수입선 탐색 - 현재 상위 수입국 제외
MATCH (c:Country)-[e:EXPORTS]->(rm:RawMaterial {type:'carbide'})
WHERE NOT c.name IN ['China','Japan']
RETURN c.name, rm.name, e.volume AS alt_volume,
  e.price_premium AS cost_delta
ORDER BY alt_volume DESC LIMIT 5`,
    dataRequirements: [
      { data: 'HS 수입통계', source: 'UNIPASS', status: 'confirmed' },
      { data: '소재 가격 DB', source: 'S&P', status: 'pending' },
    ],
    provenance: [
      { round: '기진회 1차 세미나', date: '2026-05-21', kind: 'registered', note: '소재 자립화 보조 시나리오(S6 가치사슬)로 후보 등록' },
      { round: 'Phase 0 질의서', date: '2026-05-26', kind: 'survey', note: 'S6 우선순위·소재 가격 데이터 의향 질의 (회신 대기)' },
    ],
  },
  {
    id: 'CQ-004',
    tier: 2,
    status: 'draft',
    question: 'EWS 경보 발동 기준 초과 소부장 품목은 몇 개이며, 어떤 정책 조치가 연결되어 있는가?',
    background: '조기경보 시스템과 정책 연계성 검증. EWS 지수(무역 의존도·가격 변동성·재고 수준) 복합 산출 후 임계 초과 품목을 자동 식별.',
    scenarioSid: 'S5',
    customerAsk: 'EWS 경보가 실제 어떤 정책으로 이어지는지 보여드리려면 귀측 위험 알림 알고리즘 명세와 정책 옵션 카드가 필요합니다. 조기경보 시나리오 우선순위와 두 자료의 공유 범위를 확인하고 싶습니다.',
    reportRef: '산업부 「조기경보(EWS) 운영 현황 보고」 - 임계 초과 품목·연계 정책 매핑',
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
      { data: 'EWS 지수 시계열', source: 'GIVC', status: 'confirmed', surveyKey: 'ews_rule' },
      { data: '정책 DB', source: 'MOTIE', status: 'partial', surveyKey: 'pol_card' },
    ],
    provenance: [
      { round: '기진회 1차 세미나', date: '2026-05-21', kind: 'registered', note: 'EWS·정책 연계 시나리오(S5)로 후보 등록' },
      { round: 'Phase 0 질의서', date: '2026-05-26', kind: 'survey', note: 'S5 우선순위·EWS 알고리즘 명세 데이터 의향 질의 (회신 대기)' },
    ],
  },
  {
    id: 'CQ-005',
    tier: 2,
    status: 'draft',
    question: '국산화율 임계점(30%) 이하인 소부장 기업 중 R&D 지원 집중 대상 Top 3는?',
    background: '선별적 R&D 자원 배분. 국산화율이 낮으면서 기술 역량(R&D 비율·특허)이 있는 기업을 식별하여 전략적 지원 집중.',
    scenarioSid: 'S4',
    customerAsk: '국산화율 기준 선별 지원 대상을 실값으로 도출하려면 산기평 공고 이력과 품목별 국산화율 데이터가 필요합니다. R&D 자원 배분 시나리오 관심도와 두 데이터의 보유 현황을 확인하고 싶습니다.',
    reportRef: '산업부 「소부장 R&D 예산 배분 건의」 - 국산화율 기반 선별 지원 대상',
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
      { data: 'R&D 현황', source: 'NTIS', status: 'confirmed', surveyKey: 'rnd_call' },
    ],
    provenance: [
      { round: '기진회 1차 세미나', date: '2026-05-21', kind: 'registered', note: 'MAIN(S4) 변형 - 선별 지원 우선순위 CQ로 후보 등록' },
      { round: 'Phase 0 질의서', date: '2026-05-26', kind: 'survey', note: 'S4 우선순위·국산화율 데이터 의향 질의 (회신 대기)' },
    ],
  },
  {
    id: 'CQ-006',
    tier: 2,
    status: 'draft',
    question: '소부장 공급망 충격 시 산업부가 우선 검토해야 할 정책 조치 3가지는?',
    background: '의사결정자(산업부) 대응 매뉴얼 자동화. 온톨로지 기반 영향도 분석 -> 정책 옵션 우선순위 자동 산출.',
    scenarioSid: 'S5',
    customerAsk: '공급망 충격 시 우선 정책 옵션을 자동 제시하려면 과거 정책 이력 카드와 산업부 빈출 질의 Top10이 핵심입니다. 정책 대응 시나리오 우선순위와 두 자료의 공유 가능 여부를 확인하고 싶습니다.',
    reportRef: '산업부 「공급망 충격 대응 매뉴얼」 - 우선 정책 옵션 Top3 근거',
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
    cypher: `// 충격 이벤트 -> 정책 매핑
MATCH (e:Event)-[:DISRUPTS*1..4]->(p:Product)-[:BELONGS_TO]->(ind:Industry)
MATCH (w:EWS)-[:MONITORS]->(p)
MATCH (w)-[:TRIGGERS_POLICY]->(pol:Policy)
WITH pol, count(p) AS affected_products,
  avg(w.index - w.threshold) AS avg_excess
RETURN pol.title, affected_products, round(avg_excess, 2) AS urgency
ORDER BY urgency DESC LIMIT 3`,
    dataRequirements: [
      { data: '정책 DB', source: 'MOTIE', status: 'partial', surveyKey: 'pol_card' },
      { data: 'EWS 지수', source: 'GIVC', status: 'confirmed', surveyKey: 'ews_rule' },
    ],
    provenance: [
      { round: '기진회 1차 세미나', date: '2026-05-21', kind: 'registered', note: '산업부 대응 매뉴얼 자동화(S5 변형)로 후보 등록' },
      { round: 'Phase 0 질의서', date: '2026-05-26', kind: 'survey', note: 'S5 우선순위·정책 옵션 카드 데이터 의향 질의 (회신 대기)' },
    ],
  },
  {
    id: 'CQ-007',
    tier: 2,
    status: 'pending',
    question: '공급망 충격 해소 후에도 구조적으로 취약한 소부장 품목은? (일시적 vs 구조적 취약성 구분)',
    background: '단기 충격과 장기 구조 문제를 분리하는 것이 정책 실효성의 핵심. 재고 회복 속도·수입 다변화 진행·국산화 추진 현황을 복합 분석.',
    scenarioSid: 'S6',
    customerAsk: '일시 충격과 구조적 취약성을 구분해 보여드리려면 EWS 시계열 알고리즘 명세와 품목 전후방 매핑이 필요합니다. 본 진단 시나리오 관심도와 시계열 데이터의 확보 가능 시점을 확인하고 싶습니다.',
    reportRef: '산업부 「소부장 구조적 취약성 진단 보고」 - 일시 vs 구조 취약성 구분',
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
      { data: 'EWS 시계열', source: 'GIVC', status: 'partial', surveyKey: 'ews_rule' },
      { data: '재고 통계', source: 'KOAMI', status: 'pending' },
    ],
    provenance: [
      { round: '기진회 1차 세미나', date: '2026-05-21', kind: 'registered', note: '일시 vs 구조 구분 진단(S6 심화)으로 후보 등록 - 데이터 확보 후 착수' },
      { round: 'Phase 0 질의서', date: '2026-05-26', kind: 'survey', note: 'S6 우선순위·EWS 시계열 데이터 의향 질의 (회신 대기)' },
    ],
  },
];
