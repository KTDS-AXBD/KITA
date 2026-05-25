# Sprint 1 — M1 빌드 이송 (F001~F006) Design Document

> **Summary**: 11개 프로토타입 `.jsx`(window-global) → Vite+React18+TS 모듈 구조 매핑, Zustand 3-store / Repository 인터페이스 / Provenance 타입 강제 / 스코어링 명세.
>
> **Project**: KOAMI PoC (GIVC × 온톨로지 데모)
> **Version**: (pre-1.0)
> **Author**: 서민원 책임 + Claude Code
> **Date**: 2026-05-24
> **Status**: Draft
> **Planning Doc**: [sprint-1-m1-migration.plan.md](../../01-plan/features/sprint-1-m1-migration.plan.md)

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | Schema | N/A (Mock 100%, DB 없음) |
| Phase 2 | Conventions | △ (CLAUDE.md + 본 문서 §10) |
| Phase 3 | Mockup | ✅ `docs/spec/claude design/` (동작 프로토타입 = 설계 원본) |
| Phase 4 | API Spec | N/A (S1 백엔드 없음, What-If 실 LLM은 S2/F009) |

---

## 1. Overview

### 1.1 Design Goals

1. **동작 100% 보존** — 33개 인터랙션(Plan §4.1)을 시각·동작 동일하게 이송. 시연 화면이 바뀌지 않는다.
2. **프로덕션 아키텍처 확립** — window-global → ES 모듈, 로컬상태 → Zustand 전역(3종), 직접 데이터 접근 → Repository 격리.
3. **출처 메타 타입 강제** — `source` 누락이 컴파일 에러가 되도록 데이터 모델 설계 (F005 "누락 0").
4. **GIVC 격리** — 향후 실데이터 연동 시 Repository 구현체만 교체하면 되도록 인터페이스/Mock 분리.

### 1.2 Design Principles

- **Behavior parity first** — 새 기능 0. 구조만 재배선. 결과값/픽셀이 프로토타입과 일치.
- **Domain은 순수** — `types/`는 React/Zustand 비의존 (Provenance, Candidate 등 순수 타입).
- **Single source of truth** — 전역 상태는 Zustand store, 데이터는 Repository. 컴포넌트는 소비자.
- **YAGNI** — force-layout 스크립트·다국어 전면·실 LLM은 S1 제외 (Plan §2.2).

---

## 2. Architecture

### 2.1 Module Migration Map (핵심 — 11파일 → 타겟)

| # | 프로토타입 (window-global) | 줄수 | → 타겟 (ES module/TS) | Layer | 변환 핵심 |
|---|---------------------------|-----|----------------------|-------|----------|
| 1 | `src/icons.jsx` (Icons + DataMark) | 61 | `src/components/icons.tsx` + `src/components/DataMark.tsx` | Presentation | `Object.assign(window,{Icons,DataMark})` → named export |
| 2 | `src/data.jsx` (KitaData) | 255 | `src/data/mock/*.ts` + `src/data/graph-layout/*.json` | Infrastructure | 좌표 분리(F006), `source` 필수 타입 적용(F005) |
| 3 | `src/primitives.jsx` | 204 | `src/components/primitives/*.tsx` (Card·Badge·ScoreBar·SliderRow·Hints·KpiStrip·Callout·ProvenanceLegend·WhatIfChat·Tabs) | Presentation | `const {Icons}=window` → import |
| 4 | `src/kgraph.jsx` (KGraph) | 137 | `src/components/KGraph.tsx` | Presentation | `window.DataMark` → import, node 타입 |
| 5 | `src/shell.jsx` (AppHeader·useHashRoute·navigate) | 67 | `src/shell/AppHeader.tsx` + `src/shell/useHashRoute.ts` | Presentation | navigate 전역 → 모듈 함수 |
| 6 | `src/page_landing.jsx` | 176 | `src/features/landing/LandingPage.tsx` | Presentation | window.navigate → import |
| 7 | `src/page_rnd.jsx` (S4) | 296 | `src/features/rnd/S4Page.tsx` + `src/features/rnd/useRndRecommendation.ts` | Presentation+Application | 로컬상태→Zustand, 스코어링→hook, KitaData→Repository |
| 8 | `src/page_toluene.jsx` (S6) | 249 | `src/features/toluene/S6Page.tsx` + `TradeChart.tsx`·`WordCloud.tsx`·`AnomalyPanel.tsx` | Presentation | 내부 컴포넌트 분리, KitaData→Repository |
| 9 | `src/page_about.jsx` | 162 | `src/features/about/{AboutOntologyPage,AboutDataPage}.tsx` | Presentation | 정적 |
| 10 | `tweaks-panel.jsx` (useTweaks·TweaksPanel·controls) | 530 | `src/components/tweaks/*.tsx` + `src/store/tweaksStore.ts` | Presentation+App | **host postMessage 제거** → localStorage+Zustand |
| 11 | `src/app.jsx` (App·routing) | 93 | `src/App.tsx` + `src/main.tsx` | Presentation | TWEAK_DEFAULTS→store, createRoot→main |
| — | `KITA PoC.html` | 35 | `index.html` | — | CDN script 제거, `<script type=module src=/src/main.tsx>` |
| — | `axis/*.css` + `app.css` | 1659 | `src/styles/` (import in main) | — | 그대로 이송, `.dark`/`data-style` 셀렉터 유지 |

