# Sprint 1 — M1 빌드 이송 (F001~F006) Planning Document

> **Summary**: 빌드 없는 CDN React+Babel 프로토타입을 Vite + React 18 + TypeScript 프로덕션 SPA로 이송 (Zustand 전역 상태 + Repository 데이터 레이어 + 출처 메타 타입 강제).
>
> **Project**: KITA PoC (GIVC × 온톨로지 데모)
> **Version**: (pre-1.0, package.json 미생성 — F001에서 셋업)
> **Author**: 서민원 책임 + Claude Code
> **Date**: 2026-05-24
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 동작하는 디자인 프로토타입이 CDN+Babel 방식이라 첫 로딩 느림·번들 없음·시연 환경 불안정 → 프로덕션 부적합. 게다가 11개 파일이 `window` 전역 패턴·컴포넌트 로컬 상태·host postMessage 의존이라 "복사 이송"이 불가능. |
| **Solution** | Vite + React 18 + **TypeScript** SPA로 전면 재배선. **Zustand**(weights/hints/tweaks 전역) + **Repository 패턴**(Mock 격리) + 출처 메타(`real\|est\|virt`)를 **타입으로 강제**. 그래프 좌표는 기존 hand-tuned 정적 좌표를 JSON 스냅샷화(force-layout 스크립트 보류). |
| **Function/UX Effect** | 33개 인터랙션(라우팅·S4 스코어링·그래프 hover·Hints 토글·Tweaks)을 100% 동일 동작으로 보존. 첫 로딩 <2s, S4 재계산 <100ms 유지. |
| **Core Value** | "시연 가능한 프로덕션 PoC"의 기반. 빌드·배포(S2)·시연(S3)의 전제. 향후 GIVC 실데이터 연동 시 Repository 레이어만 교체하면 되는 격리 구조 확보. |

---

## 1. Overview

### 1.1 Purpose

빌드 없는 디자인 프로토타입(`docs/spec/claude design/`, CDN React 18 + Babel standalone)을 **프로덕션 Vite+React+TypeScript SPA**로 이송한다. 모든 화면·인터랙션을 동일하게 보존하되, 내부 구조를 프로덕션 아키텍처(모듈/전역상태/데이터레이어/타입)로 재배선한다.

### 1.2 Background

설문 중심 접근의 한계로 **데모 우선 전략**으로 전환(PRD §2). 프로토타입으로 데모 컨셉은 검증됐으나, 프로덕션 배포·안정 시연을 위해 빌드 체계가 필요하다. M1은 이후 M2(배포)·M3(시연준비)의 하드 선행이다.

**⚠️ 핵심 배경 (fs 실측, 2026-05-24):** 프로토타입은 "동작하는 디자인"이지 "이송 가능한 아키텍처"가 아니다. 단순 파일 복사가 불가하며, 아래 3가지 구조적 갭이 R1(공수 과소평가) 리스크의 실체다.
1. **window-global 모듈 흉내** — 11개 파일 전부 `const {...} = window`(21곳) + `Object.assign(window, {...})`(10곳). ES import/export 전면 재배선 대상.
2. **컴포넌트 로컬 상태** — `weights`/`activeHints`/`topLayout`이 페이지 안 `useState`. Zustand 전역화는 복사가 아닌 추출·리팩토링.
3. **Tweaks host-protocol** — `useTweaks`가 `window.parent.postMessage(__edit_mode_*)`로 프로토타입 호스트와 통신. 프로덕션엔 부모 호스트 없음 → 영속화 방식 대체 필요.

### 1.3 Related Documents

