# F009 미니스프린트 — What-If 하이브리드 LLM Planning Document

> **Summary**: WhatIfChat에 하이브리드 토글 추가 — 기본 정적(Mock) 응답 + 옵션 ON 시 CF Workers AI 실 LLM(`/api/chat`). 같은 Worker에 Hono `/api/chat`(harness-kit rate-limit 세션당 3회) + ASSETS fallthrough. 신규 의존성·바인딩 3종이라 **PoC 선검증** + 하이브리드 실행(Worker dev/dry-run 자동, 실 배포·스모크 Master 수동).
>
> **Project**: KITA PoC · **Version**: 0.1.0 · **Author**: 서민원 + Claude Code · **Date**: 2026-05-24 · **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | What-If 질의가 setTimeout Mock뿐 — "GIVC 컨텍스트로 실제 답한다"는 메시지를 시연에서 라이브로 못 보여줌. 단 실 LLM은 비용·지연·불안정 리스크. |
| **Solution** | **하이브리드**: 기본 정적 응답 유지(오프라인·안정), 옵션 토글 ON 시에만 CF Workers AI(`/api/chat`). 같은 Worker(Hono)에 엔드포인트 + **harness-kit rate-limit 세션당 3회**(비용 방어). |
| **Function/UX Effect** | 시연자가 토글로 "정적 vs 실 LLM"을 선택. 실 LLM은 시범 기능임을 명시. 오프라인 백업에선 자동 OFF. |
| **Core Value** | "GIVC 위 온톨로지 + LLM"의 미래 모습을 *옵션*으로 시연하되, 데모 안정성(정적 기본)은 훼손하지 않음. |

---

## 1. Overview

### 1.1 Purpose

S1에서 이송된 WhatIfChat(Mock)에 **실 LLM 토글**을 추가하고, 백엔드 `/api/chat`(CF Workers AI)를 S2 배포 Worker에 공존시킨다. 기본은 정적, 옵션 시에만 실 호출.

### 1.2 Background

PRD §4.2(부가 P1) + §4.4(실 LLM 제한: 세션당 3회 + rate limit). provider=**CF Workers AI** 확정(S2 결정 — 외부 키 불필요, 네이티브 바인딩). S2에서 Workers Static Assets로 배포했고 "같은 Worker에 /api/chat 공존"을 forward-compat로 설계함.

**fs 실측 (2026-05-24):**
- `WhatIfChat.tsx`: `ask()`가 Mock↔실 분기의 단일 지점. `renderMini`로 XSS 안전(raw HTML 미사용) — 실 LLM 응답도 안전 렌더 재사용 가능.
- `harness-kit createRateLimitMiddleware`: **Hono 기반**(Context/MiddlewareHandler). config limit/windowSec/keyFn/kvBinding, KV 없으면 in-memory fallback. `RateLimitDO`(Durable Object) 옵션도 제공.
- 현 `wrangler.jsonc`(로컬): assets-only. F009는 `main`(Worker) + `ai` 바인딩 추가.

### 1.3 Related Documents

- SSOT: `SPEC.md` F009 (별도 미니스프린트 분리)
- PRD §4.2·§4.4·§6.4(실 LLM 제한)
- S2: [sprint-2-m2-deploy.design.md](sprint-2-m2-deploy.design.md) (Worker forward-compat 설계)
- harness-kit README §createRateLimitMiddleware

---

## 2. Scope

### 2.1 In Scope (F009)

- [ ] **Worker** `src/worker/index.ts` — Hono 앱: `POST /api/chat` → CF Workers AI(`env.AI.run`), 그 외 → `env.ASSETS.fetch`(정적 fallthrough)
- [ ] **rate-limit** — harness-kit `createRateLimitMiddleware`, **세션당 3회**(keyFn = `X-Session-Id` 헤더), in-memory fallback(또는 KV)
- [ ] **wrangler.jsonc**(로컬·example 동시) — `main` + `ai` 바인딩 + 기존 `assets`
- [ ] **WhatIfChat 하이브리드 토글** — "실 LLM" 스위치(기본 OFF=Mock). ON+질의 시 `/api/chat` 호출, 응답을 기존 `renderMini`로 안전 렌더. 에러/limit 초과 시 graceful fallback(정적 안내)
- [ ] **세션 ID** — 클라이언트 `sessionStorage` UUID 생성 → `X-Session-Id` 헤더
- [ ] **PoC 선검증** — Worker 단독 `wrangler dev`/`--dry-run`으로 AI 호출·rate-limit 동작 확인 (frontend 배선 전)
- [ ] **deps** — `hono`, (필요시 `@cloudflare/workers-types`)
- [ ] 시연 스크립트에 "실 LLM=시범 기능" 명시 (F011 연계 메모)

