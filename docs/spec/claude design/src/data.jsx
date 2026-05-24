// ============================================================
// Mock data fixtures — S4 R&D + S6 Toluene + shared lookups
// 그럴듯한 한국 화학·반도체·소재 가상 기업명 (시연용)
// ============================================================

// -------- 분야 선택 옵션 --------
const DOMAINS = [
  { id: 'semi-mat', label: '반도체 소재', sub: 'C26211 (포토레지스트·세정액·CMP 슬러리 등)' },
  { id: 'auto-parts', label: '자동차 부품', sub: 'C30 (배터리·전장·서스펜션 등)' },
  { id: 'machine-metal', label: '기계금속', sub: 'C28·C25' },
  { id: 'fine-chem', label: '정밀화학', sub: 'C20299' },
  { id: 'display', label: '디스플레이 소재', sub: 'C2725·OLED 발광소재' },
  { id: 'battery', label: '이차전지 소재', sub: 'C28202 (양극재·음극재·전해질)' }
];

// -------- 프리셋 시나리오 --------
const PRESETS = [
  { id: 'p1', label: '사례 1', title: 'EUV 포토레지스트 국산화', domain: 'semi-mat', budget: 5, period: 12, weights: { rnd: 0.40, sales: 0.20, patent: 0.30, risk: 0.10 } },
  { id: 'p2', label: '사례 2', title: '전고체 배터리 핵심소재', domain: 'battery',  budget: 8, period: 18, weights: { rnd: 0.35, sales: 0.15, patent: 0.35, risk: 0.15 } },
  { id: 'p3', label: '사례 3', title: '차세대 OLED 청색 도펀트', domain: 'display',  budget: 4, period: 12, weights: { rnd: 0.30, sales: 0.30, patent: 0.25, risk: 0.15 } }
];

// -------- S4 후보 기업 풀 (가상이지만 한국 화학·소재 톤) --------
//   rndGrowth: R&D 투자 증가율
//   salesGrowth: 매출 성장률
//   patentCount: 관련 특허 수
//   defaultRisk: 부도율
//   coreType: 1(핵심) / 2(예비) — GIVC core_typ
//   evidenceKeys: 지식 그래프 인접 노드
const S4_CANDIDATE_POOL = [
  { id: 'C001', name: '청원실리콘', biz: '실리콘 웨이퍼 후공정', region: '경기 평택',
    rndGrowth: 0.24, salesGrowth: 0.18, patentCount: 47, defaultRisk: 0.018, coreType: 1,
    sources: { rndGrowth: 'real', salesGrowth: 'real', patentCount: 'virt', defaultRisk: 'real' },
    evidenceKeys: ['rnd_invest', 'sales_growth', 'patents', 'low_risk'],
    note: '최근 3년 R&D 투자 증가율 상위 10%, 부도율 안정' },
  { id: 'C002', name: '한진머티리얼', biz: '포토레지스트·세정액', region: '충북 청주',
    rndGrowth: 0.19, salesGrowth: 0.11, patentCount: 38, defaultRisk: 0.022, coreType: 1,
    sources: { rndGrowth: 'real', salesGrowth: 'real', patentCount: 'virt', defaultRisk: 'real' },
    evidenceKeys: ['rnd_invest', 'patents', 'low_risk'],
    note: '특허 보유 다수, 매출 성장세 견조' },
  { id: 'C003', name: 'KS화인케미컬', biz: '전자급 고순도 화학소재', region: '울산',
    rndGrowth: 0.31, salesGrowth: 0.09, patentCount: 52, defaultRisk: 0.014, coreType: 1,
    sources: { rndGrowth: 'real', salesGrowth: 'real', patentCount: 'virt', defaultRisk: 'real' },
    evidenceKeys: ['rnd_invest', 'patents', 'low_risk'],
    note: 'R&D 투자 매우 적극적, 특허 출원 가속' },
  { id: 'C004', name: '동성정밀화학', biz: '전구체·박막 소재', region: '경북 구미',
    rndGrowth: 0.15, salesGrowth: 0.22, patentCount: 21, defaultRisk: 0.031, coreType: 2,
    sources: { rndGrowth: 'real', salesGrowth: 'real', patentCount: 'virt', defaultRisk: 'real' },
    evidenceKeys: ['sales_growth', 'patents'],
    note: '예비군. 매출 성장률 높음' },
  { id: 'C005', name: '서원나노텍', biz: 'CMP 슬러리·연마 입자', region: '대전',
    rndGrowth: 0.21, salesGrowth: 0.16, patentCount: 33, defaultRisk: 0.025, coreType: 1,
    sources: { rndGrowth: 'real', salesGrowth: 'real', patentCount: 'virt', defaultRisk: 'real' },
    evidenceKeys: ['rnd_invest', 'sales_growth', 'patents'],
    note: '나노 입자 합성 노하우 보유' },
  { id: 'C006', name: '미래코어소재', biz: '실리콘 카바이드 파우더', region: '충남 천안',
    rndGrowth: 0.27, salesGrowth: 0.13, patentCount: 28, defaultRisk: 0.020, coreType: 2,
    sources: { rndGrowth: 'real', salesGrowth: 'real', patentCount: 'virt', defaultRisk: 'real' },
    evidenceKeys: ['rnd_invest', 'patents'],
    note: 'SiC 신소재, R&D 비중 높음' },
  { id: 'C007', name: '대성특수가스', biz: '특수가스·고순도가스', region: '경기 안성',
    rndGrowth: 0.08, salesGrowth: 0.04, patentCount: 12, defaultRisk: 0.045, coreType: 2,
    sources: { rndGrowth: 'real', salesGrowth: 'real', patentCount: 'virt', defaultRisk: 'real' },
    evidenceKeys: ['low_risk'],
    note: 'R&D 부진, 매출 정체' },
  { id: 'C008', name: '광주첨단소재', biz: '디스플레이 봉지재', region: '광주',
    rndGrowth: 0.18, salesGrowth: 0.07, patentCount: 19, defaultRisk: 0.038, coreType: 2,
    sources: { rndGrowth: 'real', salesGrowth: 'real', patentCount: 'virt', defaultRisk: 'real' },
    evidenceKeys: ['patents'],
    note: '특허는 있으나 매출 성장 둔화' }
];

