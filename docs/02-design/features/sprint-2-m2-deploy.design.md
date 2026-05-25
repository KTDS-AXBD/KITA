# Sprint 2 — M2 배포 (F007+F008) Design Document

> **Summary**: CF Workers Static Assets로 `dist/` 배포 설정 + 배포/롤백/헬스체크/접근제어/QA 절차. 자동(코드·설정·dry-run) vs Master 수동(배포·CF·스모크) 경계 명세.
>
> **Project**: KOAMI PoC · **Version**: 0.1.0 · **Author**: 서민원 + Claude Code · **Date**: 2026-05-24 · **Status**: Draft
> **Planning Doc**: [sprint-2-m2-deploy.plan.md](../../01-plan/features/sprint-2-m2-deploy.plan.md)

---

## 1. Overview

### 1.1 Design Goals

1. **공개 시연 URL** — `dist/`를 CF에 배포, hash routing이라 fallback 불요.
2. **안전한 공개** — 비추측 경로/CF Access + 시연 후 만료 (NDA 방어).
3. **무중단 시연** — localhost 오프라인 백업 + 배포 후 헬스체크.
4. **명확한 자동/수동 경계** — 비가역·대외 작업(배포·시크릿·CF설정)은 Master, 나머지는 자동.

### 1.2 Design Principles

- **Forward-compat**: Workers Static Assets로 F009 `/api/chat` 백엔드를 같은 Worker에 추가 가능하게.
- **Reversible-by-default**: 배포 전 `--dry-run`, 접근제어 선적용, 롤백 절차 문서화.
- **Offline-first 백업**: SaaS 장애 시 즉시 localhost 전환 (PRD §5.4).

---

## 2. Architecture

### 2.1 배포 토폴로지

```
[pnpm build] → dist/ (정적 SPA, hash routing)
      │
      ▼
[wrangler deploy] ──▶ CF Worker (Static Assets) ──▶ https://koami.<...>.workers.dev
      │ (Master 수동)                                       │
      │                                            [접근제어: 비추측 경로/CF Access]
      ▼                                                     │
[--dry-run 번들검증]                              [healthcheck.sh: / 200 실측]
                                                            │
[localhost 백업]: pnpm preview (오프라인 구동)        [F009-later: /api/chat 같은 Worker에 추가]
```

### 2.2 자동/수동 경계 (하이브리드 — 핵심)

| 단계 | 산출물/행위 | 실행 |
|------|------------|:----:|
| wrangler.jsonc 작성 | `assets` 바인딩 설정 | 🤖 자동 |
| deploy 스크립트 | `package.json` `deploy`/`deploy:dryrun` | 🤖 자동 |
| favicon | `public/favicon.svg` | 🤖 자동 |
| healthcheck.sh | URL 가용성 스크립트 | 🤖 자동 |
| qa-checklist.md / deploy-guide.md | 문서 | 🤖 자동 |
| `wrangler deploy --dry-run` | 번들 검증 | 🤖 자동 |
| `wrangler whoami` 확인 | 계정 인증 | 👤 Master |
| **`wrangler deploy`** | 공개 URL 발급 | 👤 **Master** |
| **CF Access/경로 접근제어** | CF 대시보드 설정 | 👤 **Master** |
| **헬스체크 실측 + 오프라인 테스트** | 대외 호출·QA | 👤 **Master** |
| 공개 URL 만료(시연 후) | CF 비활성화 | 👤 **Master** |

---

## 3. 설정/스크립트 스펙

### 3.1 wrangler.jsonc (F007)

```jsonc
{
  "name": "koami",
  "compatibility_date": "2026-05-01",
  "assets": { "directory": "./dist", "not_found_handling": "single-page-application" }
  // hash routing이라 SPA fallback은 사실상 불필요하나, 직접 URL 접근 대비 SPA 모드 설정
  // F009-later: 여기에 "main": "src/worker/index.ts" + Workers AI 바인딩 추가 → /api/chat
}
```

> `name: "koami"` → `https://koami.<account>.workers.dev`. account는 `.dev.vars`의 `ACCOUNT_ID` 또는 `wrangler whoami`로 확인.

### 3.2 package.json scripts 추가 (F007)

```jsonc
"deploy":        "pnpm build && wrangler deploy",
"deploy:dryrun": "pnpm build && wrangler deploy --dry-run",
"serve:offline": "vite preview --port 4173"   // localhost 백업
```
+ devDep `wrangler` 추가 (WSL v4.75+ 허용 — development-workflow).

### 3.3 scripts/healthcheck.sh (F008)

```bash
#!/usr/bin/env bash
# 배포 URL 가용성 — / 200 + 핵심 asset(js/css) 200 + 핵심 라우트 확인
URL="${1:?usage: healthcheck.sh <deploy-url>}"
fail=0
check() { code=$(curl -s -o /dev/null -w '%{http_code}' "$1"); [ "$code" = "200" ] && echo "✅ $1 ($code)" || { echo "❌ $1 ($code)"; fail=1; }; }
check "$URL/"
# index.html에서 asset 경로 추출해 검증
asset=$(curl -s "$URL/" | grep -oE '/assets/[^"]+\.(js|css)' | head -1)
[ -n "$asset" ] && check "$URL$asset"
exit $fail
```

