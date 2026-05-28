import type { TourStep } from '@/components/platform';

/**
 * /platform/ontology 온톨로지 모델 정의 페이지 투어.
 * ⭐ 사용자(서민원) 검토 필요 - 영업 화법 정제 포인트
 */
export const ontologyTourSteps: TourStep[] = [
  {
    target: '[data-tour-id="ontology-kpi"]',
    title: '온톨로지 규모 요약',
    body: '엔티티 13종 · 관계 8종 · 인스턴스 161건 · 관계 331건. 이 정의가 모든 KG 추론·시나리오 분석의 골격이에요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour-id="entity-cards"]',
    title: '13종 엔티티 정의',
    body: '기업·제품·국가·HS코드·핵심광물 등 도메인 핵심 개념을 카드로 보여드려요. 각 엔티티마다 속성·예시·출처가 명시돼요.',
    placement: 'top',
  },
  {
    target: '[data-tour-id="relation-table"]',
    title: '8종 관계 (출처 명시)',
    body: '제품-기업 "PRODUCED_BY", 무역-국가 "ORIGINATES_FROM" 등 관계마다 출처(GIVC·UNIPASS·산업부 등)를 정합화했어요.',
    placement: 'top',
  },
  {
    target: '[data-tour-id="constraint-block"]',
    title: 'Neo4j Cypher 제약',
    body: 'UNIQUE·INDEX 제약을 그대로 노출해 KG 운영 무결성을 보여드려요. 시연용 가상이 아닌 실제 운영 가능한 정의예요.',
    placement: 'top',
  },
  {
    target: '[data-tour-id="relation-edit-modal"]',
    title: '관계 클릭 시 상세 보기',
    body: '관계 한 행을 클릭하면 출발/도착 엔티티, 카디널리티, 사용 시나리오까지 모달로 확인할 수 있어요.',
    placement: 'left',
  },
];
