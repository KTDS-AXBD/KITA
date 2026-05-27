---
id: KOAMI-PLAN-017
title: Sprint 17 — 정적 콘텐츠 3종 (F031·F036·F037)
sprint: 17
f_items: [F031, F036, F037]
status: in_progress
created: 2026-05-27
---

# Sprint 17 Plan — 정적 콘텐츠 3종

## 1. 목표 (Goal)

S16(F030)에서 구축한 AppLayout/Sidebar 셸 위에 정적 콘텐츠 3개 페이지를 완성한다.

- **F031** — 데이터 현황 페이지: 27건 데이터소스 현황표 + KPI 4종
- **F036** — 비교 검증 페이지: chatGIVC(LLM+RAG) vs 온톨로지+KG 2-카드 + 6축 비교표
- **F037** — 추진 계획 페이지: Phase 0~4 타임라인 + CQ Tier1/Tier2 목록 + 푸터

## 2. 현황 파악 (Baseline)

### S16 스텁 현황
- `DataStatusPage.tsx` — KpiCard 4종 + Badge 범례 완성, 데이터소스 현황표는 placeholder
- `ComparePage.tsx` — 전체 placeholder
- `PlanPage.tsx` — Timeline 컴포넌트 사용, Phase 5건 기본 데이터 있음. CQ 목록·푸터 placeholder

### 재사용 가능 컴포넌트 (`src/components/platform/`)
| 컴포넌트 | 사용 위치 |
|---------|----------|
| `KpiCard` | DataStatusPage (이미 적용) |
| `Badge` | DataStatusPage table |
| `DataTable` | DataStatusPage table, ComparePage 6축 |
| `Timeline` | PlanPage (이미 적용) |

### v0.32 프로토타입 레퍼런스
- `docs/spec/기진회_2차세미나_프로토타입_v0.32_260527.html`
  - LINE 1028~1350: Page 1 데이터 현황 (27건 테이블)
  - LINE 2823~2895: Page 6 비교 검증 (2-카드 + 6축)
  - LINE 2897~2963: Page 7 추진 계획 (타임라인 + CQ + 푸터)

## 3. 도메인 결정 (req-interview 확정)

- **기본 도메인**: 소부장 공작기계 (KOAMI 고객, 변경 불가)
- **호르무즈**: 보조 토글 (CQ-001, F035 시나리오 분석에서 토글)
- F031 데이터소스: 소부장 공작기계 우선 정렬, 호르무즈 소스 통합 (단일 테이블)
- F036 비교 질의: 소부장 공작기계 도메인 ("공작기계 국산화 R&D 기업 선정")
- F037 CQ Tier1: CQ-002 소부장, CQ-001 호르무즈

## 4. 구현 범위 (Scope)

### F031 — DataStatusPage

**변경 파일**:
- `src/features/platform/data/DataStatusPage.tsx` — 기존 placeholder → 실 테이블

**추가 파일**:
- `src/features/platform/data/dataSources.ts` — 27건 데이터소스 Mock fixtures
- `src/components/platform/StatusDot.tsx` — 상태 닷 컴포넌트 (green/amber/gray)
- `src/components/platform/StatusDot.tsx` export → `src/components/platform/index.ts`

**데이터 구조**:
```ts
type DataStatus = 'connected' | 'collecting' | 'unavailable';
interface DataSource {
  id: number;
  name: string;
  badge: BadgeVariant;  // 'real' | 'estimate' | 'paid'
  source: string;
  usage: string;
  method: string;
  updated: string;
  status: DataStatus;
  domain: 'sobujiang' | 'hormuz' | 'both';
}
```

**테이블 컬럼**: 상태 | # | 데이터명 | 구분 | 출처 | 활용 영역 | 수집 방법 | 최종 갱신

**정렬**: 소부장(sobujiang·both) 먼저, 호르무즈(hormuz) 나중

### F036 — ComparePage

**변경 파일**:
- `src/features/platform/compare/ComparePage.tsx` — 전체 재구현

**2-카드 레이아웃**:
- 좌: chatGIVC (LLM+RAG) — 채팅버블 Q+A + ✗ 주석 4개
- 우: 온톨로지+KG — Top3 영향 바 + 인과경로 박스 + ✓ 주석 6개

**6축 비교표** (DataTable 재사용):
| 비교 축 | LLM+RAG | 온톨로지+KG |
| 인과관계 추적 | ... | ... |
| 설명가능성 | ... | ... |
| 재현성 | ... | ... |
| 시나리오 예측 | ... | ... |
| 대응 옵션 | ... | ... |
| 데이터 신뢰 | ... | ... |

**도메인**: 소부장 공작기계 ("공작기계 국산화 R&D 기업 선정 근거가 뭔가요?")

### F037 — PlanPage

**변경 파일**:
- `src/features/platform/plan/PlanPage.tsx` — 타임라인 업데이트 + CQ 섹션 추가

**타임라인 업데이트** (기존 Timeline 컴포넌트 재사용, 데이터만 교체):
```ts
Phase 0: 준비 (5/26~5/30, done)
Phase 1: 시나리오 확정 (6/2~6/6, active)
Phase 2: KG 구축 (6/9~6/13, upcoming)
Phase 3: 시연 준비 (6/16~6/20, upcoming)
Phase 4: 리뷰 (6/23~6/27, upcoming)
```

**CQ 섹션** (신규):
- Tier 1 — 시연 대상 (CQ-002 소부장 R&D 기업, CQ-001 호르무즈 영향 품목)
- Tier 2 — 고객 확인 후 추가 (CQ3~CQ7, 공작기계 도메인)

**푸터**: "KT DS AX컨설팅팀 | 2026"

## 5. 비수정 파일 (No-touch)

- `src/App.tsx` (라우트 이미 연결됨)
- `src/shell/` (S16 완성)
- 기존 시나리오 페이지 (`S4Page`, `S6Page`)
- `src/components/platform/DataTable.tsx`, `KpiCard.tsx`, `Badge.tsx`, `Timeline.tsx`

## 6. DoD (완료 기준)

- [ ] `/platform/data` — KPI 4종 + 27건 테이블 (상태닷·배지·전체 컬럼) 렌더
- [ ] `/platform/compare` — 2-카드 + 6축 비교표 렌더, 콘솔에러 0
- [ ] `/platform/plan` — Phase 0~4 타임라인 + CQ Tier1/2 목록 + 푸터 렌더
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` 0 warnings/errors
- [ ] `pnpm test` 71+ PASS (기존 회귀 0)
- [ ] `pnpm build` PASS

## 7. 순서

1. `StatusDot` 컴포넌트 추가 + `dataSources.ts` fixtures 작성 → `DataStatusPage` 완성
2. `ComparePage` 전체 구현 (인라인 스타일, DataTable 재사용)
3. `PlanPage` 타임라인 데이터 교체 + CQ 섹션 + 푸터 추가
4. typecheck/lint/test/build 검증
