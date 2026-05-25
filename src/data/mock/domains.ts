import type { Domain, Preset } from '@/types';

// 소부장 기계 가치사슬 분류 (장비 ← 부품 ← 소재) — KOAMI 소부장 GIVC 맥락
// F019 게이트: 공작기계(장비) ← 베어링·감속기(부품, 수입의존 자립화 과제)
export const DOMAINS: Domain[] = [
  { id: 'machine-tool', label: '공작기계 (장비)', sub: 'C2922 (머시닝센터·NC선반·5축가공기)' },
  { id: 'power-trans', label: '동력전달 (부품)', sub: 'C29133·C2914 (베어링·기어·정밀감속기)' },
  { id: 'robot-auto', label: '산업용 로봇·자동화 (장비)', sub: 'C2991 (협동로봇·서보·모션제어)' },
  { id: 'hydraulic', label: '유압·공압 기기 (부품)', sub: 'C2913 (유압펌프·실린더·밸브)' },
  { id: 'mold', label: '금형 (부품)', sub: 'C29294 (프레스·사출 금형)' },
  { id: 'machine-mat', label: '기계용 특수강·소재 (소재)', sub: 'C241·C2592 (베어링강·공구강·정밀주조)' },
];

export const PRESETS: Preset[] = [
  // ── 헤드라인 프리셋 (시연 오프닝) ──────────────────────────────────────
  // F019 실측: 기어·감속기 수입 $994M > 수출 $648M = 소부장 자립화 핵심 과제.
  // 데모는 이 시나리오로 시작 — KOAMI 소부장 자립화 미션 정조준.
  //
  // TODO(서민원): 헤드라인 R&D 시나리오의 weights·budget·period를 정의해주세요.
  //   weights {rnd, sales, patent, risk} 합=1.0. 자립화 R&D는 어디에 무게를 둘지가
  //   추천 결과(어떤 기업이 Top에 오르는지)를 바로 좌우합니다.
  //   - rnd↑: R&D 투자 적극 기업 우대 (자립화 의지)
  //   - patent↑: 특허 보유 기업 우대 (기술 자산)
  //   - sales↑: 매출 성장 기업 우대 (사업화 가능성)
  //   - risk↑: 재무 안정 기업 우대 (정책자금 회수 안정성)
  //   아래는 초안(placeholder) — 시연 메시지에 맞게 조정해주세요.
  {
    id: 'p1',
    label: '사례 1',
    title: '고정밀 감속기 국산화',
    domain: 'power-trans',
    budget: 6,
    period: 18,
    weights: { rnd: 0.35, sales: 0.15, patent: 0.35, risk: 0.15 }, // ← TODO: 조정
  },
  // ── 보조 프리셋 ───────────────────────────────────────────────────────
  {
    id: 'p2',
    label: '사례 2',
    title: '5축 머시닝센터 정밀도 고도화',
    domain: 'machine-tool',
    budget: 8,
    period: 24,
    weights: { rnd: 0.4, sales: 0.2, patent: 0.25, risk: 0.15 },
  },
  {
    id: 'p3',
    label: '사례 3',
    title: '산업용 로봇 서보·정밀베어링 자립화',
    domain: 'robot-auto',
    budget: 5,
    period: 18,
    weights: { rnd: 0.3, sales: 0.25, patent: 0.3, risk: 0.15 },
  },
];
