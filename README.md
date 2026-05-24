# KITA — GIVC × 온톨로지 인터랙티브 데모

KT DS Enterprise사업본부 AX컨설팅팀 / 서민원 책임

**Prototype 리뷰용 시연 사이트**. "GIVC 위에 온톨로지를 얹으면 무엇이 가능한가"를 한 화면에 보여주는 PoC.

> SSOT: [`SPEC.md`](./SPEC.md) — F-item, Sprint 계획, DoD.
> 가이드: [`CLAUDE.md`](./CLAUDE.md) — 기술 결정·컨벤션·보안.

## 빠른 시작

```bash
pnpm install
pnpm dev          # http://localhost:5173 (Vite dev server)
pnpm build        # tsc --noEmit + vite build → dist/
pnpm preview      # http://localhost:4173 (production preview)
pnpm typecheck    # tsc --noEmit (turbo cache 우회 검증용)
pnpm lint
pnpm test         # vitest (S4 스코어링 9 케이스)
```

> 요구: Node ≥ 18.18, pnpm 9.x.

## 폴더 구조 (Sprint 1)

```
src/
├─ main.tsx                 # entrypoint
├─ App.tsx                  # 라우팅 + 테마 적용 + Tweaks
├─ shell/                   # AppHeader, useHashRoute
├─ components/
│  ├─ icons.tsx             # Lucide 인라인 SVG (24×24)
│  ├─ DataMark.tsx          # ⭐/△/※ 출처 칩
│  ├─ KGraph.tsx            # 지식그래프 SVG + hover/dim
│  ├─ primitives/           # Card·Badge·ScoreBar·Slider·KPI·Hints·Callout·WhatIfChat
│  └─ tweaks/               # TweaksPanel (host-protocol 제거, localStorage persist)
├─ features/
│  ├─ landing/              # F002 LandingPage
│  ├─ rnd/                  # F003 S4 — scoring.ts / useRndRecommendation / S4Page
│  ├─ toluene/              # F004 S6 — TradeChart / WordCloud / AnomalyPanel / S6Page
│  └─ about/                # AboutOntologyPage, AboutDataPage
├─ store/                   # Zustand: weights / hints / tweaks(persist)
├─ data/
│  ├─ mock/                 # TS fixtures (F005 source 필수 타입)
│  ├─ graph-layout/         # F006 좌표 JSON 스냅샷 + mergeLayout()
│  └─ repository/           # Rnd / Toluene Repository (Mock 구현)
├─ types/                   # Provenance, Candidate, GraphNode, Tweaks 등 (React 비의존)
└─ styles/                  # AXIS CSS (그대로 이송)

config/
└─ hint-boosts.json         # F006 boost 계수 외부화

docs/
├─ 01-plan/features/sprint-1-m1-migration.plan.md
├─ 02-design/features/sprint-1-m1-migration.design.md
└─ 03-do/sprint-1-regression-checklist.md
```

## 핵심 결정 (PRD §6, Plan §6)

- **Vite + React 18 + TypeScript (strict)** SPA
- **Zustand** — weights / hints / tweaks 전역 (`hoverRowId` 등 순수 UI는 로컬)
- **Repository 패턴** — `Component → Hook → Repository → Mock` (S2+에서 GIVC 구현체 교체)
- **출처 메타 타입 강제** — `Provenance = 'real'|'est'|'virt'` (누락=컴파일 에러)
- **그래프 좌표 JSON 스냅샷** — `data/graph-layout/{s4,s6}.layout.json` (hand-tuned 보존)
- **boost 계수 외부화** — `config/hint-boosts.json` (Mock과 분리)
- **Tweaks host-protocol 제거** — postMessage → localStorage + Zustand persist
- **What-If markdown** — React 노드 빌더 (raw HTML 주입 금지, XSS 원천 차단)
- **hash router** — `#/` 경로 (CF 정적 배포 호환, SPA fallback 불필요)

## 데이터 출처 표기 (필수)

| 표기 | source 값 | 의미 |
|---|---|---|
| ⭐ 실 | `real` | GIVC/외부 출처 실데이터 |
| △ 추정 | `est` | 합리적 추론값 |
| ※ 가상 | `virt` | 시연용 가상 데이터 |

모든 표·차트·그래프 노드는 `source` 필드 필수. 누락 시 `tsc --noEmit` 에러.

## 다음 Sprint

- **S2 (M2)**: F007 Cloudflare Pages 배포 / F008 접근제어 / F009 What-If 실 LLM (CF Workers AI, `/api/chat`, 세션 3회 rate limit)
- **S3 (M3)**: F010 About 본격 / F011 GIVC 정적 export 일부 임베드 / F012 시연 준비 (스크립트·녹화·EN 옵션)

## 보안

- `.dev.vars`는 LLM API 키 5종 보관 — gitignore. 권한 600. **절대 커밋 금지**.
- 공개 시연 URL은 비공개 공유 + 시연 후 만료 (PRD §6.4).
- `grep -r 'window.parent' src/` → 0건이 host-protocol 제거 검증 기준.