// 반대 추천 (제외 사유)
const S4_COUNTER = [
  { id: 'X001', name: '○○석유화학(대기업)', reason: '신청 자격 미달 — 중소·중견기업 대상 공고', tag: '자격', source: 'real' },
  { id: 'X002', name: '대성특수가스', reason: '최근 12개월 부도율 4.5%로 평균 대비 2.1배. R&D 투자 정체', tag: '리스크', source: 'real' },
  { id: 'X003', name: '○○텍(미상장)', reason: '재무공시 자료 부족 — 평가 불가', tag: '데이터 부족', source: 'est' }
];

// 유사 과거 R&D 사례 (가상)
const S4_SIMILAR_CASES = [
  { id: 'H1', year: 2023, title: 'EUV 포토레지스트 핵심소재 국산화', funder: '산업기술평가관리원', amount: '4.8억', outcome: '특허 12건 / 양산 진입', match: 0.86 },
  { id: 'H2', year: 2022, title: '반도체 세정용 고순도 케미컬 공정', funder: '한국산업기술진흥원', amount: '3.2억', outcome: '소부장 강소기업 지정', match: 0.78 },
  { id: 'H3', year: 2024, title: '전자급 실리콘 정제 공정 개선', funder: '산업기술평가관리원', amount: '5.5억', outcome: '진행 중 (Phase 2)', match: 0.71 }
];

