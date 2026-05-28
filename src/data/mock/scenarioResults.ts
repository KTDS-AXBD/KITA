// F035 시나리오 분석 페이지용 Mock 데이터
import type { CytoSource } from '@/types';

export interface ScenarioResult {
  rank: number;
  item: string;
  impact: string;
  path: string[];
  source: CytoSource;
}

// CQ-002 소부장 Top5 기업
export const SOBUJIANG_TOP5: ScenarioResult[] = [
  { rank: 1, item: '정밀감속기 국산화', impact: '공급망 의존도 85%→50% 감소 · 로봇 산업 연쇄 효과', path: ['s_rnd', 's_reducer', 's_co_daehan'], source: 'est' },
  { rank: 2, item: '서보모터 자립화', impact: '로봇·공작기계 동시 영향 · R&D 30% 최고', path: ['s_rnd', 's_servo', 's_co_hanil'], source: 'est' },
  { rank: 3, item: '정밀베어링 확대', impact: '공작기계·반도체장비 이중 수혜 품목', path: ['s_rnd', 's_bearing', 's_co_seowon'], source: 'est' },
  { rank: 4, item: '볼스크류 대체', impact: '일본 의존도 75% → 40% 목표 · 대만 대안 존재', path: ['s_rnd', 's_ballscrew'], source: 'est' },
  { rank: 5, item: 'CNC 제어기 개발', impact: '스마트 공장 확산 핵심 · FANUC 의존 해소', path: ['s_rnd', 's_cnc', 's_co_hwacheon'], source: 'est' },
];

// CQ-002 기업 후보 (A 섹션 테이블)
// score는 0~1 정규화 가중합 (R&D·매출·특허·리스크 4축). UI 표시 시 ×100.
export interface CompanyCandidate {
  rank: number;
  name: string;
  sub: string;
  type: '핵심' | '예비';
  rnd: string;
  sales: string;
  patent: string;
  risk: string;
  score: number;
  /**
   * F041 출처 메타. 회사명·지표는 가상 SME(소부장 시연용) + 합리적 추론값이라 'est'.
   * 본사업화 시 GIVC enp0111y 실 기업으로 교체되면 'real'.
   */
  source: CytoSource;
  /** 데이터 출처 라벨(SourceBadge에 표시). 예: 'GIVC enp0111y / NTIS / KIPRIS 합성'. */
  sourceLabel: string;
}

const CQ2_SOURCE_LABEL = 'GIVC enp0111y / NTIS / KIPRIS 합성';

export const CQ2_TOP5_COMPANIES: CompanyCandidate[] = [
  { rank: 1, name: '대한정밀감속기', sub: '하모닉 드라이브 · 정밀 감속기 · 경남 창원', type: '핵심', rnd: '26.0%', sales: '19.0%', patent: '44건', risk: '1.7%', score: 0.69, source: 'est', sourceLabel: CQ2_SOURCE_LABEL },
  { rank: 2, name: '한일서보모션', sub: '서보모터 · 모션 컨트롤러 · 경기 안산', type: '핵심', rnd: '30.0%', sales: '16.0%', patent: '49건', risk: '1.5%', score: 0.67, source: 'est', sourceLabel: CQ2_SOURCE_LABEL },
  { rank: 3, name: '미래기계소재', sub: '메어링칭 · 공구홀더 · 충남 천안', type: '예비', rnd: '25.0%', sales: '12.0%', patent: '26건', risk: '2.2%', score: 0.52, source: 'est', sourceLabel: CQ2_SOURCE_LABEL },
  { rank: 4, name: '대전유압', sub: '고압 유압밸브 · 실린더 · 대전', type: '핵심', rnd: '20.0%', sales: '13.0%', patent: '31건', risk: '2.4%', score: 0.52, source: 'est', sourceLabel: CQ2_SOURCE_LABEL },
  { rank: 5, name: '서원베어링테크', sub: '정밀 볼 · 롤러 베어링 · 경북 경주', type: '핵심', rnd: '18.0%', sales: '12.0%', patent: '36건', risk: '2.1%', score: 0.51, source: 'est', sourceLabel: CQ2_SOURCE_LABEL },
];

