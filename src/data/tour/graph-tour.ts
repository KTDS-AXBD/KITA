import type { TourStep } from '@/components/platform';

/**
 * /platform/graph 지식그래프 페이지 투어.
 * ⭐ 사용자(서민원) 검토 필요 - 영업 화법 정제 포인트
 */
export const graphTourSteps: TourStep[] = [
  {
    target: '[data-tour-id="domain-toggle"]',
    title: '도메인 토글 (소부장 ↔ 호르무즈)',
    body: '소부장(공작기계 24노드) - 기본·시연 중심 / 호르무즈(원유 우회 44노드) - CQ-001 보조 시연. 토글 즉시 그래프가 전환돼요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour-id="cyto-canvas"]',
    title: '다단계 가치사슬 시각화',
    body: '소재(특수강) -> 부품(베어링·감속기) -> 장비(머시닝센터) 다단계 흐름을 색으로 구분했어요. 노드 클릭 시 상세가 우측에 떠요.',
    placement: 'right',
  },
  {
    target: '[data-tour-id="node-detail"]',
    title: '노드 상세 패널',
    body: '선택 노드의 속성·연결 엣지·출처를 카드로 확인할 수 있어요. 시연 중 "이건 어디서 온 데이터?" 질문에 즉답해요.',
    placement: 'left',
  },
  {
    target: '[data-tour-id="legend"]',
    title: '범례 - 색이 의미하는 것',
    body: '빨강 = 장비(완제품), 파랑 = 부품, 회색 = 소재, 노랑 = 수입국. 색만 봐도 가치사슬 단계 위치가 보여요.',
    placement: 'top',
  },
  {
    target: '[data-tour-id="filter-toolbar"]',
    title: '필터 - 노드 종류 좁히기',
    body: '장비만, 부품만, 특정 기업만 표시할 수 있어요. 시연 중 메시지 강조 시 사용해요 (예: 소재만 켜서 자립화 적자 강조).',
    placement: 'bottom',
  },
  {
    target: '[data-tour-id="path-highlight"]',
    title: '영향경로 추적',
    body: '특정 노드에서 시작해 다단계 영향을 자동 추적해요. "이 부품이 수입 차단되면 어디까지 영향?"의 KG 답이에요.',
    placement: 'bottom',
  },
];
