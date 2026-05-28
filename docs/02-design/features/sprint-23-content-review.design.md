---
id: KOAMI-DESIGN-023
type: design
sprint: 23
features: [F054]
created: 2026-05-29
status: approved
---

## §1 개요

F054 Sprint 23: F052/F053 콘텐츠 정제 폴리시. 33 tour step + 35 FAQ를 영업 톤·실 수치 정확성 기준으로 1차 정제 후 사용자 검토 사이클을 거쳐 라이브 재배포. 컴포넌트/인프라 변경 0건(데이터 모듈만).

## §2 영향 범위

```
src/
├── data/
│   ├── tour/
│   │   ├── data-tour.ts         (5 step body/title)
│   │   ├── cq-tour.ts           (4 step body/title)
│   │   ├── ontology-tour.ts     (4 step body/title)
│   │   ├── graph-tour.ts        (5 step body/title)
│   │   ├── scenario-tour.ts     (6 step body/title)
│   │   ├── compare-tour.ts      (4 step body/title)
│   │   └── plan-tour.ts         (4 step body/title)
│   └── chatbot/
│       ├── data-faq.ts          (5 QA q/a/related)
│       ├── cq-faq.ts            (5 QA q/a/related)
│       ├── ontology-faq.ts      (5 QA q/a/related)
│       ├── graph-faq.ts         (5 QA q/a/related)
│       ├── scenario-faq.ts      (5 QA q/a/related)
│       ├── compare-faq.ts       (5 QA q/a/related)
│       └── plan-faq.ts          (5 QA q/a/related)
└── (컴포넌트 변경 0)

tests/playwright/
└── tour-chatbot.spec.ts         (F053 dataFaq[0] 패턴 유지 회귀)
```

변경 영역: **데이터 모듈 14파일 (tour 7 + faq 7)**. 컴포넌트·라우팅·상태관리 무변경.

## §3 영업 톤 패턴 (Claude 정제 가이드)

F040 customerAsk/reportRef 정제 패턴 답습. 핵심 4원칙.

### 3.1 가치 앵커 우선 (먼저 가치 명시, 액션은 후)

**Before** (기능 설명형):
```
title: "데이터 현황"
body: "여기서 GIVC가 어떤 데이터를 얼마나 보유하는지 한눈에 보세요."
```

**After** (가치 앵커형):
```
title: "데이터 신뢰성 한눈에"
body: "실데이터 19건·추정 4건·유료 4건 분류로 GIVC 데이터 신뢰성을 즉시 가늠하세요. 출처별 가용성 차이가 시연 신뢰의 핵심입니다."
```

### 3.2 구체 액션 안내 (다음 클릭/행동 명시)

**Before**:
```
a: "온톨로지 페이지에서 엔티티와 관계를 정의해요."
```

**After**:
```
a: "왼쪽 '온톨로지 정의' 메뉴 -> 엔티티 13종·관계 8건 -> 첫 행 클릭으로 상세 패널 열기. CQ와 연결된 관계가 강조됩니다."
```

### 3.3 실 수치 정확성 (SSOT 정합)

| SSOT 위치 | 수치 | 사용처 |
|---|---|---|
| MEMORY.md "라이브" | 활성 버전 ID (예: `1e8ba185`) | 챗봇 환영 메시지 (옵션) |
| F031 데이터 현황 | 실 19/추정 4/유료 4 = 27건 = 70% real | data-tour·data-faq |
| F034 그래프 | sobujiang 24노드·hormuz 44노드 | graph-tour·graph-faq |
| F032 CQ | CQ 7건·S1/S3/S7 backlog·S4🥇·S6🥈 | cq-tour·cq-faq |
| F033 온톨로지 | 엔티티 13·관계 8·제약 3 | ontology-tour·ontology-faq |
| F035 시나리오 | 5단계 추론·A~E 결과 | scenario-tour·scenario-faq |
| F036 비교 | 6축 비교표·chatGIVC vs 온톨로지 | compare-tour·compare-faq |
| F037 추진계획 | Phase 0~4 타임라인·CQ Tier1/Tier2 | plan-tour·plan-faq |

### 3.4 KOAMI 영업 화법 (산업부·소부장 톤)

