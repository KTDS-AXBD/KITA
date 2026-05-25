# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 무엇인가

**KITA** — KT DS AX컨설팅팀의 **Prototype 리뷰용 인터랙티브 데모 사이트** PoC. "GIVC 위에 온톨로지를 얹으면 무엇이 가능한가"를 화면으로 보여주고, 시연 중 고객(산자부/산업부 의사결정자)이 자발적으로 추가 데이터를 꺼내게 유도하는 게 목적.

**현재 상태: 🎉 F001~F012 전부 ✅ — 시연 가능 프로덕션 PoC 달성.** Vite+TS+Zustand SPA가 **`https://kita.minu.best`**(CF 커스텀 도메인, **CF Access 게이팅** — 지정 이메일+OTP/Google)에 라이브 구동 + What-If 실 LLM 토글(CF Workers AI, KV rate-limit) + 시연 스크립트·운영 매뉴얼 완비. 남은 건 **서민원 수동 런북**(백업 영상·리허설·실노트북 QA) + 외부 시연일(고객 PM 재지정, 외부 게이트). **신규 트랙: 실데이터 파이프라인 `kita-givc`**(SPEC F013~F017 📋, PRD `docs/req/kita-givc/` 로컬전용) — Mock→실데이터 적재·조회, Phase 1 공개데이터 S6 슬라이스. 핵심 자산:
- **SPEC.md** (루트) — **SSOT**. F-item 상태·Sprint 진행. 작업 기준.
- **프로덕션 소스** (`src/`, `config/`, `wrangler.jsonc.example`) — Vite+TS SPA + Hono Worker(`/api/chat`).
- **`docs/req/prd-final.md`** — PRD (로컬 전용). **`docs/spec/claude design/`** — 원본 프로토타입(이송 참조).
- **PDCA 문서**: `docs/01-plan/`·`docs/02-design/`·`docs/05-act/` (Sprint별 Plan/Design/Report).

## 작업 전 읽을 순서

1. **SPEC.md** — 무엇을 만드는지 (F-item·Sprint·DoD). 모든 작업의 기준.
2. **`docs/req/prd-final.md`** — 왜·누구·성공기준·제약·기술결정 상세. ⚠️ 영업기밀(고객명·전략) 포함이라 **git 제외(로컬 전용)** — 공개 레포엔 없음.
3. **`docs/spec/claude design/`** — 실제 구현 참조. 특히 `src/data.jsx`(Mock+출처 메타), `src/page_rnd.jsx`(S4 스코어링 로직), `KITA PoC.html`(구성).

> `docs/spec/07_PoC_웹사이트_개발기획서_v1.md`(기획서)·`docs/req/`(PRD·인터뷰)는 영업기밀 포함으로 `.gitignore` 처리됨(로컬 전용). 공개 레포는 코드·프로토타입·SPEC.md만 포함.

## 확정된 기술 결정 (prd-final §6)

| 영역 | 결정 |
|------|------|
| 프론트엔드 | **Vite + React 18 (SPA)** — 기존 JSX/AXIS 프로토타입 이송 |
| 상태 관리 | **Zustand** (가중치·Hint 토글·Tweaks 전역) |
| 데이터 레이어 | **Repository 패턴** (`Component → Hook → Repository → Mock`) — 향후 GIVC 격리 |
| 데이터 | **100% Mock** (TS/JSON fixtures, ⭐/△/※ 출처 메타 필드 강제) |
| 배포 | **Cloudflare Workers** — 커스텀 도메인 `kita.minu.best`(CF Access 보호, `workers_dev:false`) + localhost 오프라인 백업 |
| What-If LLM | **하이브리드** — 기본 정적 응답 + 옵션 토글 시 CF Workers AI (`/api/chat`, 세션당 3회 rate limit) |
| 그래프 좌표 | 빌드타임 force-layout 1회 → JSON 스냅샷 (`scripts/gen-graph-layout.mjs`) |
| boost 계수 | Mock과 분리, 별도 설정 파일 (`config/hint-boosts.json`) |
| 개발 체제 | 서민원 책임 단독 + Claude Code |

## ⚠️ harness-kit: UI 라이브러리 아님 (백엔드 전용)

`@ktds-axbd/harness-kit`은 **Cloudflare Workers MSA 백엔드 스캐폴드**다. UI 컴포넌트는 없다. (구 기획서 `07번` §5의 "harness-kit 컴포넌트 매핑"은 **폐기** — UI는 자체 **AXIS 디자인 시스템**(`docs/spec/claude design/axis/` + `src/primitives.jsx`)으로 이미 구현됨.)

