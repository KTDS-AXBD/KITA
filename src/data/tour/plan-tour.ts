import type { TourStep } from '@/components/platform';

/**
 * /platform/plan 추진 계획 페이지 투어.
 * ⭐ 사용자(서민원) 검토 필요 - 영업 화법 정제 포인트
 */
export const planTourSteps: TourStep[] = [
  {
    target: '[data-tour-id="phase-timeline"]',
    title: 'Phase 0~4 추진 일정',
    body: '5/26 시연부터 6/27 본사업화 준비까지 5단계 타임라인이에요. 각 Phase는 산출물·게이트가 명확해요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour-id="cq-tier-list"]',
    title: 'Tier1 시연 2 · Tier2 고객확인 5',
    body: '오늘 시연으로 답하는 CQ 2건 + 고객 합의 후 추가 확장하는 CQ 5건. 시연 후 회신이 Tier2 우선순위를 결정해요.',
    placement: 'top',
  },
  {
    target: '[data-tour-id="plan-phases"]',
    title: '단계별 핵심 산출물',
    body: 'Phase 0 PoC · Phase 1 데이터 확장 · Phase 2 CQ 추가 · Phase 3 KG 운영 · Phase 4 본사업화. 각 단계 산출물이 명시돼요.',
    placement: 'top',
  },
  {
    target: '[data-tour-id="footer-contact"]',
    title: '차기 합의의 시작점이에요',
    body: 'KT DS Enterprise사업본부 AX컨설팅팀 서민원 책임. 추가 데이터 협의·Phase 1 범위 합의·담당자 연결은 여기서 시작해요.',
    placement: 'top',
  },
];