- 어투: 해요체(반존대), 긴 대시 기호 금지(글로벌 어투 규칙, "-" 하이픈 사용)
- 부처 명칭: "산업부" 또는 "산업부 산업통상자원부" (F040에서 산자부->산업부 정정 완료)
- 고객 호칭: "KOAMI 담당자", "소부장 담당", "산업부 관계자" 등 구체 페르소나
- 가치 앵커 키워드: "신뢰성", "근거 추적", "재현성", "설명가능성", "자발적 데이터 회신"

## §4 FAQ 질문 키워드 패턴

F053 키워드 매칭(`dataFaq[0]` 정확 매치)을 유지하면서 고객 발화 패턴 보강.

### 4.1 질문 작성 원칙

- **명사구 + 동사** 자연어 (현재는 Claude가 짧은 키워드만 작성한 경우 있음)
- **고객이 실제 할 만한 질문**: "이 KPI 어떻게 산출돼요?", "출처는 어디예요?"
- **여러 패턴**: 같은 의도의 질문 2~3가지 키워드 풀로 매칭 강화

### 4.2 답변 본문 구성

```
[가치 앵커 1줄]
[구체 답변 2~3줄]
[다음 액션 안내 1줄]
```

예시 (data-faq.ts QA #1):

**Before**:
```
{ q: "실데이터 분류", a: "실데이터 19건, 추정 4건, 유료 4건이에요." }
```

**After**:
```
{
  q: "실데이터 분류, 데이터 신뢰성, 출처 종류, GIVC 데이터 구성",
  a: "GIVC 데이터는 실데이터 19건·추정 4건·유료 4건 = 27건이에요. 실데이터 70%로 시연 핵심 수치는 검증 가능합니다. 표 헤더의 '출처' 컬럼을 보면 한국은행 ECOS·관세청 UNIPASS·DART 등 공식 출처가 명시돼 있어요.",
  related: ["출처별 가용성", "추정 데이터 활용"]
}
```

## §5 검증 방안

### 5.1 자동 검증

```bash
pnpm typecheck   # tsc app + worker PASS
pnpm lint        # 0 errors
pnpm test        # 110+ tests PASS
pnpm exec playwright test tests/playwright/tour-chatbot.spec.ts  # 7페이지 회귀
```

### 5.2 사용자 검토 인터페이스

페이지 단위 batch (혼란 방지):

```
=== Batch 1/7: data 페이지 ===
[tour step #1]
  Before: "데이터 현황"
  After:  "데이터 신뢰성 한눈에"
  [✅승인 / ✏️수정: ___ / ⏭️skip]

[tour step #2] ...
[FAQ QA #1] ...
...
```

검토 결과 반영 -> 재검증 -> 다음 batch.

### 5.3 라이브 회귀 게이트

배포 전:
- Playwright 7페이지 키워드 매치 PASS (`dataFaq[0]` 정확 매칭 + 6페이지 추가)
- 콘솔 에러 0
- typecheck/lint/test PASS

배포 후:
- curl `/`·`/platform/{data,cq,ontology,graph,scenario,compare,plan}` 8라우트 302 (CF Access)
- `wrangler deployments list` 새 버전 @100% 활성
- 활성 버전 ID를 F054 본문 + MEMORY 라이브 행에 갱신

## §6 위험 시나리오와 대응

| 시나리오 | 대응 |
|---|---|
| 사용자 검토에서 7페이지 중 일부만 검토 완료 | 검토 완료 batch만 부분 PR로 분리·라이브 반영 |
| 키워드 패턴 변경으로 회귀 실패 (`dataFaq[0]` 매칭 안 됨) | Playwright 회귀에서 사전 차단·정제 시 키워드 풀 확장으로 회귀 보존 |
| 실 수치 오차 발견 (SSOT vs 콘텐츠) | §3.3 SSOT 표 기준으로 일괄 정정 + MEMORY 동시 갱신 |
| 라이브 배포 후 LLM fallback 활성화로 비용 증가 | 기본 OFF 유지 정책 명시·사용자 토글 시점 모니터링 |

## §7 후속 작업 (out of scope)

- 다국어 EN 버전 tour/FAQ (F010 P2 보류)
- LLM 톤 fine-tune (현재 정적 FAQ 위주)
- 음성 안내 (시연 환경 무관)
