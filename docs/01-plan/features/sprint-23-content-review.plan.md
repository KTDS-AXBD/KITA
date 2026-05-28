---
id: KOAMI-PLAN-023
type: plan
sprint: 23
features: [F054]
created: 2026-05-29
status: approved
---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | F052/F053 1차 구현 시 Claude 작성한 33 tour step + 35 FAQ가 사용자(서민원) 검토 사이클 없이 라이브 반영. 영업 톤·실 수치·KOAMI 화법 정확성 미검증 |
| **Solution** | Claude 1차 정제(영업 톤·실 수치·MEMORY/SPEC 참조 일관성) -> 사용자 검토 포인트 명시(라인 단위 diff) -> 사용자 정정 반영 -> 라이브 재배포 |
| **Core Value** | F040 customerAsk·reportRef 정제 패턴 답습. 시연자 없이 고객 자력 화면 이해(PRD 핵심 "자발적 데이터 회신 유도") 완결도 향상 |

---

## §1 목표

1. **Tour 33 step 영업 톤 정제** (`src/data/tour/{page}-tour.ts` x 7페이지)
   - title/body 가치 앵커 + 구체 액션 안내 패턴으로 격상
   - 시연자 구두 설명 의존 표현 제거 (혼자 진입한 고객 시선)
2. **FAQ 35 QA 영업 톤·정확성 정제** (`src/data/chatbot/{page}-faq.ts` x 7페이지)
   - 질문 키워드 풀: 고객 실제 발화 패턴 반영(현재는 Claude 추측)
   - 답변 본문: 영업 톤 + 실 수치 정확성 + 다음 액션 유도
3. **참조 일관성**: 실/추정/유료 분류(27건·70%)·페이지 수치·라이브 버전 SSOT 정합
4. **회귀**: Playwright 7페이지 키워드 매치 유지(F053 dataFaq[0] 패턴)

## §2 범위

**포함**:
- `src/data/tour/data-tour.ts` (5 step)
- `src/data/tour/cq-tour.ts` (4 step)
- `src/data/tour/ontology-tour.ts` (4 step)
- `src/data/tour/graph-tour.ts` (5 step)
- `src/data/tour/scenario-tour.ts` (2+4 step)
- `src/data/tour/compare-tour.ts` (4 step)
- `src/data/tour/plan-tour.ts` (4 step)
- `src/data/chatbot/data-faq.ts` (5 QA)
- `src/data/chatbot/cq-faq.ts` (5 QA)
- `src/data/chatbot/ontology-faq.ts` (5 QA)
- `src/data/chatbot/graph-faq.ts` (5 QA)
- `src/data/chatbot/scenario-faq.ts` (5 QA)
- `src/data/chatbot/compare-faq.ts` (5 QA)
- `src/data/chatbot/plan-faq.ts` (5 QA)

**제외**:
- SpotlightTour.tsx / HelpChatbot.tsx 컴포넌트 (F052/F053에서 완료, 인프라 변경 없음)
- LLM fallback 로직 (현재 기본 OFF 유지)
- 신규 페이지 추가 (v0.2 7페이지 고정)
- F040 cqData.ts (직전 트랙에서 정제 완료)

## §3 작업 분해

### Phase 1: Claude 1차 정제 (autopilot)
1. F052 tour 7파일 영업 톤 격상 (가치 앵커·구체 액션 패턴)
2. F053 FAQ 7파일 질문 키워드 + 답변 영업 톤·실 수치 정정
3. MEMORY/SPEC SSOT와 참조 수치 일관성 확인 (실 19/추정 4/유료 4·페이지 수치)
4. typecheck/lint/test PASS 확인 + Playwright 회귀 PASS

### Phase 2: 사용자 검토 사이클 (Master)
1. 정제 diff를 사용자가 라인 단위 검토 (페이지별 분리 권장)
2. 사용자 정정 사항을 Claude가 반영
3. 재검증 (typecheck/test/Playwright)

### Phase 3: 라이브 배포
1. `pnpm deploy:cf` -> 새 버전 활성
2. curl `/platform/*` 8라우트 302 확인 (CF Access)
3. 활성 버전 ID를 F054 본문에 갱신

## §4 DoD (Definition of Done)

- [ ] tour 7파일 영업 톤 정제 PR (33 step 모두 사용자 검토 PASS)
- [ ] FAQ 7파일 영업 톤·정확성 정제 PR (35 QA 모두 사용자 검토 PASS)
- [ ] typecheck/lint/test 110+ PASS
- [ ] Playwright 7페이지 회귀 PASS (콘솔에러 0)
- [ ] 라이브 재배포 (real 모드 유지·100% 활성)
- [ ] 사용자 검토 포인트 0건 잔존

## §5 검토 사이클 인터페이스 (사용자 협업)

Claude 정제 후 사용자 검토 형식:
- **페이지 단위 분리**: 7페이지 각각 별 review batch (혼란 방지)
- **diff 미리보기**: 변경된 라인만 before -> after 표시
- **검토 옵션**: ✅승인 / ✏️수정 (Claude에 정정 지시) / ⏭️skip(원본 유지)
- **반영 우선순위**: 실 수치 부정확성 > 영업 톤 어색 > 표현 다양화

## §6 비가역 명령

해당 없음. 라이브 배포는 `pnpm deploy:cf`로 가역(이전 버전 rollback 가능).

## §7 리스크

| 리스크 | 영향 | 완화 |
|---|---|---|
| 사용자 검토 사이클 지연 | 1세션 안에 완결 어려움 | 페이지별 batch 분리로 incremental review |
| 영업 톤 주관성 | Claude 정제와 사용자 정정의 거리 | F040 customerAsk 정제 패턴을 사전 reference로 활용 |
| 라이브 회귀 | FAQ 키워드 변경 시 dataFaq[0] 매칭 깨짐 | Playwright 7페이지 회귀로 사전 차단 |