// CQ-002 의존 구조 (공작기계 핵심 부품 수입 의존도)
// pct는 관세청 UNIPASS 기반 실측, 소수점 평균 (출처: '관세청 UNIPASS').
export interface DependencyItem {
  name: string;
  pct: number;
  country: string;
  bg: string;
  source: CytoSource;
  sourceLabel: string;
}

const DEP_SOURCE_LABEL = '관세청 UNIPASS 수입통계';

export const DEPENDENCY_ITEMS: DependencyItem[] = [
  { name: '정밀감속기', pct: 85, country: '일본', bg: '#111', source: 'real', sourceLabel: DEP_SOURCE_LABEL },
  { name: '볼스크류', pct: 75, country: '일본', bg: '#333', source: 'real', sourceLabel: DEP_SOURCE_LABEL },
  { name: '서보모터', pct: 72, country: '일본', bg: '#555', source: 'real', sourceLabel: DEP_SOURCE_LABEL },
  { name: '리니어가이드', pct: 71, country: '일본', bg: '#777', source: 'real', sourceLabel: DEP_SOURCE_LABEL },
  { name: '정밀베어링', pct: 68, country: '일본', bg: '#999', source: 'real', sourceLabel: DEP_SOURCE_LABEL },
];

// CQ-002 유사 과거 R&D 사례 (실 NTIS 과제 사례 기반).
export interface RnDCase {
  year: string;
  title: string;
  org: string;
  matchRate: number;
  source: CytoSource;
  sourceLabel: string;
}

const RND_SOURCE_LABEL = 'NTIS R&D 과제 DB';

export const RND_CASES: RnDCase[] = [
  { year: '2023', title: '로봇용 정밀 감속기(하모닉 드라이브) 국산화', org: '산업기술평가관리원 · 5.2억 · 특허 14건 / 일반 전환', matchRate: 87, source: 'real', sourceLabel: RND_SOURCE_LABEL },
  { year: '2022', title: '고하중 정밀 베어링 수입대체 공정', org: '한국산업기술진흥원 · 3.8억 · 소부장 강소기업 지정', matchRate: 79, source: 'real', sourceLabel: RND_SOURCE_LABEL },
  { year: '2024', title: '서보모터·모션제어 자립화', org: '산업기술평가관리원 · 5.8억 · 진행 중 (Phase 2)', matchRate: 72, source: 'real', sourceLabel: RND_SOURCE_LABEL },
];

// CQ-001 호르무즈 영향 품목 Top5
// score는 투입계수(산업연관표) × 수입의존도 × 경로깊이 가중치의 추론값.
// 0~100 스케일(이미 정규화돼 ComparePage와 표시 단위 호환). 수치는 'est'.
export interface ImpactItem {
  rank: number;
  name: string;
  hs: string;
  industry: string;
  score: number;
  scoreColor: string;
  duration: string;
  path: string;
  evidence: string;
  source: CytoSource;
  sourceLabel: string;
}

const CQ1_SOURCE_LABEL = '한국은행 ECOS 산업연관표 / 관세청 UNIPASS 합성';

