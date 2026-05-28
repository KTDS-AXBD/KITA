/**
 * F042: v0.2 시연 동선 페이지 순서.
 * PageNav와 테스트가 공유하는 SSOT.
 *
 * 순서는 의도된 시연 흐름:
 *   데이터 현황 → CQ 관리 → 온톨로지 정의 → 지식그래프 → 시나리오 분석 → 비교 검증 → 추진 계획
 * (사이드바 MAIN 5 + REFERENCE 2와 동일)
 */
export interface PageMeta {
  path: string;
  label: string;
}

export const PAGE_ORDER: PageMeta[] = [
  { path: '/platform/data', label: '데이터 현황' },
  { path: '/platform/cq', label: 'CQ 관리' },
  { path: '/platform/ontology', label: '온톨로지 정의' },
  { path: '/platform/graph', label: '지식그래프' },
  { path: '/platform/scenario', label: '시나리오 분석' },
  { path: '/platform/compare', label: '비교 검증' },
  { path: '/platform/plan', label: '추진 계획' },
];
