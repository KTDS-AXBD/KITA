import type { FaqEntry } from '@/components/platform';

/**
 * /platform/compare 비교 검증 페이지 FAQ (전략 핵심 메시지).
 * ⭐ 사용자(서민원) 검토 필요
 */
export const compareFaq: FaqEntry[] = [
  {
    q: 'chatGIVC와 온톨로지+KG 차이가 뭐예요?',
    a: 'chatGIVC = LLM+RAG 기반 챗봇이에요. 자연어 답변은 잘 하지만 출처·근거·재현성이 모호해요. 온톨로지+KG = 정형 데이터 위에 명시적 관계와 추론 규칙을 얹은 구조예요. 답변 근거를 노드·엣지 단위로 추적 가능해요. 둘은 보완재예요.',
    keywords: ['chatGIVC', '온톨로지', 'KG', '차이', 'LLM', 'RAG', '비교'],
    related: ['6축 비교표', 'Top3 SSOT 연동'],
  },
  {
    q: '6축 비교 기준이 뭐예요?',
    a: '(1) 인과추적 - 답변 근거 단계 추적 (2) 재현성 - 같은 질문 같은 답 (3) 설명가능성 - 왜 그 답인지 (4) 확장성 - 새 데이터·도메인 추가 (5) 운영성 - 유지보수 (6) 신뢰성 - 부처 보고 사용 가능. 6축 모두 KG가 우세하지만 LLM은 자연어 입출력에서 우세해요.',
    keywords: ['6축', '6', '기준', '비교', '항목'],
    related: ['chatGIVC와 KG 차이'],
  },
  {
    q: 'Top3 추천 기업이 왜 시나리오와 일치해요?',
    a: '비교 페이지 Top3는 시나리오 페이지 SSOT(단일 진실 소스)에서 자동 파생돼요. CQ -> 분석 -> 비교가 동일 데이터로 일관성을 유지하는 게 KG 운영의 강점이에요. LLM 답변은 호출마다 다를 수 있어요.',
    keywords: ['Top3', '추천', '일치', 'SSOT', '시나리오', '동일'],
    related: ['chatGIVC와 KG 차이'],
  },
  {
    q: 'KG가 우세한데 LLM은 왜 같이 쓰나요?',
    a: '자연어 인터페이스(질문 -> Cypher 변환·답변 자연어화)는 LLM이 우세해요. KG는 답변 신뢰성·추적성, LLM은 사용자 경험이 강점이라 보완재예요. 본사업화 설계는 KG 위 LLM (NL->Cypher->KG 추론->답변 자연어화)이에요.',
    keywords: ['LLM', '같이', '보완', '왜', '둘다'],
    related: ['chatGIVC와 KG 차이'],
  },
];
