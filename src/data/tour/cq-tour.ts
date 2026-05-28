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
    title: 'CQ 한 개 = 5섹션 누적 자산',
    body: '자연어 질문·KG 질의(Cypher)·검증 메트릭·데이터 요구·빌드업 이력 5섹션이 묶여요. 세미나 한 번으로 끝나지 않고 누적되는 KG 자산이에요.',
    placement: 'left',
  },
  {
    target: '[data-tour-id="build-history"]',
    title: 'KG 투명성 - 어디서 시작됐는지 추적',
    body: '1차 세미나 -> 질의서 회신 -> KG 검증 -> 산업부 보고 흐름을 Timeline으로 추적해요. "이 CQ 어떤 근거로 만들었냐"에 즉답 가능해요.',
    placement: 'left',
  },
  {
    target: '[data-tour-id="new-cq-btn"]',
    title: '즉석 질문이 바로 KG 자산이 돼요',
    body: '시연 중 "이런 질문도 가능해요?" 물으시면 "+ CQ 추가" 버튼으로 그 자리에서 등록해요. 다음 세미나엔 KG가 답할 수 있게 데이터·관계를 보강해드려요.',
    placement: 'left',
  },
];