// -------- S4 지식 그래프 --------
// SVG 좌표는 정적 (재현성 우수). type → 색상.
// 중심에 R&D 공고 노드, 5개 후보 기업이 둘러싸고, 각 기업이 지표 노드로 연결.
const S4_GRAPH = {
  nodes: [
    { id: 'rnd_call', type: 'rnd', label: '산기평 R&D 공고', x: 360, y: 230, r: 26,
      meta: { 분야: '반도체 소재', 예산: '5억', 출처: '시연용 가상' }, source: 'virt' },
    // companies 5
    { id: 'C001', type: 'company', label: '청원실리콘', x: 180, y: 110, r: 22,
      meta: { coreType: '핵심(1)', biz: '실리콘 웨이퍼 후공정', source: 'GIVC enp0111y' }, source: 'real' },
    { id: 'C002', type: 'company', label: '한진머티리얼', x: 540, y: 110, r: 22,
      meta: { coreType: '핵심(1)', biz: '포토레지스트', source: 'GIVC enp0111y' }, source: 'real' },
    { id: 'C003', type: 'company', label: 'KS화인케미컬', x: 600, y: 270, r: 22,
      meta: { coreType: '핵심(1)', biz: '고순도 화학소재', source: 'GIVC enp0111y' }, source: 'real' },
    { id: 'C005', type: 'company', label: '서원나노텍', x: 480, y: 400, r: 22,
      meta: { coreType: '핵심(1)', biz: 'CMP 슬러리', source: 'GIVC enp0111y' }, source: 'real' },
    { id: 'C006', type: 'company', label: '미래코어소재', x: 140, y: 360, r: 22,
      meta: { coreType: '예비(2)', biz: 'SiC 파우더', source: 'GIVC enp0111y' }, source: 'real' },
    // metrics
    { id: 'rnd_invest', type: 'metric', label: 'R&D 투자 증가율', x: 80, y: 230, r: 18,
      meta: { table: 'scmm_his_chart', column: 'itmrnd0001010', source: 'GIVC 실데이터' }, source: 'real' },
    { id: 'sales_growth', type: 'metric', label: '매출 성장률', x: 360, y: 50, r: 18,
      meta: { table: 'enp0111y', column: 'salesGrowth', source: 'GIVC 실데이터' }, source: 'real' },
    { id: 'patents', type: 'metric', label: '특허 출원수', x: 700, y: 200, r: 18,
      meta: { source: '시연용 가상값 (특허청 API 연동 시 실데이터 가능)' }, source: 'virt' },
    { id: 'low_risk', type: 'metric', label: '부도율 (안정)', x: 360, y: 470, r: 18,
      meta: { table: 'scmm_his_chart', column: 'itm_flt_implpd', source: 'GIVC 실데이터' }, source: 'real' }
  ],
  edges: [
    // 공고 → 5 기업
    ['rnd_call', 'C001'], ['rnd_call', 'C002'], ['rnd_call', 'C003'], ['rnd_call', 'C005'], ['rnd_call', 'C006'],
    // 기업 → 지표 (evidence)
    ['C001', 'rnd_invest'], ['C001', 'sales_growth'], ['C001', 'patents'], ['C001', 'low_risk'],
    ['C002', 'rnd_invest'], ['C002', 'patents'], ['C002', 'low_risk'],
    ['C003', 'rnd_invest'], ['C003', 'patents'], ['C003', 'low_risk'],
    ['C005', 'rnd_invest'], ['C005', 'sales_growth'], ['C005', 'patents'],
    ['C006', 'rnd_invest'], ['C006', 'patents']
  ],
  viewBox: '0 0 780 520'
};

// -------- S6 톨루엔 --------
const S6_PRODUCT = {
  name: '톨루엔 (Toluene)',
  hsCode: 'HS 290230',
  cas: 'CAS 108-88-3',
  category: '방향족 탄화수소 / BTX',
  description: '벤젠 핵에 메틸기가 하나 결합한 방향족 화합물. 용제·옥탄가 향상제·TDI·TNT 등 다양한 화학공정 중간체',
};

// 분기별 무역 통계 (2022Q1 ~ 2025Q4 = 16분기) — 단위 천톤
const S6_TRADE = {
  quarters: ['22Q1','22Q2','22Q3','22Q4','23Q1','23Q2','23Q3','23Q4','24Q1','24Q2','24Q3','24Q4','25Q1','25Q2','25Q3','25Q4'],
  exports: [180, 195, 188, 175, 210, 205, 198, 215, 232, 245, 251, 248, 262, 258, 244, 268],
  imports: [62, 58, 65, 71, 68, 72, 75, 88, 102, 95, 110, 118, 125, 132, 145, 158],
  anomalies: [
    { idx: 7, label: '23Q4 — 수입 급증 (+17%)' },
    { idx: 14, label: '25Q3 — 수출 일시 감소 (-5%)' }
  ]
};

// 핵심·예비 기업
const S6_COMPANIES = [
  { id: 'T001', name: '○○석유화학', biz: 'BTX 생산·정제', share: '23%', sales: '1.8조',  coreType: 1, role: '원료 공급' },
  { id: 'T002', name: '△△에너지', biz: 'NCC·아로마틱', share: '18%', sales: '2.1조',     coreType: 1, role: '원료 공급' },
  { id: 'T003', name: 'KS케미칼', biz: 'TDI 중간체', share: '14%', sales: '8200억',      coreType: 1, role: '후방 수요' },
  { id: 'T004', name: '청해머티리얼', biz: '용제 가공', share: '7%', sales: '3400억',    coreType: 2, role: '용제 가공' },
  { id: 'T005', name: '○○폴리머', biz: 'TNT·중간체', share: '5%', sales: '2800억',      coreType: 2, role: '후방 수요' }
];

