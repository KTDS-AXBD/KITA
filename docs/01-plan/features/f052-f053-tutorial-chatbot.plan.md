# F052+F053 - 자력 데모 UX (Spotlight 투어 + 도움말 챗봇) Planning Document

> **Summary**: 시연자(서민원) 없이 고객(KOAMI 소부장담당·산업부 관계자)이 v0.2 7페이지를 자력으로 이해하게 만드는 UX 강화 2 트랙 통합. (F052) Spotlight 투어 - 첫 진입 자동 + 헤더 도움말 재실행. (F053) 우하단 플로팅 도움말 챗봇 - 페이지 컨텍스트 인식 + FAQ 기본·LLM 옵션. 기존 What-If/ChatGIVC와 분리. **콘텐츠(영업 화법)는 사용자 기여 포인트**.
>
> **Project**: KOAMI PoC · **Version**: 0.1.0 · **Author**: 서민원 + Claude Code · **Date**: 2026-05-28 · **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | v0.2 7페이지가 라이브(`koami.minu.best`)에 있지만 시연자 구두 설명 없이는 KPI·시나리오 추론·비교 검증·계획 의도 파악 어려움. 고객이 링크 받아 혼자 들어와 봐도 자력 이해 가능해야 시연 후 자발적 데이터 회신 유도(PRD 핵심 목표 = "고객이 자발적으로 추가 데이터를 꺼내게 유도"). |
| **Solution** | 2 트랙 통합 - (F052) 페이지별 4~6 step Spotlight 투어 첫 진입 자동(localStorage 1회) + 헤더 ❓ 버튼 재실행 / (F053) 우하단 플로팅 도움말 챗봇 페이지 컨텍스트 인식 + FAQ 룰베이스 기본 + LLM fallback 옵션(기본 OFF 시연 안정). |
| **Function/UX Effect** | 7페이지 진입 시 핵심 KPI/UI 요소에 스포트라이트 + 영업 톤 멘트 자동 안내(1회). 페이지 어디서나 우하단 ❓ 토글로 사용법·시연 흐름 질문 응답. 기존 화면 변경 0(추가만). |
| **Core Value** | 시연 의존도↓ + 고객 자력 이해↑ + 시연 후 자발적 회신 유도 (영업 핵심 KPI). |

---

## 1. Overview

### 1.1 Purpose

시연자 없이도 고객이 v0.2 7페이지(`/platform/{data,cq,ontology,graph,scenario,compare,plan}`)를 이해하고 다음 행동(추가 데이터 회신·다음 단계 합의) 결정 가능한 상태로 만든다. v0.1(`/v1/*`)는 백업 fallback이라 본 트랙 범위 밖(사용자 결정 "v0.2 7페이지만").

### 1.2 Background

- v0.2 7페이지 라이브 활성 = `be949af0` (F051 재배포). 코드 동결 상태에서 신규 UX 첨가.
- 기존 챗봇 자산: F009 What-If(`WhatIfChat.tsx`, 시나리오 한정·로컬 마운트) + v0.1 S6 `ChatGivcQueryPane.tsx`(데이터 자연어 질의, v0.1 only). 둘 다 페이지 전역 도움말 용도 부적합 -> 신규 컴포넌트.
- a11y 인프라: F046 Modal focus trap·body scroll lock·dialog role 구현 완료 -> SpotlightTour·HelpChatbot 동일 패턴 재사용.
- 모션 인프라: v0.2 진입 stagger 모션(F039), F051 Lighthouse 측정에서 CLS 페널티 인지(stagger). 신규 컴포넌트는 모션 절제 + reduce-motion 존중.

### 1.3 fs 실측 (2026-05-28)

- `src/versions/v0_2/platform/*Page.tsx` 7개 모두 존재 확인:
  ```
  data/DataStatusPage.tsx
  cq/CqManagePage.tsx
  ontology/OntologyPage.tsx
  graph/GraphPage.tsx
  scenario/ScenarioPage.tsx
  compare/ComparePage.tsx
  plan/PlanPage.tsx
  ```
- `src/components/platform/` 공용 = 9종(Badge·KpiCard·DataTable·EntityCard·Tooltip·CypherBlock·Toggle·Modal·Timeline·SourceBadge) + StatusDot. 신규 `SpotlightTour.tsx`·`HelpChatbot.tsx` 추가.
- `src/shell/AppLayout.tsx` = v0.2 셸. HeaderBar에 도움말 버튼 추가 + 우하단 챗봇 마운트 위치.
- 기존 `/api/chat` 엔드포인트(`src/worker/index.ts`) = F009 What-If 용도. F053이 재사용 가능(KV rate-limit·Workers AI 동일).
- localStorage 사용 선례: 0건(현재 KOAMI 코드 grep 결과). 신규 도입 OK.