### 2.2 Data Flow

```
[Zustand store]  weights / activeHints / tweaks
       │ (subscribe)
       ▼
[S4Page] ──uses──▶ [useRndRecommendation(weights, activeHints)]
       │                     │ (reads)
       │                     ▼
       │            [RndRepository] ──▶ [Mock DataSource (TS fixtures)]
       │                     │              + config/hint-boosts.json
       │                     ▼
       │            ranked Top5 + matchAccuracy  ← 스코어링(§5.3)
       ▼
[Top5 표/그래프/KPI]  (hoverRowId = 로컬 useState)
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| S4Page (Presentation) | useRndRecommendation, store, primitives | 화면 조립 |
| useRndRecommendation (Application) | RndRepository, types, hint-boosts config | 스코어링 |
| RndRepository (Infra) | Mock DataSource, types | 데이터 격리 |
| store/* (App) | types | 전역 상태 |
| types/* (Domain) | (없음 — 순수) | 계약 |

---

## 3. Data Model (Domain Types — F005 핵심)

### 3.1 Provenance (출처 메타 — 타입 강제)

```typescript
// src/types/provenance.ts — 순수 도메인, 외부 비의존
export type Provenance = 'real' | 'est' | 'virt';   // ⭐실 / △추정 / ※가상

// 출처가 "필수"임을 타입으로 강제하는 헬퍼.
// 메트릭별 출처를 가진 엔티티는 SourceMap<K>로 강제 → 키 누락 시 컴파일 에러.
export type SourceMap<K extends string> = Record<K, Provenance>;
```

### 3.2 S4 (R&D) 엔티티

```typescript
// src/types/rnd.ts
import type { Provenance, SourceMap } from './provenance';

export type CandidateMetricKey = 'rndGrowth' | 'salesGrowth' | 'patentCount' | 'defaultRisk';

export interface Candidate {
  id: string;
  name: string; biz: string; region: string;
  rndGrowth: number; salesGrowth: number; patentCount: number; defaultRisk: number;
  coreType: 1 | 2;                         // 1 핵심 / 2 예비
  sources: SourceMap<CandidateMetricKey>;  // ← 4개 메트릭 출처 전부 필수 (누락=컴파일 에러)
  evidenceKeys: string[];                  // 그래프 인접 노드
  note: string;
}

export interface ScoredCandidate extends Candidate {
  score: number;                            // 0~1
  _components: Record<CandidateMetricKey, number>;  // 정규화 성분 (디버그/그래프)
}

export interface Weights { rnd: number; sales: number; patent: number; risk: number; }
export type HintId = 'h_rndcall' | 'h_patent' | 'h_movement' | 'h_finance';
export type ActiveHints = Partial<Record<HintId, boolean>>;
```

### 3.3 지식그래프 타입 (F006 — 좌표 분리)

```typescript
// src/types/graph.ts
import type { Provenance } from './provenance';

export type NodeType = 'company' | 'rnd' | 'metric' | 'hscode' | 'country';