export const CQ1_TOP5_ITEMS: ImpactItem[] = [
  { rank: 1, name: 'PE (폴리에틸렌)', hs: '3901', industry: '석유화학', score: 94.2, scoreColor: '#111', duration: '즉시~1주', path: '원유→나프타(72.3%)→에틸렌(45.2%)→PE(35.2%)', evidence: '투입계수 누적 11.4%, 중동 의존도 63.7%', source: 'est', sourceLabel: CQ1_SOURCE_LABEL },
  { rank: 2, name: 'PP (폴리프로필렌)', hs: '3902', industry: '석유화학', score: 87.6, scoreColor: '#111', duration: '즉시~1주', path: '원유→나프타→프로필렌(28.1%)→PP(42.1%)', evidence: '투입계수 누적 8.5%, 자동차 핵심소재', source: 'est', sourceLabel: CQ1_SOURCE_LABEL },
  { rank: 3, name: '합성고무', hs: '4002', industry: '자동차', score: 72.3, scoreColor: '#444', duration: '1~2주', path: '원유→나프타→프로필렌→합성고무(15.4%)', evidence: '타이어 산업 직접 영향, 대체재 제한', source: 'est', sourceLabel: CQ1_SOURCE_LABEL },
  { rank: 4, name: 'EG (에틸렌글리콜)', hs: '2905.31', industry: '섬유', score: 65.8, scoreColor: '#444', duration: '1~3주', path: '원유→나프타→에틸렌→EG(12.8%)', evidence: '폴리에스터 원료, 중국 수입 대안 존재', source: 'est', sourceLabel: CQ1_SOURCE_LABEL },
  { rank: 5, name: 'SM (스티렌모노머)', hs: '2902.50', industry: '건설', score: 58.4, scoreColor: '#777', duration: '2~4주', path: '원유→나프타→에틸렌→SM(8.5%)', evidence: 'PS/ABS 원료, 건설/포장재 영향', source: 'est', sourceLabel: CQ1_SOURCE_LABEL },
];

// F041 CQ2 Top3 SSOT 파생 헬퍼 (ComparePage 등 외부 카드에서 재사용).
// score×100 정규화 + 매칭 회사명·점수가 SSOT와 자동 일치.
export interface CompareTop3Item {
  rank: number;
  name: string;
  pct: number; // score × 100, 0~100
  rndPct: string;
  patentCount: string;
  source: CytoSource;
  sourceLabel: string;
}

export const COMPARE_TOP3_FROM_CQ2: CompareTop3Item[] = CQ2_TOP5_COMPANIES.slice(0, 3).map((c) => ({
  rank: c.rank,
  name: c.name,
  pct: Math.round(c.score * 1000) / 10, // 0.69 -> 69.0
  rndPct: c.rnd,
  patentCount: c.patent,
  source: c.source,
  sourceLabel: c.sourceLabel,
}));

// CQ-001 미니 영향경로 그래프 노드/엣지
export const MINI_IMPACT_NODES = [
  { id: 'm_evt', label: '호르무즈\n긴장 고조', type: 'Event' as const, detail: '', source: 'real' as CytoSource, position: { x: 60, y: 140 } },
  { id: 'm_reg', label: '호르무즈\n해협', type: 'Region' as const, detail: '', source: 'real' as CytoSource, position: { x: 170, y: 140 } },
  { id: 'm_sau', label: '사우디\n28.1%', type: 'Country' as const, detail: '', source: 'real' as CytoSource, position: { x: 280, y: 80 } },
  { id: 'm_uae', label: 'UAE\n12.4%', type: 'Country' as const, detail: '', source: 'real' as CytoSource, position: { x: 280, y: 200 } },
  { id: 'm_oil', label: '원유', type: 'RawMaterial' as const, detail: '', source: 'real' as CytoSource, position: { x: 400, y: 140 } },
  { id: 'm_naph', label: '나프타', type: 'IntermediateGoods' as const, detail: '', source: 'real' as CytoSource, position: { x: 520, y: 140 } },
  { id: 'm_eth', label: '에틸렌', type: 'IntermediateGoods' as const, detail: '', source: 'real' as CytoSource, position: { x: 640, y: 80 } },
  { id: 'm_prop', label: '프로필렌', type: 'IntermediateGoods' as const, detail: '', source: 'real' as CytoSource, position: { x: 640, y: 200 } },
  { id: 'm_pe', label: 'PE', type: 'Product' as const, detail: '', source: 'real' as CytoSource, position: { x: 760, y: 40 } },
  { id: 'm_pp', label: 'PP', type: 'Product' as const, detail: '', source: 'real' as CytoSource, position: { x: 760, y: 120 } },
  { id: 'm_rub', label: '합성고무', type: 'Product' as const, detail: '', source: 'real' as CytoSource, position: { x: 760, y: 200 } },
  { id: 'm_eg', label: 'EG', type: 'Product' as const, detail: '', source: 'real' as CytoSource, position: { x: 760, y: 280 } },
  { id: 'm_ind1', label: '석유화학', type: 'Industry' as const, detail: '', source: 'real' as CytoSource, position: { x: 900, y: 80 } },
  { id: 'm_ind2', label: '자동차', type: 'Industry' as const, detail: '', source: 'real' as CytoSource, position: { x: 900, y: 200 } },
];