harness-kit이 제공하는 것 (이 PoC에서 쓰는 부분만): Hono 미들웨어(`createRateLimitMiddleware` 등), 선택적 What-If `/api/chat` Workers 백엔드. 그 외 auth/RBAC/D1/OAuth/이벤트버스/OTel/flags는 본 PoC 범위 밖.

- harness CLI 실행: `./node_modules/.bin/harness` 또는 `npx harness` (※ `node node_modules/.bin/harness`는 셔뱅 shim이라 깨짐).
- What-If 백엔드 scaffold가 필요하면: `npx harness create <name> --service-id foundry-x` → `pnpm dev`(wrangler) / `pnpm test`(vitest) / `pnpm typecheck`.

## 명령어

**프로덕션 (Vite+TS SPA)**: `pnpm dev`(개발) / `pnpm build`(빌드, tsc+vite) / `pnpm preview`(=`serve:offline`, localhost 백업) / `pnpm typecheck`(app+worker) / `pnpm lint` / `pnpm test`(vitest).

**배포 (F007/F009)**: `pnpm deploy:cf`(빌드+wrangler deploy) / `pnpm deploy:dryrun`(번들 검증). ⚠️ `pnpm deploy`는 pnpm 내장명령과 충돌 → 반드시 `deploy:cf`. `wrangler.jsonc`는 gitignore — 없으면 `cp wrangler.jsonc.example wrangler.jsonc`(custom_domain `kita.minu.best` + `workers_dev:false`). 배포·CF Access 관리 가이드 `docs/deploy-guide.md`.

**원본 프로토타입**: `docs/spec/claude design/KITA PoC.html` (CDN React+Babel, 빌드 불필요 — 이송 참조용).

## 데모 구조 (SPEC F-item 매핑)

- **S4** `/scenario/rnd` (F003): R&D 적합 기업 Top5 + 선정근거 지식그래프 + 가중치 슬라이더 **실시간 재계산**(<50ms, `page_rnd.jsx`에 스코어링 구현됨: 지표 정규화→가중합→Hint boost)
- **S6** `/scenario/toluene` (F004): 톨루엔 중심 지식그래프 + 무역통계 + 기업표 + 워드클라우드
- 두 화면 우측 **Data Expansion Hints** (F005): 토글 시 실제 boost 재계산 + 데이터 확장 예시 카드
- 지식그래프(F006): 노드 ≤ 50, hover→출처. 좌표는 빌드타임 스냅샷

## 데이터 출처 표기 규칙 (필수)

모든 표·차트·그래프 노드에 출처 표기 부착 — 데이터 모델에 메타 필드로 강제:

| 표기 | source 값 | 의미 |
|---|---|---|
| ⭐ 실 | `real` | GIVC/외부 실데이터 |
| △ 추정 | `est` | 합리적 추론값 |
| ※ 가상 | `virt` | 시연용 가상 데이터 |

프로토타입 `src/data.jsx`가 이미 이 체계를 따름(`sources: {...}`, 노드별 `source`, `<DataMark>`). 시연 신뢰성의 핵심이므로 누락 0이 목표.

## 컨벤션

- **언어**: 한국어 1순위. 사용자 대화는 반존대(해요체). 조직 표준은 상위 `/home/sinclair/work/axbd/CLAUDE.md`.
- **소속**: KT DS Enterprise사업본부 AX컨설팅팀 / 서민원 책임. GitHub org `KTDS-AXBD`, npm `@ktds-axbd/*`.
- **요구사항 거버넌스**: F-item은 SPEC.md에 먼저 등록(SSOT). REQ 코드 `KITA-REQ-NNN`.
- **PDCA**: 신규 기능은 `/pdca plan` 먼저. bkit 상태 `.bkit/state/`.

## 보안

- **`.dev.vars`** 에 LLM API 키들(OpenRouter/OpenAI/Gemini/DeepSeek/Anthropic)이 있음 — `.gitignore`에 등록됨, **절대 커밋 금지**. 권한 600.
- `kita.minu.best`는 **CF Access 게이팅**(지정 이메일 + OTP/Google). 데이터 100% Mock + 영업멘트 중립화. 접근관리·해제는 `docs/deploy-guide.md`.
