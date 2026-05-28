import type { FaqEntry } from '@/components/platform';

/**
 * /platform/plan 추진 계획 페이지 FAQ.
 * ⭐ 사용자(서민원) 검토 필요
 */
export const planFaq: FaqEntry[] = [
  {
    q: 'Phase 0~4 일정이 어떻게 돼요?',
    a: 'Phase 0 PoC(5/24~5/27, 완료) -> Phase 1 데이터 확장(~6/3) -> Phase 2 CQ 추가(~6/10) -> Phase 3 KG 운영(~6/20) -> Phase 4 본사업화 준비(~6/27)예요. 시연(5/26~)을 기점으로 약 1개월 추진 일정이에요.',
    keywords: ['Phase', '일정', '0~4', '0', '1', '2', '3', '4', 'phase', '계획'],
    related: ['Tier1·Tier2 누가 결정'],
  },
  {
    q: 'Tier1·Tier2는 누가 결정해요?',
    a: '오늘 시연 후 KOAMI(소부장담당·회원사)와 협의해 결정해요. Tier1(2건)은 KT DS가 자체 판단으로 우선 준비했고, Tier2(5건)는 의향 설문 회신을 받아 우선순위 합의해요.',
    keywords: ['Tier1', 'Tier2', '누가', '결정', '합의', '협의'],
    related: ['Phase 0~4 일정', '의향 설문'],
  },
  {
    q: 'Phase 1 데이터 확장은 뭘 하나요?',
    a: 'KOAMI 보유 회원사 데이터(NDA 협의 후 마스킹), 산업부 비공개 정책 DB(승인 후), 추가 공공 원천(예: NICE 신용평가·BIGKinds 뉴스) 적재예요. 데모의 실데이터 70%를 90% 이상으로 끌어올려요.',
    keywords: ['Phase 1', '데이터', '확장', '확보', '회원사', 'NDA'],
    related: ['Phase 0~4 일정'],
  },
  {
    q: '본사업화는 언제부터 가능한가요?',
    a: 'Phase 4 완료 시점(~6/27) 이후예요. PoC 검증 + 데이터·CQ 확장 + KG 운영 안정화가 모두 완료돼야 시작 가능해요. 본사업화 후엔 사내 LLM+RAG 통합·실 GIVC API 연동·PII 마스킹·접근통제까지 확장돼요.',
    keywords: ['본사업화', '언제', '시작', '가능', 'production'],
    related: ['Phase 0~4 일정'],
  },
];