---

## 2. 범위 (In/Out)

### In Scope
- v0.2 7페이지 SpotlightTour (자동 1회 + 도움말 버튼 재실행)
- v0.2 전역 HelpChatbot (페이지 컨텍스트 인식, FAQ 룰베이스 + LLM 옵션)
- 페이지별 `data-tour-id` 부착 (target selector anchor)
- 페이지별 FAQ ts 모듈 (5~8 QA each)
- AXIS `--op-*` 토큰·a11y(F046 패턴)·reduce-motion 존중
- 라이브 배포(real 모드 유지)

### Out of Scope
- v0.1 `/v1/*` 3페이지 (사용자 결정 "v0.2 7페이지만")
- 다국어 EN (F012 P2 보류 트랙)
- 챗봇 음성 입출력
- 페이지 이동을 챗봇이 직접 트리거 (링크 안내까지만)
- 투어 분기 (선형 next/prev만)
- 분석 이벤트(GA·Posthog 등) - 시연 후 별도 트랙

---

## 3. 화면 매핑 (7페이지)

| 페이지 | 라우트 | 투어 step 수 | 핵심 anchor 후보 (data-tour-id) | 챗봇 FAQ 후보 (5~8 QA) |
|---|---|---|---|---|
| 데이터 현황 | `/platform/data` | 5 | `kpi-total`·`kpi-real`·`source-table`·`status-dot`·`survey-cta` | "실데이터/추정/유료 분류 기준?" 외 |
| CQ 관리 | `/platform/cq` | 5 | `cq-filter`·`cq-list`·`cq-detail`·`build-history`·`new-cq-btn` | "CQ가 뭐예요?" "Tier1/Tier2 차이?" 외 |
| 온톨로지 | `/platform/ontology` | 5 | `entity-cards`·`relation-table`·`constraint-block`·`relation-edit-modal` | "엔티티 13종 의미?" "관계 8개 어디서?" 외 |
| 그래프 | `/platform/graph` | 6 | `domain-toggle`·`cyto-canvas`·`node-detail`·`legend`·`filter-toolbar`·`path-highlight` | "노드 색상 의미?" "도메인 토글 차이?" 외 |
| 시나리오 분석 | `/platform/scenario` | 6 | `cq-toggle`·`nl-query`·`cypher-block`·`reasoning-steps`·`result-tabs`·`decision-report` | "5단계 추론 의미?" "결과 A~E 무엇?" 외 |
| 비교 검증 | `/platform/compare` | 4 | `chatgivc-card`·`ontology-card`·`comparison-table`·`top3-list` | "chatGIVC vs 온톨로지 차이?" 외 |
| 추진 계획 | `/platform/plan` | 4 | `phase-timeline`·`cq-tier-list`·`footer-contact` | "Phase 0~4 일정?" "Tier1/2 누가 결정?" 외 |

> 투어 step 수는 가이드. 실제 콘텐츠 작성 시 ±1 조정 가능.

---

## 4. 컴포넌트 설계

### 4.1 SpotlightTour (F052)

```tsx
// src/components/platform/SpotlightTour.tsx
type TourStep = {
  target: string;          // CSS selector (e.g., '[data-tour-id="kpi-total"]')
  title: string;
  body: string;            // 1~2문장 영업 톤
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
};

type SpotlightTourProps = {
  steps: TourStep[];
  storageKey: string;      // e.g., 'koami:tour:data:seen'
  isOpen: boolean;
  onClose: () => void;
};
```

- 4분할 dim 오버레이(top/right/bottom/left rectangle) + target 영역만 투명·outline.
- Tooltip 카드: 제목·본문·진행 인디케이터(N/M)·이전/건너뛰기/다음·X.
- a11y: `role="dialog"`·`aria-modal="true"`·`aria-labelledby`·focus trap·Esc 닫기·body scroll lock (F046 답습).
- Reduce-motion: `prefers-reduced-motion: reduce` 검사 -> 페이드/이동 motion duration 0.

### 4.2 useTour 훅 (F052)

```tsx
// src/components/platform/useTour.ts
function useTour(pageKey: string, steps: TourStep[]) {
  // localStorage check + 200ms delay + auto-open
  // window event 'koami:tour:restart' listener (헤더 버튼 -> 강제 재시작)
}
```

### 4.3 HelpChatbot (F053)

```tsx
// src/components/platform/HelpChatbot.tsx
type FaqEntry = { q: string; a: string; keywords: string[]; related?: string[] };

type ChatMessage = { role: 'user' | 'assistant'; content: string };

// 우하단 플로팅 토글 + 패널(slide-in 320px / 모바일 풀스크린)
// 라우트 인식 -> pageKey -> FAQ 매칭(키워드 점수)
// FAQ miss + LLM 토글 ON -> /api/chat fetch (KV rate-limit 세션 5회)
```