### 2.2 Out of Scope

- 외부 LLM(OpenAI/OpenRouter 등) — CF Workers AI 한정 (PRD §4.4)
- 인증/사용자별 quota — 세션 단위 soft limit만
- GIVC 실 데이터 컨텍스트 주입(RAG) — 시스템 프롬프트에 Mock 컨텍스트 요약만(정적)
- localhost 오프라인 실 LLM — 백업 환경은 토글 강제 OFF

### 2.3 비가역/대외 작업 (Safety Judgment)

| 작업 | 등급 | 주체 |
|------|------|:----:|
| Worker/토글/rate-limit 코드 + wrangler 설정 | 코드 | 🤖 자동 |
| `wrangler dev`/`--dry-run` PoC | 안전(단 AI dev는 실 호출=소액 과금) | 🤖 자동 |
| **`wrangler deploy`** (실 LLM 라이브) | 대외·과금 | 👤 **Master** |
| 실 LLM 라이브 스모크(과금 호출) | 대외·과금 | 👤 **Master** |

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `POST /api/chat` — {messages|query} 받아 Workers AI 응답 반환(JSON) | High | Pending |
| FR-02 | rate-limit 세션당 3회 초과 시 429 + 안내 메시지 | High | Pending |
| FR-03 | 정적 자산 요청은 `/api/*` 제외 전부 ASSETS fallthrough(기존 SPA 유지) | High | Pending |
| FR-04 | WhatIfChat 토글 OFF(기본)=Mock, ON=`/api/chat`. 응답 `renderMini` 안전 렌더 | High | Pending |
| FR-05 | 에러·429·네트워크 실패 시 정적 fallback(시연 무중단) | High | Pending |
| FR-06 | 세션 ID(`sessionStorage`) 생성·헤더 전송 | Medium | Pending |
| FR-07 | PoC: Worker 단독 AI 호출·rate-limit 검증(dev/dry-run) | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement |
|----------|----------|-------------|
| 비용 방어 | 세션당 ≤3 실호출, 토글 OFF 시 0 호출 | rate-limit + 토글 기본 OFF |
| 안정성 | 실 LLM 실패가 시연 중단 유발 안 함(정적 fallback) | 에러 주입 테스트 |
| 응답 | 실 LLM 응답 < 시연 허용(모델 티어 design 결정) | 라이브 실측 |
| 무네트워크 | 오프라인 백업 토글 강제 OFF | localhost 테스트 |
| 보안 | 응답 raw HTML 미주입(renderMini 유지) + 프롬프트 인젝션 저위험(정적 데모) | 코드 리뷰 |
| 회귀 | tsc/lint/test 0, 기존 정적 빌드 영향 0 | pnpm |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] **🤖 PoC**: `wrangler dev`(또는 `--dry-run`)로 `/api/chat` AI 응답 1건 + 4번째 호출 429 확인
- [ ] **🤖** 토글 OFF=Mock 동일 동작(회귀 0), ON=실 응답(dev)
- [ ] **🤖** `pnpm build` + `wrangler deploy --dry-run` 번들 PASS, tsc/lint/test green
- [ ] **👤 Master**: 실 배포 + 라이브 `/api/chat` 1회 호출 200(과금 호출) + 429 확인
- [ ] **👤 Master**: 토글 ON 라이브 시연 스모크 + 오프라인 토글 OFF 확인
- [ ] 시연 스크립트에 "시범 기능" 명시

### 4.2 Quality Criteria

