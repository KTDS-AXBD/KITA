# Sprint 16 Plan — F030 디자인 시스템 + 앱 셸

> 작성: 2026-05-27 · Sprint 16 · F030 · KOAMI-REQ-030

---

## §1. 목적

v0.32 "GIVC Ontology Platform" 프로토타입 기준 **사이드바 대시보드 셸**을 KOAMI SPA에 이식한다.
기존 상단 탭 네비 → 좌측 사이드바(240px) + 상단 브레드크럼 헤더(48px) 구조로 전환.
**7페이지 라우팅·렌더 게이트**이므로 후속 Sprint(S17~S21)의 선행 조건.

---

## §2. 현재 상태 (fs 실측)

| 항목 | 현재 상태 |
|------|----------|
| 앱 셸 | `src/shell/AppHeader.tsx` + `src/styles/app.css` — 상단 탭 5개 |
| 디자인 토큰 | `src/styles/colors_and_type.css` (AXIS 변수 `--axis-*`) |
| 라우팅 | `src/shell/useHashRoute.ts` — 해시 라우터, `/`, `/scenario/rnd`, `/scenario/s6`, `/about/*`, `/survey` |
| 컴포넌트 | `src/components/` — 기존 AXIS 기반 |
| features/ | `about/`, `landing/`, `rnd/`, `s6/`, `survey/` |
| cytoscape | 미설치 (pnpm 의존성 없음) |

---

## §3. 범위 (F030)

### 3a. 디자인 토큰 (v0.32 CSS)
- `src/styles/v032-tokens.css` 신규: v0.32 CSS 변수(`--bg-base`, `--bg-card`, `--accent #E60012`, `--radius 12px`, `--sidebar-width 240px`, `--header-height 48px`, 노드 컬러 11종)
- Pretendard 폰트: `index.html` CDN link 추가
- `app.css` 확장: sidebar dashboard 레이아웃 클래스

### 3b. 앱 셸 재구성
- `src/shell/Sidebar.tsx` 신규: 사이드바 MAIN 5 + REFERENCE 2 + footer
- `src/shell/HeaderBar.tsx` 신규: 브레드크럼 + 도메인 배지
- `src/shell/AppLayout.tsx` 신규: `.app-layout { display: flex }` 래퍼
- `src/shell/index.ts` 갱신: Sidebar·HeaderBar·AppLayout export 추가
- `src/App.tsx` 갱신: AppHeader → AppLayout + Sidebar + HeaderBar

### 3c. 라우팅 확장
7개 신규 라우트 추가:
```
/platform/data       데이터 현황
/platform/cq         CQ 관리
/platform/ontology   온톨로지 정의
/platform/graph      지식그래프
/platform/scenario   시나리오 분석
/platform/compare    비교 검증
/platform/plan       추진 계획
```
기존 `/`, `/scenario/rnd`, `/scenario/s6`, `/about/*`, `/survey` 보존 (REF 보조메뉴로 흡수)

### 3d. 공용 컴포넌트 (`src/components/platform/`)
| 컴포넌트 | 파일 | 역할 |
|---------|------|------|
| KpiCard | `KpiCard.tsx` | label + value + sub, shadow/border |
| DataTable | `DataTable.tsx` | thead/tbody + hover, 13px |
| EntityCard | `EntityCard.tsx` | color-block + attrs + count badge |
| Tooltip | `Tooltip.tsx` | 3 type: `.attr` / `.info-tip` / `.rel-attr` |
| CypherBlock | `CypherBlock.tsx` | 다크 배경 + syntax coloring (keyword/entity/prop/comment) |
| Toggle | `Toggle.tsx` | on/off 슬라이더 (도메인 토글 등) |
| Timeline | `Timeline.tsx` | Phase 타임라인 (Phase 0~4) |
| Modal | `Modal.tsx` | 오버레이 + closeOnBackdrop |
| Badge | `Badge.tsx` | 출처배지(실/추정/유료) + 상태배지(verified/draft/pending) |