export interface GraphNode {
  id: string; type: NodeType; label: string;
  r: number;                                // 반지름
  meta?: Record<string, string>;            // tooltip 표시 (table/column/출처 등)
  source: Provenance;                        // ← 노드 출처 필수
}
export interface GraphLayoutNode { id: string; x: number; y: number; }  // ← 좌표 스냅샷(별도 JSON)
export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: [string, string][];
  viewBox: string;
}
```

> **F006 좌표 분리**: 현 `data.jsx`의 노드는 `{id,type,label,x,y,r,meta,source}`로 좌표가 섞여 있음. → `GraphNode`(좌표 제외) + `src/data/graph-layout/{s4,s6}.layout.json`(`GraphLayoutNode[]`)으로 **분리**. 런타임에 `node.id`로 좌표 머지. 기존 hand-tuned 값 그대로 스냅샷화(시각 변동 0).

### 3.4 S6 (톨루엔) 엔티티 — 출처 메타 정비 대상

```typescript
// src/types/toluene.ts
export interface TolueneCompany {
  id: string; name: string; biz: string; share: string; sales: string;
  coreType: 1 | 2; role: string;
  source: Provenance;        // ← 신규 필수 (현 프로토타입은 <DataMark kind="real"> 인라인 → 데이터로 이전)
}
export interface TradeSeries {
  quarters: string[]; exports: number[]; imports: number[];
  anomalies: { idx: number; label: string }[];
  source: Provenance;        // ← 신규 필수 (현 차트 하단 'GIVC mart.lnk0951a' 하드코딩 → 데이터로)
}
export interface NewsWord { w: string; s: number; t: 'pos' | 'neg' | 'dim' | ''; }
// WordCloud는 시연용 가상(virt) 일괄 — 컬렉션 레벨 source 부여
```

> **F005 정비 범위**: S4 후보군은 이미 `sources:{}` 구조화 ✅. **신규 출처 필드 부여 필요**: `S6_COMPANIES`(인라인 real) · `S6_TRADE`(차트 하단 하드코딩) · `S4_SIMILAR_CASES`(인라인 virt) · `S6_WORDS`(컬렉션 virt) · `anomalies`(인라인 real). 인라인 `<DataMark kind="...">` 리터럴 → 데이터 필드 참조로 전환.

---

## 4. State Management (Zustand — 전역 3 store)

> Plan 결정: **weights + activeHints + tweaks 전역**. `hoverRowId`·`topLayout`(임시 보기 토글)·What-If 입력은 컴포넌트 **로컬 유지**.

```typescript
// src/store/weightsStore.ts
interface WeightsState {
  weights: Weights;
  setWeight: (k: keyof Weights, v: number) => void;
  applyPreset: (p: { domain: string; budget: number; period: number; weights: Weights }) => void;
  // 입력값도 함께 (프리셋이 일괄 변경하므로)
  domain: string; budget: number; period: number;
  setDomain: (d: string) => void; setBudget: (n: number) => void; setPeriod: (n: number) => void;
}

// src/store/hintsStore.ts — 시나리오별 분리 (S4/S6 독립 토글)
interface HintsState {
  s4: ActiveHints; s6: Record<string, boolean>;
  toggleS4: (id: HintId) => void;
  toggleS6: (id: string) => void;
}

// src/store/tweaksStore.ts — host postMessage 대체 (localStorage 영속)
interface TweaksState {
  flavor: 'classic' | 'foundry'; theme: 'light' | 'dark';
  hintsPosition: 'right' | 'bottom' | 'modal';
  top5Layout: 'table' | 'card'; langMode: 'ko' | 'en';
  set: <K extends keyof TweaksValues>(k: K, v: TweaksValues[K]) => void;
}
// persist 미들웨어로 localStorage('koami-tweaks') 저장. window.parent.postMessage 전부 제거.
```

> **⚠️ Tweaks host-protocol 제거**: `tweaks-panel.jsx`의 `useTweaks`는 `window.parent.postMessage({type:'__edit_mode_set_keys'})` + `__edit_mode_available`/`__activate_edit_mode` 리스너로 프로토타입 호스트와 통신. 프로덕션엔 부모 호스트 없음 → ① postMessage 호출 전부 제거 ② 패널 open 상태는 로컬 + 토글 버튼 자체 제공(기존엔 호스트 툴바가 토글) ③ 값 영속은 zustand `persist`. **`grep window.parent` 0건**이 검증 기준.

---

## 5. 핵심 로직 명세

### 5.1 라우팅 (hash router 유지)

5경로 + 404. `useHashRoute()` 훅(`hashchange` 리스너) 그대로 이송. `navigate(path)`는 모듈 export. **react-router 미도입** — 기존 `#/` URL 보존 + CF 정적 호스팅 SPA fallback 불요 + 시연 새로고침 안전.

