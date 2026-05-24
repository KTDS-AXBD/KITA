# Sprint 2 — M2 배포 (F007+F008) Planning Document

> **Summary**: S1에서 빌드된 Vite SPA(`dist/`)를 Cloudflare에 배포(F007) + 공개 URL 접근제어·QA 체크리스트·배포 후 헬스체크(F008). 비가역·대외 작업이라 **하이브리드 실행**(코드/설정·dry-run 자동, 실 배포·시크릿·스모크는 Master 수동).
>
> **Project**: KITA PoC (GIVC × 온톨로지 데모)
> **Version**: 0.1.0
> **Author**: 서민원 책임 + Claude Code
> **Date**: 2026-05-24
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | S1으로 프로덕션 빌드는 완성됐으나 로컬에만 존재 — 시연하려면 **공개 URL 배포 + 안정성/접근제어**가 필요. 동시에 공개 URL은 NDA·무단접근 리스크가 있어 통제가 필수. |
| **Solution** | `dist/`를 **Cloudflare(Workers Static Assets 권장)**에 배포(F007) + **비추측 경로/CF Access 접근제어 + 배포 후 헬스체크 + QA 체크리스트**(F008). 배포·시크릿 등 비가역 작업은 Master 수동, 코드/설정/스크립트/dry-run은 자동. |
| **Function/UX Effect** | 공개 시연 URL + localhost 오프라인 백업 양쪽 구동. 시연 D-1 가용성 자동 확인. 1920/1366/대형 해상도·온/오프라인 QA 통과. |
| **Core Value** | "PM 재지정 후 1주 내 시연 가능 상태"의 마지막 인프라 조각. 외부 시연일이 잡히면 즉시 시연 가능. |

---

## 1. Overview

### 1.1 Purpose

S1 산출물(빌드된 SPA)을 Cloudflare에 배포해 **공개 시연 URL**을 확보하고, 공개에 따르는 리스크(무단접근·NDA·SaaS 장애)를 **접근제어 + 오프라인 백업 + 헬스체크**로 통제한다.

### 1.2 Background

PRD §3 To-Be: "Cloudflare 배포 + GIVC 위 온톨로지 가치를 즉시 시연". M1(빌드) 완료 → M2(배포)는 Critical Path의 다음 단계. 외부 시연일은 PM 재지정 의존(외부)이나 배포는 단독 선행 가능(PRD §2.3).

**fs 실측 (2026-05-24):**
- wrangler 설정·CI/CD 워크플로우 **없음** → F007이 처음부터 구축
- `package.json`에 `@ktds-axbd/harness-kit ^0.12.0` + harness CLI 가용 (F009-later 백엔드용, S2 미사용)
- `.dev.vars`에 `ACCOUNT_ID` + 외부 LLM 키 5종 (S2 미사용 — F009-later)
- `dist/` 빌드 검증 완료(S1): JS 213KB/gz 70KB, hash routing이라 SPA fallback 불요

### 1.3 Related Documents

- SSOT: `SPEC.md` §5 (F007, F008), §6 (Sprint 2 DoD)
- PRD: `docs/req/prd-final.md` §5.3(QA 체크리스트)·§5.4(장애대응)·§6.1·§6.4(컴플라이언스) — *로컬 전용*
- S1 산출: [sprint-1-m1-migration.design.md](sprint-1-m1-migration.design.md) (hash routing 결정 등)

---

## 2. Scope

### 2.1 In Scope (F007 + F008)

- [ ] **F007** Cloudflare 배포 설정 — `wrangler.jsonc` (Workers Static Assets 권장, §6.2) + 배포 스크립트 (`pnpm deploy`)
- [ ] **F007** localhost 오프라인 백업 절차 — `dist/` 정적 서빙(`pnpm preview` 또는 `npx serve dist`) 문서화
- [ ] **F008** 공개 URL 접근제어 — 비추측 경로 OR Cloudflare Access(Zero Trust). 시연 후 비활성화/만료 절차
- [ ] **F008** 배포 후 헬스체크 스크립트 — `/` 200 확인 + 시연 D-1 가용성 점검 (`scripts/healthcheck.sh`)
- [ ] **F008** QA 체크리스트 문서 — 브라우저(Chrome/Edge)·해상도(1920/1366/대형)·네트워크(온/오프라인)
- [ ] 핸드오버 — README에 배포/롤백/백업 전환 절차 (F011 일부 선반영)

