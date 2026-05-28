import type { TourStep } from '@/components/platform';

/**
 * /platform/scenario 시나리오 분석 페이지 투어 (시연 하이라이트).
 * ⭐ 사용자(서민원) 검토 필요 - 영업 화법 정제 포인트
 */
export const scenarioTourSteps: TourStep[] = [
  {
    target: '[data-tour-id="cq-toggle"]',
    title: 'CQ 시나리오 선택',
    body: 'CQ-002 소부장(공작기계 자립화) - 기본 시연 / CQ-001 호르무즈(원유 우회) - 보조. CQ 단위로 분석 전체가 바뀌어요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour-id="nl-query"]',
    title: '자연어 질의',
    body: '고객이 던지는 질문 그대로예요. "공작기계 분야에서 일본 의존도가 높은 부품의 국산화 후보 기업은?" 같은 일반 한국어.',
    placement: 'bottom',
  },
  {
    target: '[data-tour-id="cypher-block"]',
    title: '자동 변환된 Cypher',
    body: '자연어가 KG 질의어(Cypher)로 변환되는 과정을 그대로 노출해요. LLM의 블랙박스가 아닌 검증 가능한 추론 경로예요.',
    placement: 'top',
  },
  {
    target: '[data-tour-id="reasoning-steps"]',
    title: '5단계 추론 애니메이션',
    body: '의존성 식별 -> 후보 발굴 -> 적합도 산출 -> 인과 검증 -> 권고 도출. 각 단계가 KG에서 실제로 어떻게 계산되는지 보여드려요.',
    placement: 'right',
  },
  {
    target: '[data-tour-id="result-tabs"]',
    title: '결과 A~E 5탭',
    body: 'A 영향경로 · B Top5 기업 · C 설명가능성(인과·취약성·EWS·재현성) · D 대응옵션 · E 의사결정 리포트. 시연의 핵심 산출물이에요.',
    placement: 'top',
  },
  {
    target: '[data-tour-id="decision-report"]',
    title: '부처 결재용 1페이지 산출물',
    body: 'KG 추론 결과를 보고용 1페이지로 정리해요. CQ -> Cypher -> 결과 -> 권고 흐름이 그대로 담겨 결재·회의 배포에 바로 쓸 수 있어요.',
    placement: 'top',
  },
];
