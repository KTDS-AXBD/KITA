export interface OntologyAttr {
  name: string;
  tooltip: string;
}

export interface OntologyEntity {
  label: string;
  labelKr: string;
  subtitle: string;
  colorHex: string;
  attrs: OntologyAttr[];
  count: number;
}

export interface OntologyRelation {
  name: string;
  tooltip: string;
  from: string;
  to: string;
  attrs: OntologyAttr[];
  source: string;
}

export interface OntologyConstraint {
  label: string;
  cypher: string;
}

export const ONTOLOGY_ENTITIES: OntologyEntity[] = [
  {
    label: 'Event',
    labelKr: '사건',
    subtitle: '외부 충격 이벤트',
    colorHex: '#E60012',
    attrs: [
      { name: 'name', tooltip: '충격 이벤트 명칭. 예: 호르무즈 해협 봉쇄, 중국 수출규제' },
      { name: 'type', tooltip: '충격 유형. geopolitical(지정학) / natural(재해) / economic(경제) / regulatory(규제)' },
      { name: 'date', tooltip: '이벤트 발생 시점. ISO 8601 형식' },
      { name: 'severity', tooltip: '충격 강도 1~4 단계. 1=경미, 4=심각' },
    ],
    count: 8,
  },
  {
    label: 'Region',
    labelKr: '지역',
    subtitle: '지리적 엔티티',
    colorHex: '#FF9F0A',
    attrs: [
      { name: 'name', tooltip: '지역 명칭. 예: 호르무즈 해협, 부산항, 말라카 해협' },
      { name: 'type', tooltip: '지역 유형. strait(해협) / port(항구) / route(수송경로) / region(광역)' },
      { name: 'strategic_value', tooltip: '공급망 전략 중요도. 0~1 정규화값. 높을수록 대체 불가' },
    ],
    count: 6,
  },
  {
    label: 'Country',
    labelKr: '국가',
    subtitle: '공급망 참여 국가',
    colorHex: '#4A90D9',
    attrs: [
      { name: 'iso2', tooltip: 'ISO 3166-1 Alpha-2 국가코드. 예: KR, CN, JP' },
      { name: 'name', tooltip: '국가 명칭 (한국어)' },
      { name: 'region', tooltip: '지역 분류. Asia / MiddleEast / Europe / Americas' },
    ],
    count: 24,
  },
  {
    label: 'RawMaterial',
    labelKr: '원자재',
    subtitle: '1차 원료·광물',
    colorHex: '#8B6914',
    attrs: [
      { name: 'name', tooltip: '원자재 명칭. 예: 원유, 초경합금, 특수강' },
      { name: 'hs_code', tooltip: 'HS 코드 6자리. 관세청 통계 연계 기준' },
      { name: 'domestic_ratio', tooltip: '국내 생산 비율 0~1. 낮을수록 수입의존도 높음' },
    ],
    count: 18,
  },
  {
    label: 'IntermediateGoods',
    labelKr: '중간재',
    subtitle: '가공·반제품',
    colorHex: '#7B68EE',
    attrs: [
      { name: 'name', tooltip: '중간재 명칭. 예: 나프타, 스핀들 베어링, 볼스크류 조립체' },
      { name: 'processing_stage', tooltip: '가공 단계. 1차/2차/3차 중간재 구분' },
      { name: 'input_coefficient', tooltip: '투입계수. 최종재 생산 1단위 당 이 중간재 필요량. 산업연관표 기반' },
    ],
    count: 32,
  },
  {
    label: 'Product',
    labelKr: '최종 품목',
    subtitle: '소부장 완제품',
    colorHex: '#2ECC71',
    attrs: [
      { name: 'name', tooltip: '품목 명칭. 예: CNC 머시닝센터, 감속기, 볼스크류' },
      { name: 'hs_code', tooltip: 'HS 코드. 수출입 통계 연계 기준' },
      { name: 'domestic_ratio', tooltip: '국산화율 0~1. 국내 생산량 / 국내 수요량' },
      { name: 'strategic_flag', tooltip: '국가 전략 품목 지정 여부. MOTIE 고시 기준' },
    ],
    count: 35,
  },
  {
    label: 'Industry',
    labelKr: '산업',
    subtitle: 'KSIC 기반 산업 분류',
    colorHex: '#E74C3C',
    attrs: [
      { name: 'ksic_code', tooltip: 'KSIC 산업분류코드 4자리. 예: 2819(기타 일반목적용 기계)' },
      { name: 'name', tooltip: '산업 명칭 (한국어)' },
      { name: 'employment', tooltip: '종사자 수 (명). 산업 규모 지표' },
    ],
    count: 12,
  },
  {
    label: 'Company',
    labelKr: '기업',
    subtitle: '공급망 참여 기업',
    colorHex: '#3498DB',
    attrs: [
      { name: 'corp_code', tooltip: 'DART 기업고유번호 8자리. 재무 데이터 연계 기준' },
      { name: 'name', tooltip: '기업 명칭 (한국어)' },
      { name: 'tier', tooltip: '공급망 계층. 1=완성품 / 2=1차 협력사 / 3=소재·부품사' },
      { name: 'rnd_ratio', tooltip: 'R&D 투자비율. R&D 지출 / 매출액. 0~1' },
    ],
    count: 48,
  },
  {
    label: 'EWS',
    labelKr: '조기경보',
    subtitle: '공급망 리스크 지수',
    colorHex: '#F39C12',
    attrs: [
      { name: 'index', tooltip: 'EWS 종합 지수. 무역집중도·가격변동·재고수준 복합 산출. 0~100' },
      { name: 'threshold', tooltip: '경보 발동 임계값. 기본 70 (GIVC 기준)' },
      { name: 'reference_date', tooltip: '지수 기준일. YYYY-MM 형식' },
    ],
    count: 7,
  },
  {
    label: 'Policy',
    labelKr: '정책',
    subtitle: '정부 정책·지원 제도',
    colorHex: '#34495E',
    attrs: [
      { name: 'title', tooltip: '정책명. 예: 소부장 R&D 특별지원, 공급망 안정화 비축물자 지정' },
      { name: 'ministry', tooltip: '주관 부처. MOTIE(산업부) / MSIT(과기부) / MOF(기재부)' },
      { name: 'budget_bn', tooltip: '예산 규모 (억원). 정책 규모 지표' },
    ],
    count: 9,
  },
  {
    label: 'RnD',
    labelKr: '연구개발',
    subtitle: 'R&D 과제·특허',
    colorHex: '#9B59B6',
    attrs: [
      { name: 'project_id', tooltip: 'NTIS 과제번호. R&D 과제 고유식별자' },
      { name: 'title', tooltip: '과제명 (한국어)' },
      { name: 'gov_support_ratio', tooltip: '정부지원비율 0~1. 정부출연금 / 총 연구비' },
      { name: 'patent_count', tooltip: '등록 특허 수. KIPRIS 연계' },
    ],
    count: 21,
  },
  {
    label: 'Supply',
    labelKr: '공급망',
    subtitle: '가치사슬 연결 경로',
    colorHex: '#1ABC9C',
    attrs: [
      { name: 'chain_id', tooltip: '공급망 경로 식별자. 소재→부품→장비 다단계 경로 고유 ID' },
      { name: 'depth', tooltip: '가치사슬 깊이. 몇 단계 변환을 거치는지 (1~5)' },
      { name: 'bottleneck_flag', tooltip: '병목 여부. 단일 국가·기업 의존도 80%+ 경로' },
    ],
    count: 15,
  },
  {
    label: 'Risk',
    labelKr: '리스크',
    subtitle: '공급망 취약성 지표',
    colorHex: '#C0392B',
    attrs: [
      { name: 'risk_type', tooltip: '리스크 유형. concentration(집중) / disruption(단절) / price(가격) / lead_time(납기)' },
      { name: 'score', tooltip: '리스크 점수 0~100. 높을수록 취약' },
      { name: 'mitigation', tooltip: '대응 방안 코드. GIVC 정책 매핑 기준' },
    ],
    count: 11,
  },
];