### 5.2 KGraph hover/highlight (I17 — 난이도 상)

`activeId = hoverId || highlightFrom`. lit = activeId + 인접 노드/엣지, 나머지 dim. tooltip은 마우스 좌표 추종 + `node.meta` 표시 + `<DataMark kind={node.source}>`. 로직 동일 이송, 좌표만 layout JSON 머지.

### 5.3 S4 스코어링 (I13/I14 — 데모의 심장, boost config 외부화)

**현 프로토타입 공식** (`page_rnd.jsx` L37~62) — 보존 대상:
```
정규화: rndN=rndGrowth/max, salesN, patentN=(patent/max)*patentBoostSign, riskN=(1-risk/max)*riskBoostSign
가중합: raw = Σ(wᵢ·metricNᵢ) / max(wSum, 0.0001)        ← Σ=0 방어
최종:   score = min(1, raw*matchBoost + signalBoost)
boost:  matchBoost = h_rndcall?1.0:0.85   patentBoostSign = h_patent?1.10:1.0
        riskBoostSign = h_finance?1.05:1.0  signalBoost = h_movement?0.03:0
        matchAccuracy = h_rndcall?0.88:0.65
```

**F006 boost 외부화** — 위 7개 매직넘버를 `config/hint-boosts.json`으로 분리 (DeepSeek R3: Mock과 분리해 계수 재조정·신뢰성 격리):
```jsonc
// config/hint-boosts.json (스키마 — 값은 현 프로토타입과 동일)
{
  "h_rndcall": { "matchBoost": 1.0,  "matchAccuracy": 0.88 },
  "base":      { "matchBoost": 0.85, "matchAccuracy": 0.65 },
  "h_patent":  { "patentSign": 1.10 },
  "h_finance": { "riskSign": 1.05 },
  "h_movement":{ "signalAdd": 0.03 }
}
```

> 🧩 **구현 기여 요청 (Do 단계)**: boost를 config에서 읽어 score에 적용하는 `applyBoosts()` 순수 함수 (5~10줄). 곱셈(match/patent/risk)·덧셈(signal)·clamp(min 1) 합성 방식이 데모 내러티브("이 데이터가 더 있으면 정확도 65→88%")를 결정하므로 도메인 오너(서민원) 입력이 가치 있음. Do 단계에서 시그니처+TODO 위치 준비 후 요청.

**vitest 단위테스트**: 기본 가중치(0.40/0.20/0.30/0.10) + hint OFF → Top5 순위·점수 고정값 스냅샷. hint ON 시 matchAccuracy 0.88 검증.

### 5.4 TradeChart (I26 — 난이도 상)

SVG line/area 수동 계산(`x(i)`, `y(v)`, path d 생성), 16분기, 수출(area+line)·수입(dashed)·이상치 마커(circle+dashed line). 순수 함수 이송, 데이터는 Repository.

### 5.5 What-If Mock (I22) — S1은 정적

`setTimeout(900ms)` + prompt 매칭/기본응답 + markdown(`**bold**`/`` `code` ``) 렌더. raw HTML 주입은 **정적 prompt 한정이라 S1 안전**. S2(F009) 실 LLM 연동 시 sanitizer(DOMPurify) 도입 — F009 Plan에 명시.

---

## 6. Error Handling

| 상황 | 처리 |
|------|------|
| 가중치 전 항목 0 (Σ=0) | `Math.max(wSum, 0.0001)` 방어 (기존 유지) |
| Top5 빈 결과 | 안내 메시지 (PRD §4.1 edge case) |
| 존재하지 않는 라우트 | 404 + 홈 링크 (기존 app.jsx 유지) |
| 슬라이더 연속 조작 | 현 <50ms → 프로덕션 빌드 실측 후 debounce 여부 결정 (PRD §4.1) |
| graph-layout JSON에 노드 좌표 누락 | 빌드/런타임 가드 — 좌표 없는 노드 경고 + viewBox 중앙 fallback |

---

## 7. Security Considerations

- [x] raw HTML 주입: S1 정적 prompt만 → 안전. S2 실 LLM 시 sanitize (이월)
- [x] 외부 입력 없음 (Mock 100%, 폼은 슬라이더/select 제약값)
- [ ] 공개 URL 접근제어: S2(F008) 범위
- [x] `.dev.vars` LLM 키: gitignore 유지, S1 미사용

