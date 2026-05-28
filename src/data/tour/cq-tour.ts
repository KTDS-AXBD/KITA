import type { TourStep } from '@/components/platform';

/**
 * /platform/cq CQ(Competency Question) 관리 페이지 투어.
 * ⭐ 사용자(서민원) 검토 필요 - 영업 화법 정제 포인트
 */
export const cqTourSteps: TourStep[] = [
  {
    target: '[data-tour-id="cq-filter"]',
    title: '시나리오별 CQ 필터',
    body: 'CQ(Competency Question)는 "이 온톨로지가 이 질문에 답할 수 있어야 한다"는 역량 정의예요. 시나리오·Tier·상태로 좁혀볼 수 있어요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour-id="cq-list"]',
    title: 'CQ 7건 (Tier1 시연 2 · Tier2 고객확인 5)',
    body: 'Tier1은 시연으로 즉시 답할 수 있게 준비된 질문, Tier2는 고객 합의 후 KG 확장이 필요한 질문이에요.',
    placement: 'right',
  },
  {
    target: '[data-tour-id="cq-detail"]',
    title: '질문 - Cypher - 검증 - 데이터요구',
    body: '각 CQ는 자연어 질문, KG 질의(Cypher), 검증 메트릭, 필요 데이터까지 5섹션으로 추적돼요. CQ 자체가 누적 자산이에요.',
    placement: 'left',
  },
  {
    target: '[data-tour-id="build-history"]',
    title: '빌드업 이력 추적',
    body: '1차 세미나 -> 질의서 회신 -> KG 검증 -> 산업부 보고 단계를 Timeline으로 표시해요. CQ가 어디서 시작해 어디로 가는지 한눈에 봐요.',
    placement: 'left',
  },
  {
    target: '[data-tour-id="new-cq-btn"]',
    title: '새 CQ 등록',
    body: '시연 중 고객이 "이런 질문도 가능한가요?" 물으면 즉석에서 CQ로 등록할 수 있어요. KG가 답할 수 있게 만드는 출발점이에요.',
    placement: 'left',
  },
];
