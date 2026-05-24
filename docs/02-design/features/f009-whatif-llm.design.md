# F009 미니스프린트 — What-If 하이브리드 LLM Design Document

> **Summary**: Hono Worker `/api/chat`(CF Workers AI `@cf/meta/llama-3.1-8b-instruct-fp8`) + harness-kit rate-limit(세션당 3회, X-Session-Id) + ASSETS fallthrough. WhatIfChat 토글(OFF=Mock 기본). PoC 선검증.
>
> **Project**: KITA PoC · **Version**: 0.1.0 · **Author**: 서민원 + Claude Code · **Date**: 2026-05-24 · **Status**: Draft
> **Planning Doc**: [f009-whatif-llm.plan.md](../../01-plan/features/f009-whatif-llm.plan.md)

---

## 1. Overview

### 1.1 Design Goals

1. 같은 Worker에 `/api/chat`(실 LLM) + 정적 자산 공존 — SPA 무영향.
2. 기본 정적(Mock)·옵션 실 LLM — 안정·오프라인·비용 0 기본.
3. rate-limit 세션당 3회 — 비용 runaway 방어.
4. 실패 graceful fallback — 시연 무중단.

### 1.2 Design Principles

- **PoC-first**: Worker AI 호출·429를 frontend 배선 전 검증.
- **Fail-safe default**: 토글 OFF, 에러 시 정적 복귀.
- **Reuse**: 응답 렌더는 기존 `renderMini`(XSS 안전).

---

## 2. Architecture

### 2.1 요청 흐름

```
브라우저 WhatIfChat
  토글 OFF → ask() Mock(setTimeout)                          [네트워크 0]
  토글 ON  → fetch POST /api/chat {query} + header X-Session-Id
                 │
                 ▼
        [같은 Worker — Hono]
          app.use('/api/*', rateLimit{limit:3, key:X-Session-Id})
          app.post('/api/chat') → c.env.AI.run(MODEL,{messages:[sys,user]}) → json{answer}
          app.all('*') → c.env.ASSETS.fetch(raw)   // 정적 SPA
                 │
        429(초과)/5xx/timeout → 클라가 정적 안내로 fallback
```

### 2.2 모델 결정 (가용목록 실측 기반)

| 모델 | 선택 | 비고 |
|------|:----:|------|
| `@cf/meta/llama-3.1-8b-instruct-fp8` | **기본** | 다국어 8B FP8 — 빠름·저비용·한국어 가능. PoC에서 한국어 품질 확인 |
| `@cf/zai-org/glm-4.7-flash` | 대안 | 다국어 특화·고속·131k ctx. Llama 한국어 부족 시 교체 |
| `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | 비추천(데모) | 품질↑이나 지연·비용↑ |

> 모델명은 `config/whatif.ts` 상수로 분리 — PoC 후 교체 용이.

---

## 3. Worker 코드 스펙

### 3.1 src/worker/index.ts (Hono)

```typescript
import { Hono } from 'hono';
import { createRateLimitMiddleware } from '@ktds-axbd/harness-kit';
import { WHATIF_MODEL, WHATIF_SYSTEM_PROMPT } from '../../config/whatif';

interface Env { AI: Ai; ASSETS: Fetcher; }

const app = new Hono<{ Bindings: Env }>();

// /api/* 만 rate-limit (세션당 3회). KV 없으면 in-memory fallback.
app.use('/api/*', createRateLimitMiddleware({
  limit: 3,
  windowSec: 3600,                                   // 세션 ≒ 시연 1회
  keyFn: (c) => c.req.header('X-Session-Id') ?? 'anon',
}));

app.post('/api/chat', async (c) => {
  const { query } = await c.req.json<{ query?: string }>();
  if (!query?.trim()) return c.json({ error: 'empty' }, 400);
  const res = await c.env.AI.run(WHATIF_MODEL, {
    messages: [
      { role: 'system', content: WHATIF_SYSTEM_PROMPT },
      { role: 'user', content: query },
    ],
  });
  return c.json({ answer: (res as { response?: string }).response ?? '' });
});