// -------- S6 지식그래프 (톨루엔 중심) --------
const S6_GRAPH = {
  nodes: [
    { id: 'TOL', type: 'rnd', label: '톨루엔', x: 360, y: 240, r: 32,
      meta: { 'HS Code': '290230', 'CAS': '108-88-3', source: 'GIVC mart.lnk0951a' }, source: 'real' },
    // HS code & related
    { id: 'HS290230', type: 'hscode', label: 'HS 290230', x: 360, y: 90, r: 20,
      meta: { table: 'mart.lnk0951a', desc: '톨루엔 HS코드', source: 'GIVC' }, source: 'real' },
    // 수입국 (country)
    { id: 'JP', type: 'country', label: '일본', x: 130, y: 130, r: 18,
      meta: { 비중: '38%', 추이: '안정', source: 'GIVC 무역통계' }, source: 'real' },
    { id: 'CN', type: 'country', label: '중국', x: 80, y: 240, r: 18,
      meta: { 비중: '27%', 추이: '증가', source: 'GIVC 무역통계' }, source: 'real' },
    { id: 'US', type: 'country', label: '미국', x: 130, y: 360, r: 18,
      meta: { 비중: '14%', 추이: '소폭 증가', source: 'GIVC 무역통계' }, source: 'real' },
    // 핵심 기업 (company)
    { id: 'T001', type: 'company', label: '○○석유화학', x: 580, y: 130, r: 20,
      meta: { coreType: '핵심(1)', role: '원료 공급', source: 'GIVC enp0111y' }, source: 'real' },
    { id: 'T002', type: 'company', label: '△△에너지', x: 660, y: 240, r: 20,
      meta: { coreType: '핵심(1)', role: '원료 공급', source: 'GIVC enp0111y' }, source: 'real' },
    { id: 'T003', type: 'company', label: 'KS케미칼', x: 580, y: 360, r: 20,
      meta: { coreType: '핵심(1)', role: '후방 수요', source: 'GIVC enp0111y' }, source: 'real' },
    // 전후방 (forward/backward) — 가상
    { id: 'PROD_TDI', type: 'metric', label: 'TDI', x: 460, y: 430, r: 16,
      meta: { 단계: '후방 1단계', source: '시연용 가상 — 전후방 매핑 추가 시 확장' }, source: 'virt' },
    { id: 'PROD_SOLVENT', type: 'metric', label: '용제·도료', x: 260, y: 430, r: 16,
      meta: { 단계: '후방 1단계', source: '시연용 가상' }, source: 'virt' },
    { id: 'RAW_NCC', type: 'metric', label: 'NCC 부산물', x: 360, y: 380, r: 16,
      meta: { 단계: '전방 1단계', source: '시연용 가상' }, source: 'virt' }
  ],
  edges: [
    ['TOL', 'HS290230'],
    ['TOL', 'JP'], ['TOL', 'CN'], ['TOL', 'US'],
    ['TOL', 'T001'], ['TOL', 'T002'], ['TOL', 'T003'],
    ['TOL', 'PROD_TDI'], ['TOL', 'PROD_SOLVENT'], ['TOL', 'RAW_NCC'],
    ['T003', 'PROD_TDI'], ['T001', 'RAW_NCC'], ['T002', 'PROD_SOLVENT']
  ],
  viewBox: '0 0 760 520'
};

// 뉴스 워드클라우드 (가상)
const S6_WORDS = [
  { w: '수입 증가', s: 36, t: 'neg' }, { w: '중국 의존', s: 32, t: 'neg' },
  { w: '국산화', s: 30, t: 'pos' },    { w: 'TDI 단가', s: 26, t: 'neg' },
  { w: 'NCC 공정', s: 22, t: '' },     { w: '재고 안정', s: 22, t: 'pos' },
  { w: '환율 영향', s: 20, t: '' },    { w: '안전기준', s: 18, t: '' },
  { w: '도료 시장', s: 18, t: '' },    { w: '벤젠 대체', s: 16, t: 'pos' },
  { w: '항만 적체', s: 16, t: 'neg' }, { w: 'BTX 가격', s: 14, t: '' },
  { w: '아로마틱', s: 14, t: 'dim' },  { w: '석유화학', s: 14, t: 'dim' },
  { w: '용제 회수', s: 12, t: 'dim' }, { w: '운임 상승', s: 12, t: 'neg' }
];