### 2.2 Out of Scope

- **F009 What-If 실 LLM** — 별도 미니스프린트 분리 (P1, 백엔드 Worker + 시크릿 + 과금 + 스모크). provider는 **CF Workers AI** 사전 결정. S2의 WhatIfChat은 S1 Mock 유지.
- 사내 LLM 연동 (PRD §4.3)
- CI/CD 자동 배포 파이프라인 — S2는 수동 `wrangler deploy` (하이브리드). 자동화는 후속 검토
- 시연 스크립트·백업 영상 (F011, Sprint 3)

### 2.3 비가역/대외 작업 식별 (Safety Judgment 규칙)

| 작업 | 등급 | 실행 주체 |
|------|------|----------|
| `wrangler deploy` (공개 URL 생성/갱신) | 대외·비가역 | **Master 수동** |
| Cloudflare Access 정책 설정 | 대외 | **Master 수동** (CF 대시보드) |
| 공개 URL 비활성화/만료 | 대외 | **Master 수동** |
| wrangler.jsonc·배포 스크립트·헬스체크·QA 문서 작성 | 코드/설정 | 자동 (코드-prep) |
| `wrangler deploy --dry-run` 번들 검증 | 안전 | 자동 |
| 배포 후 `curl` 헬스체크 | 안전 | Master 실측 (대외 호출) |

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | F-item | Priority | Status |
|----|-------------|--------|----------|--------|
| FR-01 | `wrangler.jsonc` 작성 — Static Assets로 `dist/` 서빙, `pnpm build` 연동 | F007 | High | Pending |
| FR-02 | `pnpm deploy` 스크립트 + `--dry-run` 번들 검증 통과 | F007 | High | Pending |
| FR-03 | localhost 오프라인 백업 절차 문서화 + 실제 오프라인 구동 확인 | F007 | High | Pending |
| FR-04 | 공개 URL 접근제어 (비추측 경로 또는 CF Access) + 만료 절차 | F008 | High | Pending |
| FR-05 | `scripts/healthcheck.sh` — 배포 URL `/` 200 + 핵심 asset 로드 확인 | F008 | High | Pending |
| FR-06 | QA 체크리스트 문서 (브라우저·해상도·네트워크) | F008 | Medium | Pending |
| FR-07 | README 배포/롤백/백업 전환 가이드 | F007/F008 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement |
|----------|----------|-------------|
| 배포 가용성 | 공개 URL `/` 200, 핵심 라우트(#/scenario/rnd 등) 로드 | `healthcheck.sh` + 브라우저 |
| 첫 로딩 | < 2s (배포 환경, S1 로컬 396ms 기준) | CF URL Lighthouse/실측 |
| 무네트워크 | localhost 백업 완전 오프라인 구동 | 네트워크 차단 후 구동 |
| 보안 | 공개 URL 무단접근 차단 + 시연 후 만료 | CF Access 또는 비추측 경로 |
| 번들 | `--dry-run` 번들 ≤ 합리적 크기(현 213KB) | wrangler dry-run |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] `wrangler deploy --dry-run` PASS (번들 검증, 자동)
- [ ] **Master 수동**: 실 `wrangler deploy` → 공개 URL 발급
- [ ] **Master 실측**: `healthcheck.sh`로 공개 URL `/` 200 + 핵심 라우트 로드 확인
- [ ] localhost 오프라인 백업 구동 확인 (네트워크 차단 테스트)
- [ ] 접근제어 적용 (비추측 경로/CF Access) + 만료 절차 문서화
- [ ] QA 체크리스트 통과 (최소 Chrome 1920 + 오프라인 1회)
- [ ] README 배포 가이드 완비

### 4.2 Quality Criteria

