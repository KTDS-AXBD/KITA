# KOAMI — GIVC × 온톨로지 인터랙티브 데모

KT DS Enterprise사업본부 AX컨설팅팀 / 서민원 책임

**Prototype 리뷰용 시연 사이트**. "GIVC 위에 온톨로지를 얹으면 무엇이 가능한가"를 한 화면에 보여주는 PoC.

🔗 **라이브: <https://koami.minu.best>** (CF Access 보호 — 허용 이메일만 접근, 데이터 100% Mock)

> SSOT: [`SPEC.md`](./SPEC.md) — F-item, Sprint 계획, DoD.
> 가이드: [`CLAUDE.md`](./CLAUDE.md) — 기술 결정·컨벤션·보안.

## 빠른 시작

```bash
pnpm install
pnpm dev            # http://localhost:5173 (Vite dev server)
pnpm build          # tsc --noEmit + vite build → dist/
pnpm preview        # http://localhost:4173 (= serve:offline, 오프라인 백업)
pnpm typecheck      # tsc(app, DOM) + tsc(worker, WebWorker) 양쪽
pnpm lint
pnpm test           # vitest (S4 스코어링 9 케이스)

# 배포 (F007/F009 — Cloudflare Workers)
cp wrangler.jsonc.example wrangler.jsonc   # 최초 1회 (custom_domain·name 설정)
pnpm deploy:dryrun  # 번들 검증 (CF 인증 불필요)
pnpm deploy:cf      # 빌드 + wrangler deploy  (⚠️ pnpm deploy 아님 — 내장명령 충돌)
```

> 요구: Node ≥ 18.18, pnpm 9.x. 배포/장애 대응은 [`docs/deploy-guide.md`](./docs/deploy-guide.md), 시연은 [`docs/demo-script.md`](./docs/demo-script.md)·[`docs/operations-manual.md`](./docs/operations-manual.md).

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
│  ├─ s6/                   # F004 S6 — TradeChart / WordCloud / AnomalyPanel / S6Page (F021 toluene→s6 리네임)
│  └─ about/                # AboutOntologyPage, AboutDataPage
├─ store/                   # Zustand: weights / hints / tweaks(persist)
├─ data/
│  ├─ mock/                 # TS fixtures (F005 source 필수 타입)
│  ├─ graph-layout/         # F006 좌표 JSON 스냅샷 + mergeLayout()
│  └─ repository/           # Rnd / S6 / Gvc Repository (Mock 구현)
├─ types/                   # Provenance, Candidate, GraphNode, Tweaks 등 (React 비의존)
├─ worker/                  # F009 Hono Worker — /api/chat (CF Workers AI) + ASSETS fallthrough
└─ styles/                  # AXIS CSS (그대로 이송)

config/
├─ hint-boosts.json         # F006 boost 계수 외부화
└─ whatif.ts                # F009 LLM 모델·시스템 프롬프트 (도메인 튜닝 지점)

wrangler.jsonc.example      # 배포 설정 템플릿 (실제 wrangler.jsonc는 gitignore — URL 비노출)
tsconfig.worker.json        # Worker 전용 (WebWorker 타입)

docs/
├─ demo-script.md           # F011 시연 스크립트
├─ operations-manual.md     # F011 운영 매뉴얼
├─ deploy-guide.md          # 배포/롤백/만료 (S2)
├─ qa-checklist.md          # QA 런북 (S2)
├─ 01-plan/features/        # sprint-1/2/3 · f009 plan
├─ 02-design/features/      # sprint-1/2 · f009 design
├─ 03-do/sprint-1-regression-checklist.md
└─ 05-act/sprint-1-report.md
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
- **What-If 하이브리드 LLM (F009)** — 토글 OFF=정적 Mock(기본), ON=Hono Worker `/api/chat` → CF Workers AI(`llama-3.1-8b-fp8`). **KV rate-limit 세션 3회**(in-memory는 분산 Worker 미작동 → KV 필수). 같은 Worker가 정적 자산도 서빙(ASSETS fallthrough)

## 데이터 출처 표기 (필수)

| 표기 | source 값 | 의미 |
|---|---|---|
| ⭐ 실 | `real` | GIVC/외부 출처 실데이터 |
| △ 추정 | `est` | 합리적 추론값 |
| ※ 가상 | `virt` | 시연용 가상 데이터 |

모든 표·차트·그래프 노드는 `source` 필드 필수. 누락 시 `tsc --noEmit` 에러.

## 진행 상태

| 마일스톤 | 상태 |
|---|---|
| **M1 빌드 이송** (S1, F001~F006) | ✅ Vite+TS SPA merged |
| **M2 배포** (S2, F007~F008) | ✅ CF Workers 배포 + 접근제어·QA (데모시점 운영은 `qa-checklist.md` 런북) |
| **What-If LLM** (F009) | ✅ Hono `/api/chat` + CF Workers AI + KV rate-limit |
| **M3 시연 준비** (S3, F010~F012) | F010 About ✅ · F011 시연스크립트/매뉴얼 ✅ (백업 영상 녹화·리허설=수동) · F012 Tweaks ✅, 다국어 EN 보류(P2) |

> 시연 직전 런북: [`docs/qa-checklist.md`](./docs/qa-checklist.md) + [`docs/demo-script.md`](./docs/demo-script.md). URL: <https://koami.minu.best> (CF Access 보호 — 참석자 이메일 사전 등록).

## 보안

- `.dev.vars`는 LLM API 키 5종 보관 — gitignore. 권한 600. **절대 커밋 금지**.
- 데모 URL <https://koami.minu.best> — **CF Access 게이팅**(지정 이메일 + OTP/Google). 데이터 100% Mock + 영업멘트 중립화. 접근제어·이메일 관리 [`docs/deploy-guide.md`](./docs/deploy-guide.md).
- `grep -r 'window.parent' src/` → 0건이 host-protocol 제거 검증 기준.