### 3e. 플레이스홀더 페이지 (7개)
각 `/platform/*` 라우트에 "Coming in Sprint N" 스켈레톤 페이지:
- `src/features/platform/data/DataStatusPage.tsx`
- `src/features/platform/cq/CqManagePage.tsx`
- `src/features/platform/ontology/OntologyPage.tsx`
- `src/features/platform/graph/GraphPage.tsx`
- `src/features/platform/scenario/ScenarioPage.tsx`
- `src/features/platform/compare/ComparePage.tsx`
- `src/features/platform/plan/PlanPage.tsx`

### 3f. cytoscape PoC (`src/features/platform/graph/CytoscapePoC.tsx`)
- `pnpm add cytoscape @types/cytoscape` 설치
- 더미 10노드 그래프 렌더
- 번들 크기 확인: `pnpm build` 후 `dist/assets` 크기 기록
- 렌더 성능: cytoscape 초기화 <200ms 목표

---

## §4. 보존 (변경 없음)

- `src/features/landing/` · `src/features/rnd/` · `src/features/s6/` · `src/features/survey/`
- `src/features/about/` (REF 보조 메뉴에서 링크만 추가)
- `src/store/`, `src/data/`, `src/types/`, `src/worker/`
- `src/shared/`, `config/`, `migrations/`
- `vitest` 테스트 기존 71개 PASS 유지

---

## §5. 파일 매핑 (신규/수정)

```
신규:
  src/styles/v032-tokens.css
  src/shell/Sidebar.tsx
  src/shell/HeaderBar.tsx
  src/shell/AppLayout.tsx
  src/components/platform/KpiCard.tsx
  src/components/platform/DataTable.tsx
  src/components/platform/EntityCard.tsx
  src/components/platform/Tooltip.tsx
  src/components/platform/CypherBlock.tsx
  src/components/platform/Toggle.tsx
  src/components/platform/Timeline.tsx
  src/components/platform/Modal.tsx
  src/components/platform/Badge.tsx
  src/components/platform/index.ts
  src/features/platform/data/DataStatusPage.tsx
  src/features/platform/cq/CqManagePage.tsx
  src/features/platform/ontology/OntologyPage.tsx
  src/features/platform/graph/GraphPage.tsx
  src/features/platform/graph/CytoscapePoC.tsx
  src/features/platform/scenario/ScenarioPage.tsx
  src/features/platform/compare/ComparePage.tsx
  src/features/platform/plan/PlanPage.tsx

수정:
  src/App.tsx           (라우팅 확장 + 셸 교체)
  src/shell/index.ts    (Sidebar·HeaderBar·AppLayout export)
  src/styles/app.css    (sidebar layout 추가)
  index.html            (Pretendard CDN 추가)
  package.json          (cytoscape 의존성)
  pnpm-lock.yaml        (자동)
```

---

## §6. DoD (Definition of Done)

- [ ] `pnpm typecheck` PASS (app + worker)
- [ ] `pnpm lint` PASS (0 warning)
- [ ] `pnpm test` PASS (기존 71개 이상)
- [ ] `pnpm build` 성공, bundle 크기 기록
- [ ] 사이드바 7개 메뉴 클릭 → 해당 페이지 라우팅 동작
- [ ] 브레드크럼 현재 페이지 반영
- [ ] cytoscape PoC: 10노드 그래프 렌더 확인, 초기화 <200ms
- [ ] 기존 5개 라우트(`/`, `/scenario/*`, `/about/*`, `/survey`) 정상 동작
- [ ] `--accent: #E60012` + Pretendard 폰트 적용 확인

---

## §7. 제외 (다음 Sprint)

- 7페이지 실제 콘텐츠 구현 (S17~S20)
- 도메인 토글 (F034·F035)
- koami-givc D1 real 데이터 연동 (F038)
- 배포 (F039)