// -------- Data Expansion Hints (데이터 확장 항목) --------
// 각 카드는 active=true 시 결과에 가상 boost를 적용
const HINTS_S4 = [
  { id: 'h_rndcall', title: '산기평 공고 실데이터', delta: '65% → 88%',
    detail: '매칭 정확도 향상 — 공고 텍스트 임베딩으로 R&D 적합성 의미 매칭이 가능해집니다.',
    boost: { matchAccuracy: 0.23 } },
  { id: 'h_patent', title: '특허 출원 트렌드', delta: '±15%p',
    detail: '특허청 API 연동 시 신뢰도 가중치 ±15%p 조정. 가상값 → 실값 전환.',
    boost: { weightAdjust: 0.15 } },
  { id: 'h_movement', title: '인력 이동 데이터', delta: '+신호',
    detail: '핵심 연구인력 이동·재직 데이터로 기업 R&D 지속성 신호 추가.',
    boost: { signalAdd: 1 } },
  { id: 'h_finance', title: 'KIS 재무 심층', delta: '+리스크 정밀도',
    detail: 'NICE·KIS 재무 데이터 결합 시 부도율 예측 정밀도 +12%p.',
    boost: { riskPrecision: 0.12 } }
];

const HINTS_S6 = [
  { id: 'h_supply', title: '전후방 매핑', delta: '후방 영향 분석 활성화',
    detail: '전후방 데이터셋 결합 시 톨루엔→TDI→자동차 시트까지 N단계 영향 자동 분석.',
    boost: {} },
  { id: 'h_breakdown', title: '품목 세분화 데이터', delta: '나프타 ↔ 톨루엔 구분',
    detail: '품목 코드 의미 통일 — "나프타", "경질 라프타", "톨루엔"의 의미 단위 매핑.',
    boost: {} },
  { id: 'h_news', title: '실시간 뉴스 매칭', delta: '품목 단위 위험 알림',
    detail: '산업 단위 → 품목 단위로 뉴스 매칭이 내려오면 위험 시그널이 한 단계 깊어집니다.',
    boost: {} }
];

// -------- What-If 예시 응답 (LLM가짜 응답) --------
const WHATIF_PROMPTS = [
  { q: '예산이 10억으로 늘면 추천이 어떻게 바뀌나요?',
    a: '예산을 10억으로 확대 시, 후보군이 8개로 확장되며 신규로 **광주첨단소재(C008)** 와 **동성정밀화학(C004)** 이 Top 7~8에 진입합니다. 다만 부도율 평균이 0.022 → 0.028로 소폭 상승하므로, 리스크 가중치를 0.10 → 0.15로 함께 조정하는 것을 권장합니다.' },
  { q: 'EUV 포토레지스트만 보고 싶은데?',
    a: '`biz LIKE \'%포토레지스트%\'` 필터 적용 시 **한진머티리얼(C002)** 이 단일 후보로 부각됩니다. 비교 가능 후보가 1개로 줄어들기 때문에, 인접 분야(전자급 케미컬)까지 검색 범위 확장을 권장합니다.' },
  { q: '왜 청원실리콘이 1위인가요?',
    a: '청원실리콘은 4개 지표 모두에서 가중평균 상위 — R&D 투자 증가율 24% (상위 12%), 매출 성장 18% (상위 15%), 특허 47건 (가상값), 부도율 1.8% (안정). 특히 R&D·매출·부도 3개 실데이터가 모두 우수 구간에 있어 가중치 변경에도 안정적으로 1~2위를 유지합니다.' }
];

Object.assign(window, {
  KitaData: {
    DOMAINS, PRESETS,
    S4_CANDIDATE_POOL, S4_COUNTER, S4_SIMILAR_CASES, S4_GRAPH,
    S6_PRODUCT, S6_TRADE, S6_COMPANIES, S6_GRAPH, S6_WORDS,
    HINTS_S4, HINTS_S6, WHATIF_PROMPTS
  }
});