> 시연 D-1: `bash scripts/healthcheck.sh <URL>` → 전부 ✅ 확인.

### 3.4 public/favicon.svg

S1 콘솔 `favicon.ico 404` 해소. 간단한 SVG 파비콘(AXIS 로고 "A" 모티프) → Vite가 `dist/`로 복사, `index.html`에 `<link rel="icon">` 추가.

---

## 4. 접근제어 설계 (F008)

| 방식 | 적용 | 비고 |
|------|------|------|
| **비추측 경로** (기본) | Worker route를 추측 어려운 이름/경로로 | Mock 단계 충분(PRD §6.4). 가장 단순 |
| **Cloudflare Access** (옵션) | Zero Trust 정책(이메일 OTP 등) | 더 강한 통제. CF 대시보드 설정(Master) |
| **시연 후 만료** | 배포 삭제 또는 Access 정책 off | 시연 종료 후 즉시 (PRD §6.4) |

> Mock 100% 단계라 비추측 경로로 시작, 실데이터 탑재 시 CF Access 재검토(PRD §6.4). deploy-guide.md에 만료 절차 명시.

---

## 5. QA 체크리스트 구조 (F008 — docs/qa-checklist.md)

| 축 | 항목 |
|----|------|
| 브라우저 | Chrome 최신, Edge 최신 (시연 노트북 버전 고정) |
| 해상도 | 1920×1080 / 1366×768 / 외부 대형 디스플레이 각 1회 |
| 네트워크 | 온라인(CF URL) + 오프라인(localhost) 양쪽 구동 |
| 라우트 | Landing/S4/S6/About/온톨로지 전수 + 새로고침(hash 유지) |
| 핵심 인터랙션 | S4 가중치/Hint, 그래프 hover, S6 차트 (S1 33 회귀 체크리스트 연계) |
| 시연 직전 | 리허설 2회 + 캐시/탭 초기화 cold load |

---

## 6. Error Handling / 장애 대응

| 상황 | 처리 |
|------|------|
| 배포 실패 | `--dry-run` 선검증 + 롤백(직전 deployment) — deploy-guide.md |
| SaaS/네트워크 장애 | localhost 백업 즉시 전환(사전 `serve:offline` 대기) |
| 헬스체크 실패 | 배포 재시도 또는 롤백, 시연 D-1 점검으로 조기 감지 |
| 무단접근 | 접근제어 + 시연 후 만료 |

---

## 7. Security

- [x] 공개 URL 접근제어 (비추측 경로/CF Access)
- [x] 시연 후 만료 절차
- [x] S2 시크릿 불필요 (정적 배포) — F009-later에서 `wrangler secret put`(Worker Secret Store 규칙)
- [x] HTTPS 강제 (CF 기본)

---

## 8. Test Plan

| Type | Target | Tool | 실행 |
|------|--------|------|:----:|
| 번들 검증 | `wrangler deploy --dry-run` | wrangler | 🤖 |
| 배포 스모크 | 공개 URL `/` 200 + asset | healthcheck.sh + curl | 👤 Master |
| 오프라인 | localhost 완전 오프라인 구동 | 네트워크 차단 | 👤 Master |
| 회귀 | tsc/lint/build 0 | pnpm | 🤖 |

---

## 9. Clean Architecture / Layer

S2는 인프라 레이어 — 앱 소스 변경 최소(favicon + index.html link만). 배포 설정은 루트(`wrangler.jsonc`)·`scripts/`·`docs/`.

---

## 10. Convention

| Target | Rule |
|--------|------|
| wrangler 설정 | `wrangler.jsonc` (주석 가능 JSON) |
| 스크립트 | `scripts/*.sh` (bash, `set -euo pipefail` 주의 — 빈 변수 가드) |
| 문서 | `docs/qa-checklist.md`, `docs/deploy-guide.md` |

---

## 11. Implementation Guide

### 11.2 Implementation Order

1. [ ] **🤖 F007 코드-prep** — `wrangler` devDep + `wrangler.jsonc` + deploy 스크립트 + `public/favicon.svg` + index.html link
2. [ ] **🤖 dry-run** — `pnpm deploy:dryrun` 번들 검증 PASS
3. [ ] **🤖 F008 코드-prep** — `scripts/healthcheck.sh` + `docs/qa-checklist.md` + `docs/deploy-guide.md`
4. [ ] **🤖 회귀** — tsc/lint/build 0 확인
5. [ ] **👤 Master: 인증 확인** — `wrangler whoami`
6. [ ] **👤 Master: 배포** — `pnpm deploy` → 공개 URL 발급
7. [ ] **👤 Master: 접근제어** — 비추측 경로/CF Access 적용
8. [ ] **👤 Master: 스모크** — `healthcheck.sh <URL>` + 오프라인 테스트 + QA 체크리스트
9. [ ] **🤖 문서 마감** — README 배포 가이드 링크, SPEC F007/F008 ✅

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-24 | 초안 — Workers Static Assets, 자동/수동 경계 명세, wrangler.jsonc·healthcheck·접근제어·QA 스펙, 9단계 구현순서 | 서민원 + Claude Code |