- SSOT: `SPEC.md` §5 (F001~F006), §6 (Sprint 1 DoD)
- PRD: `docs/req/prd-final.md` (§4 기능범위, §6 기술결정) — *로컬 전용(영업기밀)*
- 이송 원본: `docs/spec/claude design/` (KITA PoC.html + src/*.jsx + axis/*.css)
- 프로젝트 가이드: `CLAUDE.md` (출처 표기 규칙, 컨벤션)

---

## 2. Scope

### 2.1 In Scope (F001~F006)

- [ ] **F001** Vite + React 18 + **TypeScript** 프로젝트 스캐폴딩 (pnpm, ESLint, tsconfig strict)
- [ ] **F001** Zustand store 셋업 (weights / activeHints / tweaks 전역) + Repository 데이터 레이어(`Component → Hook → Repository → Mock DataSource`)
- [ ] **F001** AXIS 디자인 시스템 CSS 이송 (`axis/colors_and_type.css`, `axis/axis-styles.css`, `app.css` — 약 1,659줄 + Tweaks 인라인 스타일)
- [ ] **F001** 11개 `.jsx` → `.tsx` 모듈 전환 (window-global → ES import/export)
- [ ] **F002** Landing 페이지 (Hero CTA, 시나리오 카드 2, mini-preview SVG, 데모 위치/화면흐름 섹션)
- [ ] **F003** S4 R&D 추천 (입력 폼, 프리셋 3, 가중치 슬라이더 4 실시간 재계산, Top5 표/카드 토글, 근거 그래프, 유사사례, 반대추천, KPI, What-If Mock)
- [ ] **F004** S6 톨루엔 (검색, 지식그래프, TradeChart SVG, 핵심·예비 기업표, 워드클라우드, 이상치 패널, KPI)
- [ ] **F005** 출처 표기 시스템 — `Provenance = 'real'|'est'|'virt'` 타입을 데이터 모델에 **필수 필드로 강제** + `<DataMark>` + tooltip. 인라인 리터럴 → 데이터 필드로 정비
- [ ] **F006** 그래프 좌표 **기존 hand-tuned 정적 좌표를 JSON 스냅샷화** + boost 계수 별도 파일(`config/hint-boosts.json`) 분리
- [ ] About 2화면(ontology/data) 이송 (정적 — F010 본격 개선은 S3)
- [ ] **인터랙션 회귀 체크리스트** (33개 항목 §4.1) 작성 + 통과

### 2.2 Out of Scope

- **F006 force-layout 스크립트** (`gen-graph-layout.mjs`) — 기존 정적 좌표가 이미 재현성 달성 + 시연 비주얼 충실. **보류**(향후 신규 그래프 추가 시 재검토).
- Cloudflare 배포 (F007, Sprint 2)
- What-If 실 LLM 연동 (F009, Sprint 2) — Sprint 1은 기존 setTimeout Mock 응답만 이송
- Tweaks 패널 디자인 변형 고도화·다국어(EN) 전면 (F012, Sprint 3 / P2) — Sprint 1은 기존 Tweaks 동작 보존 수준
- 모바일 반응형 (PRD §4.3 — 데스크톱 시연 전용)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | F-item | Priority | Status |
|----|-------------|--------|----------|--------|
| FR-01 | Vite+React18+TS 빌드 구동 (`pnpm dev`/`build`/`preview`), strict tsconfig 통과 | F001 | High | Pending |
| FR-02 | Zustand store 3종(weights/hints/tweaks) 전역화, hoverRowId 등 순수 UI는 로컬 유지 | F001 | High | Pending |
| FR-03 | Repository 패턴 — `useRndRecommendation` 등 Hook이 Repository 경유 Mock 접근, 컴포넌트 직접 데이터 접근 0 | F001 | High | Pending |
| FR-04 | Landing 이송 — Hero CTA·시나리오 카드 2개 navigate 동작 | F002 | High | Pending |
| FR-05 | S4 스코어링 동일 — 정규화→가중합→hint boost, 가중치 슬라이더 실시간 재계산 결과 프로토타입과 일치 | F003 | High | Pending |
| FR-06 | S4 부수 인터랙션 — 프리셋·도메인·예산·기간·Top5 토글·행hover→그래프하이라이트·What-If Mock | F003 | High | Pending |
| FR-07 | S6 이송 — 지식그래프·TradeChart·기업표 hover·워드클라우드·이상치·KPI | F004 | High | Pending |
| FR-08 | 출처 메타 타입 강제 — 모든 데이터 항목에 `source` 필수, 누락 시 컴파일 에러 | F005 | High | Pending |
| FR-09 | 그래프 좌표 JSON 스냅샷화 + boost 계수 `config/hint-boosts.json` 외부화 | F006 | High | Pending |
| FR-10 | About 2화면 정적 이송 | F010(부분) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| 성능(첫 로딩) | < 2s (PRD §5.1) | `vite build` 후 `preview` Lighthouse/실측 |
| 성능(재계산) | S4 가중치 재계산 < 100ms 유지 (현 <50ms) | 콘솔 `performance.now()` 계측 |
| 빌드 건전성 | `pnpm build` 성공 + `tsc --noEmit` 0 에러 + ESLint 0 에러 | CI/로컬 (⚠️ turbo cache 우회 실행 — `tsc --noEmit` 직접) |
| 출처 표기 | 표·차트·그래프 노드 100% ⭐/△/※ (누락 0) | 타입 강제 + 수동 점검 |
| 재현성 | 그래프 좌표 스냅샷 + Mock 고정 → 시연마다 동일 결과 | 시각 회귀 (스크린샷 대조) |
| 무네트워크 | 실 LLM 토글 OFF 시 완전 정적 구동 (오프라인) | localhost preview 오프라인 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] `pnpm dev`/`build`/`preview` 정상 (Landing + S4 + S6 + About 구동)
- [ ] `tsc --noEmit` 0 에러 (turbo cache 우회 실측), ESLint 0 에러
- [ ] **인터랙션 회귀 체크리스트 33개 전수 통과** (이송 후 프로토타입과 동일 동작)
- [ ] 출처 표기 누락 0 (타입 강제 + 수동 점검)
- [ ] S4 재계산 <100ms, 첫 로딩 <2s 실측
- [ ] 핸드오버 기반: README에 실행 방법 기재 (배포 가이드는 S2)

#### 인터랙션 회귀 체크리스트 (33개 — 이송 전수 목록화, R1 방어 산출물)

| # | 영역 | 인터랙션 | 이송 난이도 |
|---|------|---------|:----------:|
| I1 | 라우팅 | hash router 5경로(/·/scenario/rnd·/scenario/toluene·/about/ontology·/about/data)+404 | 중 |
| I2 | 헤더 | 5탭 nav active 상태 + brand→home | 하 |
| I3 | 헤더 | theme(dark class)·flavor(data-style) `<html>` 적용 | 중 |
| I4 | Tweaks | 패널 토글/드래그 + flavor·theme·hints위치·top5·언어 컨트롤 (**host-protocol 대체**) | 상 |
| I5 | Landing | Hero CTA 2버튼 navigate | 하 |
| I6 | Landing | 시나리오 카드 2개 클릭 navigate | 하 |
| I7 | Landing | ProvenanceLegend + 데모위치/화면흐름 섹션 | 하 |
| I8 | S4 | 도메인 select(6) | 하 |
| I9 | S4 | 예산 슬라이더(1~20) | 하 |
| I10 | S4 | 기간 슬라이더(6~36) | 하 |
| I11 | S4 | 프리셋 버튼(3)→domain/budget/period/weights 일괄 적용 | 중 |
| I12 | S4 | 가중치 슬라이더(4)→실시간 재계산 | 중 |
| I13 | S4 | **스코어 계산**(정규화→가중합→boost→matchBoost, Σ=0 방어) | **상** |
| I14 | S4 | Hint 토글(4: rndcall/patent/finance/movement)→boost 재계산 | **상** |
| I15 | S4 | Top5 표/카드 레이아웃 토글 | 중 |
| I16 | S4 | 행 hover→그래프 하이라이트(hoverRowId→KGraph) | 중 |
| I17 | S4 | KGraph 노드 hover→tooltip(출처·meta)+이웃 하이라이트+dim | **상** |
| I18 | S4 | KGraph top5 동적 노드/엣지 필터 | 중 |
| I19 | S4 | KPI strip(4, matchAccuracy 동적) | 하 |
| I20 | S4 | 유사사례 리스트(정적) | 하 |
| I21 | S4 | 반대추천 리스트(정적) | 하 |
| I22 | S4 | What-If chat(입력·추천프롬프트3·Enter·setTimeout Mock·markdown 렌더) | 중 |
| I23 | S4 | DataExpansionHints + currentRows + 데이터확장예시 카드 | 중 |
| I24 | S4 | DataMark 메트릭 셀 전수 | 하 |
| I25 | S6 | 품목 검색(readonly)+프리셋 버튼 4 | 하 |
| I26 | S6 | **TradeChart**(SVG line/area, 16분기, 수출입+이상치 마커) | **상** |
| I27 | S6 | KGraph(S6_GRAPH 정적) | 중 |
| I28 | S6 | 기업표 행 hover→그래프 하이라이트 | 중 |
| I29 | S6 | WordCloud(16단어, 감성 색상) | 하 |
| I30 | S6 | AnomalyPanel | 하 |
| I31 | S6 | Hint 토글(3, boost 로직 없음) | 하 |
| I32 | S6 | KPI strip | 하 |
| I33 | S6 | DataExpansionHints + 데이터확장예시 | 하 |

> 난이도 **상**(6): I4·I13·I14·I17·I26 + (I4의 host-protocol). 이들이 M1 공수의 핵심. 회귀 검증 우선순위 1순위.

### 4.2 Quality Criteria

- [ ] 테스트 커버리지: PoC 데모 특성상 단위테스트 강제 아님 — **스코어링 로직(I13·I14)만 vitest 단위 테스트**(boost 계수 정확성 검증)
- [ ] Zero lint errors, `tsc --noEmit` 0 에러
- [ ] `pnpm build` 성공 + 번들 사이즈 기록 (S2 배포 기준선)
- [ ] (옵션) Playwright 스모크 — 여력 시 (PRD §5.3)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **R1: 이송 공수 과소평가** (외부 AI 3모델 공통) | High | High | **본 Plan의 33개 인터랙션 목록화 + 난이도 분류가 1차 방어.** 난이도 '상' 6개를 먼저 이송·검증. 공수 재추정 → §6.4 참조 |
| TS strict 전환 마찰 (무타입 JSX→.tsx) | Medium | High | 데이터 모델 타입 먼저 정의(F005와 동시) → 페이지는 타입 따라 이송. `tsc` turbo cache 우회 실측(로컬 PASS≠CI PASS 함정) |
| Tweaks host-protocol 대체 누락 | Medium | Medium | `useTweaks` postMessage → localStorage+Zustand 영속화로 교체. 부모 호스트 호출 전부 제거(grep `window.parent`) |
| 그래프 hover/highlight 회귀 (I17) | Medium | Medium | KGraph 좌표 스냅샷 후 시각 대조. tooltip/dim/lit 로직 동일 이식 |
| S4 스코어 결과 불일치 (I13) | High | Medium | 스코어링 vitest 단위테스트로 프로토타입 결과 고정값 검증 |
| What-If raw HTML 주입 XSS | Low | Low | Sprint 1은 정적 prompt만(안전). S2 실 LLM 연동 시 sanitizer(DOMPurify) 도입 재검토 — F009 Plan에 명시 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Selected | Rationale |
|-------|:--------:|-----------|
| Starter | ☐ | 단순 정적 이상 — 전역상태·데이터레이어 필요 |
| **Dynamic** | ☑ | feature 기반 모듈 + (선택)CF Workers 백엔드. 본 PoC에 적합 (.bkit level=Dynamic 일치) |
| Enterprise | ☐ | 과설계 — 솔로 PoC |

### 6.2 Key Architectural Decisions (확정)

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Framework | **Vite + React 18 (SPA)** | PRD §6.2 확정. 기존 JSX/AXIS 자산 이송 |
| Language | **TypeScript 전면** | *(본 Plan 결정)* 출처 메타(F005) 타입 강제, Zustand/Repository 안정성. PRD §6.2 "TS 친화" 의도 충족 |
| State | **Zustand — weights/hints/tweaks 전역** | *(본 Plan 결정)* PRD §6.2 명시 3종. hoverRowId 등 순수 UI는 컴포넌트 로컬 유지 |
| Data Layer | **Repository 패턴** | PRD §6.2. `Component → Hook → Repository → Mock DataSource`. 향후 GIVC 격리 |
| Graph Coords | **기존 정적 좌표 JSON 스냅샷화** | *(본 Plan 결정)* hand-tuned 좌표가 이미 재현성·비주얼 충실. force-layout 스크립트 보류 |
| Styling | **글로벌 CSS 이송** (AXIS 그대로) | 변형 최소·비주얼 보존. CSS custom property + `.dark`/`data-style` 셀렉터 유지 |
| Routing | **hash router 유지** (또는 react-router) | 기존 `#/` 경로 보존. SPA 정적 배포(CF)와 호환 |
| Testing | **Vitest** (스코어링 한정) | I13·I14 boost 정확성만 단위테스트. 전면 커버리지 비강제 |
| Backend | 없음 (S1) | What-If 실 LLM은 S2 (F009) |

### 6.3 Clean Architecture Approach (Dynamic, 제안 폴더 구조)

```
KITA/
├─ index.html               # Vite 엔트리 (CDN script 제거)
├─ package.json             # pnpm, vite, react18, typescript, zustand, vitest
├─ tsconfig.json            # strict
├─ vite.config.ts
├─ config/
│  └─ hint-boosts.json      # F006 — boost 계수 외부화
├─ src/
│  ├─ main.tsx              # createRoot
│  ├─ App.tsx               # 라우팅 + Tweaks (app.jsx 이송)
│  ├─ styles/               # axis/*.css + app.css
│  ├─ shell/                # AppHeader, hash router (shell.jsx)
│  ├─ components/           # primitives(Card/Badge/...), icons, DataMark, KGraph
│  ├─ features/
│  │  ├─ landing/           # F002
│  │  ├─ rnd/               # F003 — S4Page + useRndRecommendation(스코어링)
│  │  ├─ toluene/           # F004 — S6Page + TradeChart/WordCloud
│  │  └─ about/             # About 2화면
│  ├─ store/                # Zustand — weightsStore, hintsStore, tweaksStore
│  ├─ data/
│  │  ├─ repository/        # RndRepository, TolueneRepository (인터페이스)
│  │  ├─ mock/              # data.jsx 이송 (TS fixtures, source 필수)
│  │  └─ graph-layout/      # 좌표 JSON 스냅샷 (F006)
│  └─ types/                # Provenance, Candidate, GraphNode 등 (source 필수)
└─ scripts/                 # (gen-graph-layout.mjs 보류 — 빈 placeholder 가능)
```

> **구현 순서 (의존성):** F001 스캐폴드 → F005 타입(Provenance) + F006 데이터/좌표/boost → F002 Landing → F003 S4 → F004 S6 → About. (데이터 레이어가 화면의 선행)

### 6.4 공수 재추정 (R1 — fs 실측 기반)

| 단계 | 작업 | 난이도 | 추정 |
|------|------|:------:|------|
| F001 | Vite+TS 스캐폴드 + store/repository 골격 + CSS 이송 + 모듈 재배선 골격 | 중상 | 1~1.5일 |
| F005+F006 | 데이터 모델 TS화(source 필수) + 좌표 스냅샷 + boost config | 중 | 0.5~1일 |
| F002 | Landing (대부분 정적) | 하 | 0.5일 |
| F003 | S4 — 스코어링·그래프·What-If (난이도 상 집중) | 상 | 1.5~2일 |
| F004 | S6 — TradeChart·그래프·워드클라우드 | 중상 | 1일 |
| - | About 이송 + 회귀 체크리스트 검증 + 단위테스트 | 중 | 0.5~1일 |
| **합계** | | | **5~7일** |

> SPEC/PRD 원안 "3~5일"보다 **상향(5~7일)**. 근거: 단순 복사가 아닌 ① 모듈 전면 재배선 ② Zustand 추출 ③ Repository 신규 레이어 ④ TS 타이핑 ⑤ 출처 메타 정비 ⑥ Tweaks host-protocol 대체. **R1 리스크 정량화 완료** — SPEC §7 R1 업데이트 권장.

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` 존재 (출처 표기 규칙·컨벤션·기술결정)
- [ ] `docs/01-plan/conventions.md` (없음 — 필요 시 F001에서 ESLint/Prettier로 대체)
- [ ] ESLint/Prettier/tsconfig (**F001에서 신규 생성**)

### 7.2 Conventions to Define/Verify

| Category | Current | To Define | Priority |
|----------|---------|-----------|:--------:|
| Naming | CLAUDE.md(한국어 1순위) | 파일 PascalCase(컴포넌트)/camelCase(hook), 폴더 kebab | High |
| Folder structure | 없음 | §6.3 feature 기반 구조 | High |
| 출처 메타 | 부분(S4만 구조화) | `Provenance` 타입 필수 필드 전면 | High |
| Import order | 없음 | ESLint import/order | Medium |
| Error handling | Σ=0 방어 등 산재 | edge case 명시(가중치 0, Top5 빈결과) | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Create |
|----------|---------|-------|:---------:|
| (없음 — S1) | Mock 100%, 외부 의존 0 | - | ☐ |
| `.dev.vars` (기존) | LLM 키 5종 — S2(F009)에서 사용 | Server | (이미 존재, gitignore) |

---

## 8. Next Steps

1. [ ] `/pdca design sprint-1-m1-migration` — 모듈 매핑표(11파일→타겟), store/repository 인터페이스, 타입 정의 상세
2. [ ] SPEC.md §7 R1 항목 공수 재추정(5~7일) 반영 + F001~F006 상태 📋→🔄
3. [ ] 구현 착수 (F001 스캐폴드 우선)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-24 | 초안 — fs 실측 33개 인터랙션 목록화, 3개 핵심 결정(TS전면·좌표스냅샷·Zustand범위), R1 공수 재추정(5~7일) | 서민원 + Claude Code |