export const MINI_IMPACT_EDGES = [
  { id: 'me1', source: 'm_evt', target: 'm_reg', label: 'DISRUPTS' },
  { id: 'me2', source: 'm_reg', target: 'm_sau', label: '통과' },
  { id: 'me3', source: 'm_reg', target: 'm_uae', label: '통과' },
  { id: 'me4', source: 'm_sau', target: 'm_oil', label: '28.1%' },
  { id: 'me5', source: 'm_uae', target: 'm_oil', label: '12.4%' },
  { id: 'me6', source: 'm_oil', target: 'm_naph', label: '72.3%' },
  { id: 'me7', source: 'm_naph', target: 'm_eth', label: '45.2%' },
  { id: 'me8', source: 'm_naph', target: 'm_prop', label: '28.1%' },
  { id: 'me9', source: 'm_eth', target: 'm_pe', label: '35.2%' },
  { id: 'me10', source: 'm_eth', target: 'm_eg', label: '12.8%' },
  { id: 'me11', source: 'm_prop', target: 'm_pp', label: '42.1%' },
  { id: 'me12', source: 'm_prop', target: 'm_rub', label: '15.4%' },
  { id: 'me13', source: 'm_pe', target: 'm_ind1', label: '영향' },
  { id: 'me14', source: 'm_rub', target: 'm_ind2', label: '영향' },
];

// 분석 추론 단계 정의
export interface AnalysisStep {
  title: string;
  duration: number;
  detail: string;
}

export const CQ2_STEPS: AnalysisStep[] = [
  { title: 'R&D 공고 해석', duration: 1500, detail: '공작기계(C2922) 분야 · 소부장 자립화 · 기업 추천' },
  { title: '후보 기업 탐색', duration: 2000, detail: 'KSIC 분류 기반 8개 기업 추출' },
  { title: '다차원 점수 산출', duration: 1500, detail: 'R&D·매출·특허·리스크 4축 가중 합산' },
  { title: '유사 사례 매칭', duration: 1500, detail: '과거 R&D 과제 3건 매칭 (72~87%)' },
  { title: '결과 생성', duration: 1000, detail: 'Top 5 + 선정 근거 + 반대 추천 완료' },
];

export const CQ1_STEPS: AnalysisStep[] = [
  { title: '이벤트 해석', duration: 1500, detail: '이벤트 유형: 지정학적 충격 · 영향 지역: 호르무즈 해협 · 심각도: 경계 (Level 3/4)' },
  { title: '영향 경로 탐색', duration: 2000, detail: '탐색 깊이: 6단계 · 탐색 노드: 161개 중 42개 관련 · 소요: 0.23초' },
  { title: '영향도 산출', duration: 1500, detail: '투입계수 기반 가중치 · 의존도 취약성 산출 · 전파 시간 추정' },
  { title: '대응 옵션 분석', duration: 1500, detail: '대체 수입선 탐색: 12개국 · 국내 생산기업: 25개 · R&D 과제: 7개' },
  { title: '결과 생성', duration: 1000, detail: '분석 ID: HMZ-2026-001 · 소요: 7.5초 · 결과: 5개 품목, 3개 대응 옵션' },
];
