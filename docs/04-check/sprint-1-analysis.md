# Sprint 1 — M1 빌드 이송 Gap 분석

> Plan/Design ↔ 구현 대조. Match Rate 산출 + 잔존 갭 명시.

**Date**: 2026-05-24
**Sprint**: 1 (F001~F006)
**Branch**: sprint/1

---

## 1. Match Rate 산출

### 1.1 자동 검증 (가중치 70%)

| 검증 | 결과 |
|------|------|
| `pnpm typecheck` (turbo cache 우회 직접 호출) | 0 error |
| `pnpm lint` (eslint strict, max-warnings 0) | 0 error |
| `pnpm test` (vitest scoring) | 9/9 PASS |
| `pnpm build` | 성공 (JS 213KB / gz 70KB, CSS 51KB / gz 10KB) |
| `pnpm dev` boot + GET / | 200 OK |
| `grep -r 'window.parent' src/` (host-protocol 제거) | 0건 |

**자동 100%.**

### 1.2 Design Module Migration Map §2.1 (가중치 15%)

| # | 프로토타입 → 타겟 | 결과 |
|:--:|------|:---:|
| 1 | icons.jsx + DataMark → components/icons.tsx + DataMark.tsx | ✅ |
| 2 | data.jsx → data/mock/*.ts + graph-layout/*.json | ✅ |
| 3 | primitives.jsx → components/primitives/*.tsx (Tabs 시연 미사용 → 의도적 제외) | ✅ |
| 4 | kgraph.jsx → components/KGraph.tsx | ✅ |
| 5 | shell.jsx → shell/AppHeader.tsx + useHashRoute.ts | ✅ |
| 6 | page_landing.jsx → features/landing/LandingPage.tsx | ✅ |
| 7 | page_rnd.jsx → features/rnd/{S4Page,useRndRecommendation,scoring}.ts(x) | ✅ |
| 8 | page_toluene.jsx → features/toluene/{S6Page,TradeChart,WordCloud,AnomalyPanel}.tsx | ✅ |
| 9 | page_about.jsx → features/about/{AboutOntologyPage,AboutDataPage}.tsx | ✅ |
| 10 | tweaks-panel.jsx → components/tweaks/TweaksPanel.tsx + store/tweaksStore.ts (postMessage 제거) | ✅ |
| 11 | app.jsx → App.tsx + main.tsx | ✅ |
| - | KITA PoC.html → index.html | ✅ |
| - | axis/*.css + app.css → styles/ | ✅ |

**모듈 매핑 13/13 (Tabs 의도적 제외 = 100%).**

### 1.3 Plan §3.1 Functional Requirements (가중치 15%)

| ID | 요구 | 결과 |
|----|------|:---:|
| FR-01 | Vite+React18+TS strict 구동 (dev/build/preview) | ✅ |
| FR-02 | Zustand 3-store (weights/hints/tweaks) 전역 + hoverRowId 등 로컬 유지 | ✅ |
| FR-03 | Repository 패턴 — Hook 경유, 컴포넌트 직접 데이터 접근 0 | ✅ |
| FR-04 | Landing 이송 — Hero CTA + 시나리오 카드 2개 | ✅ |
| FR-05 | S4 스코어링 동일 — 정규화→가중합→hint boost (vitest 9 PASS) | ✅ |
| FR-06 | S4 부수 — 프리셋·도메인·예산·기간·Top5 토글·hover·What-If Mock | ✅ |
| FR-07 | S6 이송 — 지식그래프·TradeChart·기업표 hover·워드클라우드·이상치·KPI | ✅ |
| FR-08 | 출처 메타 타입 강제 — 누락 시 컴파일 에러 | ✅ |
| FR-09 | 그래프 좌표 JSON + boost config 외부화 | ✅ |
| FR-10 | About 2화면 정적 이송 | ✅ |

**FR 10/10 = 100%.**

### 1.4 Match Rate 최종

| 카테고리 | 가중 | 점수 |
|---------|:---:|:---:|
| 자동 검증 | 70% | 100% |
| Design 모듈 매핑 | 15% | 100% |
| Plan FR | 15% | 100% |
| **합계** | 100% | **100%** |

**자동 검증 가능 영역은 100%.** 33개 수동 회귀(시연 시점)는 별도 트랙.

---

## 2. 잔존 갭 / Sprint 2 이월

| 항목 | 상태 | 근거 |
|------|------|------|
| 33개 인터랙션 수동 회귀 | 시연 시점 사용자 검증 | Plan §4.1 — 자동화 불가 |
| Tabs 컴포넌트 | 의도적 제외 | 프로토타입 page_rnd.jsx에서 import만 있고 미사용 (Design §2.1 11파일 매핑에서 제외) |
| force-layout 스크립트 (`gen-graph-layout.mjs`) | 보류 | Plan §2.2 OOS — hand-tuned 좌표가 재현성·시각 충실 |
| Tweaks 패널 드래그 이동 | 생략 | 원본 530줄 중 드래그 로직 — 시연 동작에 비필수 (정지형 우하단 fixed) |
| Tweaks "EDITMODE-BEGIN/END" 호스트 sync | 제거 | Design §4 명시 — host postMessage 폐기 |
| Playwright 스모크 | 보류 | Plan §4.2 (옵션) — 여력 시. 33 체크리스트로 대체 |
| 첫 로딩 <2s · 재계산 <100ms 실측 | 시연 환경 측정 | 빌드 사이즈로는 PASS 추정 (gz JS 70KB) |

---

## 3. 의도적 안전 강화 (Design 대비 +항목)

| 영역 | Design | 구현 |
|------|------|------|
| What-If markdown 렌더 | raw HTML 주입 사용 가능 (S1 안전 명시) | **React 노드 빌더로 raw HTML 회피** — XSS 원천 차단, S2/F009 sanitizer 도입 불요 |
| graph-layout 좌표 누락 | 빌드/런타임 가드 (Design §6) | `console.warn` + viewBox 중앙 fallback 구현 |
| ESLint strict | 명시 없음 | `--max-warnings 0`, unused-locals/params, `noUncheckedIndexedAccess` strict tsconfig |

---

## 4. 결론

- **자동 검증 영역 Match Rate 100%** → pdca-iterator 불요, Step 6 (Report) 진행.
- **수동 회귀 33개**는 시연 직전 사용자 검증 트랙 (체크리스트 `docs/03-do/sprint-1-regression-checklist.md`).
- **Sprint 2 (M2) 착수 조건 충족**: 빌드 이송 완결, 격리 아키텍처 확보, CF Pages 배포 시작 가능.