export const ONTOLOGY_RELATIONS: OntologyRelation[] = [
  {
    name: 'DISRUPTS',
    tooltip: '외부 충격 이벤트가 특정 지역의 정상 기능을 방해하는 관계. 충격 강도(severity)가 전파 계수 역할.',
    from: 'Event',
    to: 'Region',
    attrs: [{ name: 'severity', tooltip: '이벤트가 해당 지역에 미치는 충격 강도. 1~4 단계' }],
    source: '시나리오 정의',
  },
  {
    name: 'CONTROLS_ROUTE',
    tooltip: '지역(해협·항구)이 특정 국가의 수출 경로를 통제. 경로 차단 시 영향 국가를 역방향 탐색.',
    from: 'Region',
    to: 'Country',
    attrs: [{ name: 'passage_share', tooltip: '해당 국가 수출 중 이 경로를 통과하는 비중 %' }],
    source: '한국석유공사',
  },
  {
    name: 'EXPORTS',
    tooltip: '국가가 원자재를 수출하는 관계. share 속성으로 한국 수입에서 해당국 비중 표현.',
    from: 'Country',
    to: 'RawMaterial',
    attrs: [
      { name: 'volume', tooltip: '연간 수출 물량 (배럴/톤)' },
      { name: 'share', tooltip: '한국 수입 중 해당국 비중 % ' },
    ],
    source: 'UNIPASS',
  },
  {
    name: 'REFINES_TO',
    tooltip: '원자재를 가공하여 중간재를 생산하는 관계. 정유·분해 공정에서의 수율(yield_ratio) 포함.',
    from: 'RawMaterial',
    to: 'IntermediateGoods',
    attrs: [{ name: 'yield_ratio', tooltip: '정유·가공 수율. 원자재에서 중간재 생산 비율 %' }],
    source: '산업연관표',
  },
  {
    name: 'INPUT_TO',
    tooltip: '중간재가 최종 품목 생산에 투입되는 핵심 관계. 투입계수 누적 곱으로 영향도 산출.',
    from: 'IntermediateGoods',
    to: 'Product',
    attrs: [{ name: 'input_coefficient', tooltip: '투입계수. 중간재가 최종재 생산에 투입되는 비중 %. Knowledge Graph 핵심 가중치' }],
    source: '산업연관표',
  },
  {
    name: 'PRODUCES',
    tooltip: '기업이 최종 품목을 생산하는 관계. capacity로 해당 기업의 생산 능력 표현.',
    from: 'Company',
    to: 'Product',
    attrs: [
      { name: 'capacity', tooltip: '연간 생산 능력 (단위: 대/톤)' },
      { name: 'market_share', tooltip: '국내 시장점유율 %' },
    ],
    source: 'GIVC',
  },
  {
    name: 'BELONGS_TO',
    tooltip: '품목이 특정 산업에 분류되는 관계. KSIC 기반 산업 분류 체계.',
    from: 'Product',
    to: 'Industry',
    attrs: [{ name: 'ksic_code', tooltip: '산업분류코드. 품목이 속하는 KSIC 코드 4자리' }],
    source: '통계청',
  },
  {
    name: 'TRIGGERS_POLICY',
    tooltip: 'EWS 지수가 임계값 초과 시 연계 정책 조치를 자동 식별하는 관계.',
    from: 'EWS',
    to: 'Policy',
    attrs: [{ name: 'activation_threshold', tooltip: '정책 발동 EWS 임계값. 기본 70' }],
    source: 'MOTIE',
  },
];