- 마운트: `AppLayout` 끝부분 (라우트 무관 전역).
- 페르소나: "안녕하세요, GIVC 온톨로지 데모 도우미예요. {페이지명} 사용법 안내드릴게요." 톤 (영업).
- F052 투어와 상호 연결: 답변 끝에 "더 자세한 안내는 우상단 ❓ '도움말'로 가이드 투어를 다시 볼 수 있어요" 링크.
- a11y: 동일 F046 패턴.

### 4.4 데이터 디렉터리

```
src/data/tour/
  data-tour.ts        # 데이터 현황 페이지 step
  cq-tour.ts          # CQ 관리
  ontology-tour.ts
  graph-tour.ts
  scenario-tour.ts
  compare-tour.ts
  plan-tour.ts
  index.ts            # 7페이지 lookup map

src/data/chatbot/
  data-faq.ts         # 데이터 현황 FAQ
  cq-faq.ts
  ontology-faq.ts
  graph-faq.ts
  scenario-faq.ts
  compare-faq.ts
  plan-faq.ts
  index.ts            # 7페이지 lookup map
```

---

## 5. 사용자 기여 포인트 (영업 콘텐츠 작성)

⭐ **이 섹션이 본 Plan의 핵심**. 코드는 Claude가 작성하지만, KOAMI 영업 메시지·시연 화법은 서민원 책임자만이 정확히 알아요.

### 5.1 투어 step 콘텐츠 작성 가이드

각 페이지 4~6 step:

```ts
// 예: src/data/tour/data-tour.ts (샘플 - 사용자 검토 필요)
export const dataTourSteps: TourStep[] = [
  {
    target: '[data-tour-id="kpi-total"]',
    title: '한눈에 보는 데이터 현황',
    body: 'GIVC가 보유한 27건 데이터를 신뢰성 등급으로 분류했어요. 실데이터 19건이 핵심 자산이고, 추정/유료는 확장 후보예요.',
    placement: 'bottom',
  },
  // ... 4 more steps (사용자 작성)
];
```

**작성 원칙** (사용자 검토 필요):
- 1 step = 1~2문장 (긴 설명 X)
- 화면 요소가 "왜 거기 있는지" 가치 안내 (기능 설명 X)
- KOAMI 청중(소부장담당·산업부) 입장에서 "내가 뭘 해야 하나" 행동 유도
- 영업 화법 (em dash 금지 -> 하이픈/쉼표)

**1차 진행 방식 옵션**: (a) Claude가 7페이지 초안 작성 -> 사용자 일괄 검토/정제, (b) 사용자가 1페이지씩 작성 -> Claude 컴포넌트 결합. **권장 = (a) Claude 초안 + 사용자 검토** (이전 F040 customerAsk/reportRef 정제 패턴 답습).

### 5.2 챗봇 FAQ 작성 가이드

각 페이지 5~8 QA:

```ts
// 예: src/data/chatbot/data-faq.ts (샘플 - 사용자 검토 필요)
export const dataFaq: FaqEntry[] = [
  {
    q: '실데이터/추정/유료 분류 기준은?',
    a: '실데이터(⭐) = GIVC·외부 공공DB에서 직접 수집한 값, 추정(△) = 합리적 추론값(예: 미공개 항목 산출), 유료(💰) = 라이선스 구매·제휴 필요 데이터예요. 데모는 70%가 실데이터(19/27건)예요.',
    keywords: ['실데이터', '추정', '유료', '분류', '기준', '신뢰', '⭐', '△'],
    related: ['데이터 출처 표기 의미'],
  },
  // ... 4 more QA (사용자 작성)
];
```

**작성 원칙** (사용자 검토 필요):
- 질문은 KOAMI 청중이 실제로 물을 만한 표현 (전문용어 회피)
- 답변은 3~5문장 이내, 실 수치·근거 명시
- keywords 5~10개 (한국어·영어 변형 다 포함)
- related로 다른 FAQ 연결 -> 챗봇 탐색 가능

**진행 방식**: 5.1과 동일.

### 5.3 사용자 기여 점검 체크리스트

```
□ data-tour.ts 5 step 검토
□ cq-tour.ts 5 step 검토
□ ontology-tour.ts 5 step 검토
□ graph-tour.ts 6 step 검토
□ scenario-tour.ts 6 step 검토
□ compare-tour.ts 4 step 검토
□ plan-tour.ts 4 step 검토
□ data-faq.ts 5 QA 검토
□ cq-faq.ts 5 QA 검토
□ ontology-faq.ts 5 QA 검토
□ graph-faq.ts 5 QA 검토
□ scenario-faq.ts 5 QA 검토
□ compare-faq.ts 5 QA 검토
□ plan-faq.ts 5 QA 검토
```

