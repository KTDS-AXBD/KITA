import type { TourStep } from '@/components/platform';

/**
 * /platform/compare 비교 검증 페이지 투어 (전략 핵심 메시지).
 * ⭐ 사용자(서민원) 검토 필요 - 영업 화법 정제 포인트
 */
export const compareTourSteps: TourStep[] = [
  {
    target: '[data-tour-id="chatgivc-card"]',
    title: 'chatGIVC (LLM+RAG) 응답',
    body: '고객이 이미 보유한 chatGIVC가 같은 질문에 어떻게 답하는지 좌측에 보여드려요. 답변이 그럴듯하지만 출처·근거가 모호해요.',
    placement: 'right',
  },
  {
    target: '[data-tour-id="ontology-card"]',
    title: '온톨로지 + KG 응답',
    body: '같은 질문에 KG가 답한 결과예요. 추론 경로·출처·재현성이 명시돼요. 같은 질문 다른 신뢰도, 이게 핵심 메시지예요.',
    placement: 'left',
  },
  {
    target: '[data-tour-id="comparison-table"]',
    title: '6축 비교표',
    body: '인과추적·재현성·설명가능성·확장성·운영성·신뢰성 6축으로 정량 비교해요. ✗/✓ 한눈에 보면 결정 쉬워져요.',
    placement: 'top',
  },
  {
    target: '[data-tour-id="top3-list"]',
    title: 'Top3 추천 기업 (SSOT 연동)',
    body: '시나리오 SSOT에서 자동 파생된 Top3예요. CQ -> 분석 -> 비교 페이지가 동일 데이터로 일관성을 유지해요.',
    placement: 'top',
  },
];