---

## 8. Test Plan

| Type | Target | Tool |
|------|--------|------|
| Unit | S4 스코어링 + applyBoosts (I13/I14) | Vitest |
| 회귀 | 33개 인터랙션 체크리스트 (Plan §4.1) | 수동 + 스크린샷 대조 |
| Smoke (옵션) | Landing→S4→S6 라우팅·핵심 토글 | Playwright (여력 시) |

**핵심 케이스**: 기본 가중치 Top5 순위 고정 / hint ON→정확도 0.88 / 가중치 0 방어 / hover→그래프 하이라이트 / Tweaks 영속(새로고침 유지).

---

## 9. Clean Architecture

### 9.4 Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| Provenance·Candidate·GraphNode·Weights 등 타입 | **Domain** | `src/types/` |
| weightsStore·hintsStore·tweaksStore | Application | `src/store/` |
| useRndRecommendation (스코어링) | Application | `src/features/rnd/` |
| RndRepository·TolueneRepository | Infrastructure | `src/data/repository/` |
| Mock fixtures·graph-layout JSON·hint-boosts | Infrastructure | `src/data/mock/`·`graph-layout/`·`config/` |
| S4Page·S6Page·Landing·About·primitives·KGraph·DataMark·Tweaks | Presentation | `src/features/`·`src/components/`·`src/shell/` |

### 9.2 Dependency Rule

`Presentation → Application → Domain ← Infrastructure`. 컴포넌트는 Repository 직접 접근 금지(Hook 경유). `types/`는 순수(React/Zustand 비의존).

---

## 10. Coding Convention

| Target | Rule | Example |
|--------|------|---------|
| 컴포넌트 파일 | PascalCase.tsx | `S4Page.tsx`, `KGraph.tsx` |
| 훅/유틸 | camelCase.ts | `useRndRecommendation.ts`, `useHashRoute.ts` |
| store | `{name}Store.ts` | `weightsStore.ts` |
| 폴더 | kebab-case | `features/rnd/`, `data/graph-layout/` |
| 타입 | PascalCase | `Candidate`, `Provenance` |
| import 순서 | 외부→절대(@/)→상대→type→css | §template 10.2 |

- 경로 alias `@/` → `src/` (vite.config.ts + tsconfig paths)
- 언어: 한국어 1순위(주석·UI). 출처 표기 ⭐/△/※ 규칙 = CLAUDE.md

---

## 11. Implementation Guide

### 11.2 Implementation Order (의존성 순)

1. [ ] **F001-a 스캐폴드** — `pnpm create vite` (react-ts), zustand·vitest 설치, tsconfig strict, ESLint, `@/` alias, `index.html`, `src/main.tsx`
2. [ ] **F001-b CSS 이송** — `axis/*.css` + `app.css` → `src/styles/`, main에서 import. 다크/flavor 셀렉터 동작 확인
3. [ ] **F005 타입** — `types/{provenance,rnd,graph,toluene}.ts` (source 필수)
4. [ ] **F006 데이터** — `data.jsx` → `data/mock/*.ts`(타입 적용) + `graph-layout/{s4,s6}.layout.json`(좌표) + `config/hint-boosts.json`
5. [ ] **F001-c store** — weights/hints/tweaks Zustand (tweaks persist)
6. [ ] **F001-d Repository** — Rnd/Toluene Repository 인터페이스 + Mock 구현
7. [ ] **공통 컴포넌트** — icons·DataMark·primitives·KGraph (window→import)
8. [ ] **F002 Landing** + shell(AppHeader·useHashRoute) + App.tsx 라우팅
9. [ ] **F003 S4** — useRndRecommendation(스코어링+applyBoosts) + S4Page + vitest
10. [ ] **F004 S6** — TradeChart·WordCloud·AnomalyPanel + S6Page
11. [ ] **About 2화면** + Tweaks 패널(host-protocol 제거)
12. [ ] **회귀 검증** — 33개 체크리스트 + 빌드/typecheck(turbo 우회)/lint + 성능 실측

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-24 | 초안 — 11파일 모듈 매핑, Provenance/엔티티 타입(source 강제), Zustand 3-store, Repository, 스코어링+boost 외부화 명세, 12단계 구현순서 | 서민원 + Claude Code |