---

## 6. DoD

### F052 (Spotlight 투어)
- [ ] `SpotlightTour.tsx`·`useTour.ts` 신규
- [ ] 7페이지 `data-tour-id` 부착
- [ ] 7페이지 tour ts 모듈 (5.1 사용자 검토 완료 콘텐츠)
- [ ] HeaderBar 도움말 버튼 (❓) 추가 + 현재 페이지 투어 재시작
- [ ] localStorage 1회 자동 표시 동작
- [ ] a11y: dialog role·focus trap·Esc·reduce-motion
- [ ] typecheck/lint/test PASS
- [ ] Playwright 검증: 7페이지 자동 시작 + 버튼 재시작 + 콘솔에러0
- [ ] 라이브 배포 (real 모드 유지)

### F053 (도움말 챗봇)
- [ ] `HelpChatbot.tsx` 신규
- [ ] 7페이지 FAQ ts 모듈 (5.2 사용자 검토 완료 콘텐츠)
- [ ] 라우트 인식 -> pageKey 자동 매핑
- [ ] FAQ 키워드 매칭 -> 답변 표시 (점수순)
- [ ] LLM 토글 옵션 (기본 OFF, 시연 안정)
- [ ] AppLayout 전역 마운트 + 7페이지 토글 동작
- [ ] a11y: dialog role·focus trap·Esc·body scroll lock
- [ ] typecheck/lint/test PASS
- [ ] Playwright 검증: 7페이지 토글·FAQ 매칭·LLM OFF 기본·콘솔에러0
- [ ] 라이브 배포 (real 모드 유지)

---

## 7. 일정·리스크

### 일정 (Master in-session 1세션 묶음)

| Phase | 작업 | 시간 |
|---|---|---|
| P1 | 컴포넌트 신규 (SpotlightTour·useTour·HelpChatbot) | ~40m |
| P2 | data-tour-id 부착 7페이지 + tour ts 모듈 7개 초안 | ~30m |
| P3 | chatbot FAQ ts 모듈 7개 초안 | ~30m |
| P4 | AppLayout 통합 (헤더 버튼 + 챗봇 전역 마운트) | ~15m |
| P5 | typecheck/lint/test + Playwright 7페이지 검증 | ~25m |
| P6 | **사용자 콘텐츠 검토·정제 사이클 (5.1·5.2)** | 사용자 ~30~60m |
| P7 | 라이브 배포 + 라이브 스모크 | ~15m |

총 Claude 작업 ~2.5h + 사용자 검토 ~30~60m. F040~F046 in-session 패턴 답습.

### 리스크

| ID | 리스크 | 대응 |
|---|---|---|
| R1 | data-tour-id 부착 시 기존 컴포넌트 diff 발생 -> F046 a11y 회귀 | 부착은 `data-` 속성만(스타일·동작 무관). 영향 0 확인 후 진행 |
| R2 | SpotlightTour cytoscape 캔버스 위 표시 시 z-index 충돌 | overlay z-index 9999 + cytoscape 컨테이너 z-index 비교 검증 |
| R3 | 챗봇 LLM 옵션 비용 (F009 동일 KV rate-limit이지만 새 트래픽) | 기본 OFF + 토글 명시 (UI에 "실 LLM 호출" 라벨) + 세션 5회 cap |
| R4 | 콘텐츠 영업 톤 일관성 (Claude 초안 vs 사용자 검토 갭) | 1페이지 샘플 Claude 작성 -> 사용자 검토 후 톤 확정 -> 나머지 6페이지 |
| R5 | Lighthouse Performance 점수 추가 페널티 (F051 v0.2 80~90) | SpotlightTour는 첫 1회만 motion, HelpChatbot은 closed 상태 DOM minimal. 측정 후 회귀 확인 |
| R6 | 모바일 풀스크린 챗봇이 v0.2 사이드바와 충돌 | 모바일 표시 시 사이드바 강제 close (z-index 우선) |

---

## 8. 시행 순서

1. 본 Plan 커밋
2. 컴포넌트 P1 + 페이지 P2 부착 (코드)
3. 콘텐츠 P3 - **Claude가 7페이지 tour·FAQ 초안 작성** (사용자 결정 옵션 a, 가장 빠름)
4. P4 통합 + P5 검증
5. **사용자 콘텐츠 검토** (5.3 체크리스트, 정제 사이클)
6. 정제 반영 + 라이브 배포

> Step 5에서 사용자가 톤·문구 정제 -> Claude가 일괄 반영 = F040 customerAsk 정제(2026-05-28) 답습 패턴.