- [ ] 배포 후 콘솔 에러 0 (favicon 404는 S2에서 파비콘 추가로 해소)
- [ ] `tsc`/lint/build 회귀 0 (S1 기준 유지)
- [ ] 공개 URL이 비인증 무단접근으로 노출되지 않음(확인)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 잘못된 배포가 공개 URL 노출 | High | Low | 배포는 Master 수동 + 접근제어 선적용. dry-run 선행 |
| CF 계정/권한/wrangler 인증 미비 | Medium | Medium | 배포 전 `wrangler whoami` 확인. WSL wrangler v4.75+ 허용(development-workflow) |
| Workers Static Assets vs Pages 선택 오류 | Medium | Low | §6.2에서 Workers Static Assets 권장(F009 forward-compat). dry-run으로 검증 |
| SaaS 장애로 시연 중단 | High | Low | localhost 오프라인 백업 필수 구동 확인 (PRD §5.4) |
| favicon 404 (S1 잔여) | Low | High | S2에서 `public/favicon.svg` 추가 |
| 접근제어 미흡으로 NDA 노출 | High | Low | CF Access 또는 비추측 경로 + 시연 후 즉시 만료 (PRD §6.4) |

---

## 6. Architecture Considerations

### 6.1 Project Level

Dynamic 유지 (S1과 동일). S2는 인프라/배포 레이어 추가.

### 6.2 Key Decisions

| Decision | 권장 | Rationale |
|----------|------|-----------|
| 배포 방식 | **Cloudflare Workers Static Assets** (`wrangler deploy` + `assets` 설정) | ① `*.workers.dev` 도메인·harness-kit Workers 스택과 정합 ② **F009 `/api/chat` 백엔드를 같은 Worker에 추가 가능**(forward-compat) ③ wrangler 단일 도구. 대안: CF Pages(`wrangler pages deploy`, 더 단순하나 F009 백엔드 분리됨) |
| SPA 라우팅 | **fallback 불요** | hash routing(`#/`)이라 모든 경로가 index.html — `not_found_handling` 설정 최소 |
| 접근제어 | **비추측 경로 + CF Access 검토** | PRD §6.4. Mock 단계라 비추측 경로로 충분, CF Access는 옵션 |
| 실행 모델 | **하이브리드** | 코드/설정/dry-run 자동, 실 배포·CF 설정·스모크 Master 수동 (Safety Judgment) |
| 파비콘 | `public/favicon.svg` 추가 | S1 콘솔 404 해소 |

### 6.3 구조 (S2 추가분)

```
KITA/
├─ wrangler.jsonc          # F007 — Workers Static Assets (dist/ 서빙)
├─ public/
│  └─ favicon.svg          # 콘솔 404 해소
├─ scripts/
│  └─ healthcheck.sh       # F008 — 배포 URL 가용성
├─ docs/
│  ├─ qa-checklist.md      # F008 — 브라우저·해상도·네트워크
│  └─ deploy-guide.md      # 배포/롤백/백업 전환 (README 링크)
└─ (dist/ — pnpm build 산출, gitignore)
```

### 6.4 공수 추정

| 단계 | 작업 | 실행 | 추정 |
|------|------|------|------|
| F007 코드-prep | wrangler.jsonc + deploy 스크립트 + favicon + dry-run | 자동 | 0.5일 |
| F007 배포 | `wrangler deploy` + 공개 URL 확인 | **Master 수동** | 0.25일 |
| F008 코드-prep | healthcheck.sh + qa-checklist.md + deploy-guide.md | 자동 | 0.5일 |
| F008 접근제어·스모크 | CF Access/경로 + 헬스체크 실측 + 오프라인 테스트 | **Master 수동** | 0.5일 |
| **합계** | | | **~1.5~2일** (PRD §6.1 M2 1~2일 정합) |

---

## 7. Convention Prerequisites

- [x] S1 컨벤션 확립 (TS strict, ESLint, 폴더 구조)
- [ ] `wrangler.jsonc` 신규 — Cloudflare 표준 스키마
- 환경변수: S2는 시크릿 불필요 (정적 배포). F009-later에서 `wrangler secret put` (Worker Secret Store 규칙 적용)

---

## 8. Next Steps

1. [ ] `/pdca design sprint-2-m2-deploy` — wrangler.jsonc 상세, 배포/롤백 절차, 헬스체크 스펙
2. [ ] SPEC.md F007·F008 📋→🔄
3. [ ] 코드-prep (자동) → dry-run → **Master 수동 배포** → 스모크

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-24 | 초안 — F007+F008 범위(F009 분리), 하이브리드 실행, 비가역 작업 식별, Workers Static Assets 권장, F009 provider=CF Workers AI 사전결정 | 서민원 + Claude Code |