// 그 외 전부 정적 자산 (SPA)
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
```

> 🧩 **Do 단계 도메인 기여 요청**: `WHATIF_SYSTEM_PROMPT`(config/whatif.ts) — LLM이 GIVC/온톨로지 맥락에 맞게 답하도록 하는 시스템 프롬프트. "어떤 컨텍스트(S4 지표·가중치·출처규칙)를 주고, 어떤 톤으로 답할지"는 데모 내러티브를 아는 서민원 책임 입력이 가치. Do 단계에서 골격+TODO 준비 후 5~10줄 요청.

### 3.2 wrangler.jsonc 변경 (로컬 + .example)

```jsonc
{
  "name": "<비추측>",
  "compatibility_date": "2026-05-01",
  "main": "src/worker/index.ts",          // ← 추가
  "ai": { "binding": "AI" },               // ← CF Workers AI 바인딩
  "assets": { "directory": "./dist", "binding": "ASSETS", "not_found_handling": "single-page-application" }
}
```
> `assets`에 `"binding": "ASSETS"` 추가 — Worker에서 `env.ASSETS.fetch`로 정적 서빙.

### 3.3 deps + tsconfig (gotcha)

- `hono` 추가 (dependency).
- **⚠️ tsconfig 분리**: Worker는 Workers 런타임 타입(`Ai`,`Fetcher`), 앱은 DOM 타입. 현 `tsc --noEmit`이 `src/worker`를 DOM 타입으로 검사하면 에러 → `tsconfig.json`에서 `src/worker` **exclude** + `tsconfig.worker.json`(lib: WebWorker, `@cloudflare/workers-types`) 별도. `pnpm typecheck`는 둘 다 검사하도록 구성(`tsc -p tsconfig.json && tsc -p tsconfig.worker.json`).
- `wrangler deploy`는 자체 esbuild로 Worker 번들(앱 vite build와 독립).

---

## 4. Frontend — WhatIfChat 토글

### 4.1 변경 (src/components/primitives/WhatIfChat.tsx)

- **토글 추가**: "실 LLM" 스위치(`useState(false)`, 기본 OFF). 라벨에 "시범" 배지.
- **세션 ID**: `sessionStorage.getItem('kita-sid')` 없으면 `crypto.randomUUID()` 생성·저장.
- **ask() 분기**:
  ```
  if (!liveMode) → 기존 Mock(setTimeout)         // 변경 없음
  else → fetch('/api/chat', {method:POST, headers:{'X-Session-Id':sid}, body:{query}})
         ├ 200 → renderMini(answer)
         ├ 429 → "세션당 3회 한도 — 정적 응답으로 보여드릴게요" + Mock fallback
         └ err/timeout → 정적 fallback
  ```
- 응답 렌더는 **기존 `renderMini`** 재사용(XSS 안전, DOMPurify 불요).
- 로딩 표시 기존 `thinking` 재사용.

### 4.2 오프라인 백업

`serve:offline`(localhost)엔 Worker AI 없음 → 토글 ON 시 fetch 실패 → 정적 fallback. UX: 토글 자체를 `import.meta.env.PROD` 또는 호스트 감지로 숨김/비활성 가능(design 최소: fallback로 충분).

---

## 5. rate-limit 설계

| 항목 | 값 | 비고 |
|------|----|------|
| limit | 3 | PRD §4.4 세션당 3회 |
| windowSec | 3600 | 세션 ≒ 시연 1회 |
| keyFn | `X-Session-Id` 헤더 | 클라 sessionStorage UUID |
| 저장 | in-memory fallback | 데모 저트래픽. 엄밀 필요시 `kvBinding`/`doBinding`(RateLimitDO) |
| 초과 | 429 → 클라 정적 fallback | graceful |

---

## 6. Error Handling

| 상황 | 처리 |
|------|------|
| query 빈값 | 400, 클라에서 무시 |
| 429 한도 초과 | 안내 + Mock 응답 |
| AI 호출 실패/timeout | 정적 fallback("시범 기능 — 정적 응답") |
| 오프라인(Worker 없음) | fetch 실패 → fallback |
| 잘못된 JSON | try/catch → 400 |

---

## 7. Security

- [x] 응답 raw HTML 미주입 — `renderMini`(파싱 빌더)
- [x] rate-limit로 남용·비용 방어
- [x] 프롬프트 인젝션 저위험(읽기전용 데모, 시스템 프롬프트 고정)
- [x] CF Workers AI 네이티브 바인딩 — 외부 키·시크릿 0 (`.dev.vars` 외부키 미사용)
- [ ] 응답 길이 제한(max_tokens) — config에 설정(과금·지연 방어)

---

## 8. Test Plan

| Type | Target | Tool | 실행 |
|------|--------|------|:----:|
| **PoC** | `/api/chat` AI 응답 1건 + 4번째 429 | `wrangler dev` + curl | 🤖 |
| 회귀 | 토글 OFF Mock 동일 + tsc(앱+worker)/lint/test | pnpm | 🤖 |
| 번들 | `wrangler deploy --dry-run` | wrangler | 🤖 |
| 라이브 스모크 | 실 배포 후 토글 ON 1회 200(과금) + 429 | curl/브라우저 | 👤 Master |
| 오프라인 | `serve:offline` 토글 ON → fallback | 수동 | 👤 Master |

**핵심 케이스**: 토글 OFF=네트워크0 / ON 200 렌더 / 4회째 429 fallback / AI 실패 fallback / SPA 라우트 무영향.

---

## 9. Clean Architecture / Layer

| Component | Layer | Location |
|-----------|-------|----------|
| Hono Worker(/api/chat) | Infrastructure(edge) | `src/worker/index.ts` |
| WHATIF_MODEL·SYSTEM_PROMPT | Config | `config/whatif.ts` |
| WhatIfChat 토글·fetch | Presentation | `src/components/primitives/WhatIfChat.tsx` |
| rate-limit | harness-kit(외부) | dep |

---

## 10. Convention

- Worker: Hono 표준. `config/whatif.ts`에 모델·프롬프트·max_tokens 상수.
- tsconfig 2분할(app DOM / worker WebWorker).
- wrangler.jsonc 로컬전용 유지(.example 동기 갱신).

---

## 11. Implementation Guide

### 11.2 Implementation Order

1. [ ] **🤖 deps/설정** — `hono` 설치, `tsconfig.worker.json`, wrangler.jsonc(+example) main/ai/ASSETS, `config/whatif.ts`(모델·max_tokens·프롬프트 골격)
2. [ ] **🤖 Worker** — `src/worker/index.ts`(Hono + rate-limit + /api/chat + ASSETS fallthrough)
3. [ ] **🤖 PoC** — `wrangler dev` → curl `/api/chat` 200(한국어 응답 품질 확인) + 4회째 429. (모델 한국어 부족 시 GLM-4.7-flash 교체)
4. [ ] **🤖 Frontend** — WhatIfChat 토글 + 세션ID + ask() 분기 + fallback
5. [ ] **🤖 회귀** — tsc(app+worker)/lint/test, `deploy --dry-run`
6. [ ] **👤 Master** — 실 배포 + 라이브 토글 ON 스모크(과금 1~2회) + 429 + 오프라인 fallback
7. [ ] **🤖** SPEC F009 ✅, 시연 스크립트 "시범 기능" 메모

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-24 | 초안 — Hono Worker /api/chat, 모델 llama-3.1-8b-fp8(가용 실측), rate-limit 세션3회, 토글 OFF기본, tsconfig 2분할 gotcha, PoC 선검증, 시스템프롬프트 Do기여 | 서민원 + Claude Code |