- [ ] 토글 OFF가 진짜 0 네트워크(정적) — 오프라인 보장
- [ ] 429/에러 graceful(빨간 화면 없음)
- [ ] 기존 SPA 라우팅·자산 영향 0

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **신규 의존성·바인딩 3종 동시(Hono+AI+rate-limit)** | High | Med | **PoC 선검증**(Worker 단독 dev/dry-run) — frontend 배선 전 |
| 비용 runaway | Med | Low | rate-limit 3/session + 토글 기본 OFF + 모델 경량 |
| 실 LLM 지연/실패로 시연 중단 | High | Med | 정적 fallback + 토글로 즉시 정적 복귀 + 오프라인 백업 |
| in-memory rate-limit 분산 불일치(Worker 다중 인스턴스) | Low | Med | 데모 저트래픽 허용. 엄밀 필요시 KV/DO 바인딩(design 결정) |
| Workers AI dev 호출도 과금 | Low | High | dev 테스트 호출 최소화(1~2건) |
| 프롬프트 인젝션 | Low | Low | 정적 데모·읽기전용. 응답 renderMini 안전 렌더 |
| Worker가 기존 SPA 자산 라우팅 깨뜨림 | High | Low | `/api/*`만 가로채고 나머지 ASSETS fallthrough. dry-run + 라우트 회귀 |

---

## 6. Architecture Considerations

### 6.1 Key Decisions (확정)

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Provider | **CF Workers AI** | S2 결정. 외부 키 불필요, 네이티브 `ai` 바인딩, 과금 미미 |
| Worker 프레임워크 | **Hono + harness-kit** | *(본 결정)* PRD 명시, createRateLimitMiddleware 재사용, org 스택 |
| 토폴로지 | **같은 Worker**(assets + /api/chat) | S2 forward-compat. `main`+`ai`+`assets` |
| rate-limit 키 | **`X-Session-Id` 헤더**(세션당 3회) | "세션당" 정확 매핑. 클라 `sessionStorage` UUID |
| 모델 | **design에서 가용목록 확인 후 확정**(경량 권장) | 가용성·한국어·지연 design 검증 |
| 토글 기본값 | **OFF(Mock)** | 안정·오프라인·비용 0 기본 |
| 응답 렌더 | **기존 `renderMini`** | XSS 안전 재사용(DOMPurify 불요) |

### 6.2 구조

```
src/worker/index.ts          # Hono 앱
  ├─ app.use('/api/*', createRateLimitMiddleware({limit:3, keyFn: X-Session-Id, ...}))
  ├─ app.post('/api/chat', c => { const {query}=...; const r=await c.env.AI.run(MODEL, {messages:[sys,user]}); return c.json(...) })
  └─ app.all('*', c => c.env.ASSETS.fetch(c.req.raw))   # 정적 fallthrough
wrangler.jsonc (로컬)         # + "main":"src/worker/index.ts" + "ai":{"binding":"AI"} (+ assets 유지)
src/components/primitives/WhatIfChat.tsx   # 토글 + ask() 분기(Mock|fetch /api/chat) + 세션ID
config/whatif.ts (또는 기존)  # 시스템 프롬프트(GIVC 컨텍스트 요약) — domain 입력 지점
```

### 6.3 공수 추정

| 단계 | 작업 | 실행 | 추정 |
|------|------|:----:|------|
| PoC | Worker 골격 + AI 바인딩 + rate-limit, dev/dry-run 검증 | 🤖 | 0.5일 |
| Worker 완성 | /api/chat + 시스템 프롬프트 + fallthrough | 🤖 | 0.5일 |
| Frontend | 토글 + 세션ID + ask() 분기 + fallback | 🤖 | 0.5일 |
| 배포·스모크 | 실 배포 + 라이브 과금 호출 검증 + 오프라인 | 👤 Master | 0.25일 |
| **합계** | | | **~1.5~2일** |

---

## 7. Convention Prerequisites

- [x] S1/S2 컨벤션 + wrangler 로컬화 확립
- [ ] `hono` devDep/dep + Workers AI 타입
- [ ] Worker 코드 `src/worker/` (tsconfig include 확인 — Worker 런타임 타입 vs DOM 타입 분리 주의)

---

## 8. Next Steps

1. [ ] `/pdca design f009-whatif-llm` — Worker 코드 상세, 모델 확정(가용목록), 시스템 프롬프트, 토글 UX, rate-limit 키/윈도우
2. [ ] SPEC.md F009 📋→🔄 (별도 트랙)
3. [ ] PoC(🤖) → Worker/토글(🤖) → dry-run → **Master 실 배포·스모크**

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-24 | 초안 — 하이브리드 토글+Hono Worker+CF Workers AI+rate-limit(세션3회), PoC 선검증, 하이브리드 실행, 모델 design 보류 | 서민원 + Claude Code |