export const ONTOLOGY_CONSTRAINTS: OntologyConstraint[] = [
  {
    label: '노드 유일성 제약',
    cypher: `// 엔티티별 고유 식별자 유일성 보장
CREATE CONSTRAINT company_corp_code IF NOT EXISTS
  FOR (c:Company) REQUIRE c.corp_code IS UNIQUE;

CREATE CONSTRAINT product_hs_code IF NOT EXISTS
  FOR (p:Product) REQUIRE p.hs_code IS UNIQUE;

CREATE CONSTRAINT country_iso2 IF NOT EXISTS
  FOR (co:Country) REQUIRE co.iso2 IS UNIQUE;`,
  },
  {
    label: '필수 속성 제약 (NOT NULL)',
    cypher: `// 핵심 속성 누락 방지
CREATE CONSTRAINT event_name_exists IF NOT EXISTS
  FOR (e:Event) REQUIRE e.name IS NOT NULL;

CREATE CONSTRAINT company_name_exists IF NOT EXISTS
  FOR (c:Company) REQUIRE c.name IS NOT NULL;

CREATE CONSTRAINT product_domestic_ratio IF NOT EXISTS
  FOR (p:Product) REQUIRE p.domestic_ratio IS NOT NULL;`,
  },
  {
    label: '값 범위 제약',
    cypher: `// severity 1~4, domestic_ratio 0~1
// Neo4j 5.x+ property existence constraint
CREATE CONSTRAINT event_severity_range IF NOT EXISTS
  FOR (e:Event) REQUIRE
    e.severity >= 1 AND e.severity <= 4;

CREATE CONSTRAINT product_ratio_range IF NOT EXISTS
  FOR (p:Product) REQUIRE
    p.domestic_ratio >= 0.0 AND p.domestic_ratio <= 1.0;`,
  },
];
