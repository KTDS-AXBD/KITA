# KITA PoC — SPEC (SSOT)

> GIVC × 온톨로지 PoC 데모 사이트. KT DS Enterprise사업본부 AX컨설팅팀 / 서민원 책임.
> 본 문서가 단일 진실 소스(SSOT). PRD: `docs/req/prd-final.md`. 디자인 프로토타입: `docs/spec/claude design/`.
> 생성: 2026-05-24 (ax:req-interview → prd-final → SPEC 등록)

---

## 1. 개요

빌드 없는 디자인 프로토타입(CDN React+Babel)을 **Vite+React 프로덕션 SPA**로 이송하고 **Cloudflare Pages/Workers**에 배포하여, Prototype 리뷰 시연(25~35분)을 실제 구동 가능한 PoC로 완성한다. 데이터는 100% Mock(⭐실/△추정/※가상 표기), What-If는 하이브리드 LLM(기본 정적 + 옵션 CF Workers AI).

## 2. 기술 스택

- Frontend: Vite + React 18 (SPA)
- 상태: Zustand / 데이터: Repository 패턴 (Mock → 향후 GIVC 격리)
- Infra: Cloudflare Pages/Workers (ktds-axbd.workers.dev)
- 선택 Backend: `@ktds-axbd/harness-kit` Workers (`/api/chat`, rate limit) + Cloudflare Workers AI
- 데이터: 100% Mock (TS/JSON fixtures, 출처 메타 필드 강제)

## 3. 완성 목표 (Done)

시연 가능 프로덕션 PoC = 빌드 + 배포(CF URL + localhost 백업) + 시연 스크립트 + 백업 영상. 목표: PM 재지정 후 1주 이내 시연 가능 상태. 총 공수 6~10일(솔로).

---

## 5. F-items (요구사항)

> 상태: 📋 PLANNED / 🔄 IN_PROGRESS / ✅ DONE / ❌ REJECTED. REQ: `KITA-REQ-NNN`.

### Sprint 1 — M1 빌드 이송 ✅ 완료 (2026-05-24, PR #1 merged `ead6098`)
| F | 기능 | REQ | 우선 | Sprint | 상태 |
|---|------|-----|------|--------|------|
| F001 | Vite+React 이송 기반 (Zustand 상태관리 + Repository 데이터레이어 스캐폴딩, JSX/AXIS 자산 보존) | KITA-REQ-001 | P0 | S1 | ✅ |
| F002 | Landing 페이지 이송 (시나리오 선택 카드) | KITA-REQ-002 | P0 | S1 | ✅ |
| F003 | S4 R&D 추천 (Top5 표/카드·선정근거 지식그래프·유사사례·반대추천·가중치 슬라이더 실시간 재계산) | KITA-REQ-003 | P0 | S1 | ✅ |
| F004 | S6 톨루엔 가시화 (지식그래프·무역통계 차트·핵심/예비 기업표·뉴스 워드클라우드) | KITA-REQ-004 | P0 | S1 | ✅ |
| F005 | 데이터 출처 표기 시스템 (⭐/△/※ 메타 필드 강제 + tooltip 출처) | KITA-REQ-005 | P0 | S1 | ✅ |
| F006 | 지식그래프 좌표 빌드타임 생성 스크립트 + boost 계수 별도 파일 분리 | KITA-REQ-006 | P0 | S1 | ✅ |

### Sprint 2 — M2 배포 (1~2일) + What-If
| F | 기능 | REQ | 우선 | Sprint | 상태 |
|---|------|-----|------|--------|------|
| F007 | Cloudflare 배포 ✅ (https://kita.ktds-axbd.workers.dev, Workers Static Assets) + localhost 백업(`serve:offline`) | KITA-REQ-007 | P0 | S2 | ✅ |
| F008 | QA 체크리스트·헬스체크 ✅ (스크립트·문서·라이브 스모크) / 공개 URL 접근제어·오프라인 테스트는 Master 수동 잔여 | KITA-REQ-008 | P0 | S2 | 🔄 |
| F009 | What-If 하이브리드 LLM (기본 정적 응답 + CF Workers AI 토글 + 세션당 3회 rate limit) — **별도 미니스프린트 분리** (P1, provider=CF Workers AI 결정) | KITA-REQ-009 | P1 | S2→별도 | 📋 |

### Sprint 3 — M3 시연 준비 (2~3일)
| F | 기능 | REQ | 우선 | Sprint | 상태 |
|---|------|-----|------|--------|------|
| F010 | About 페이지 (온톨로지 개념 + 데이터 출처/실·가상 구분) | KITA-REQ-010 | P1 | S3 | 📋 |
| F011 | 시연 스크립트 + 백업 영상 + 운영 매뉴얼 + 핸드오버 문서(README/배포 가이드) | KITA-REQ-011 | P0 | S3 | 📋 |
| F012 | Tweaks 패널(flavor/theme/layout) + 다국어(EN) 라벨 토글 | KITA-REQ-012 | P2 | S3 | 📋 |

---

## 6. Execution Plan (Sprint)

| Sprint | 마일스톤 | F-items | 공수 | DoD |
|--------|---------|---------|------|-----|
| S1 ✅ | M1 빌드 이송 | F001~F006 | 실적 ~2.5h (autopilot) | ✅ Vite+TS 구동, tsc/lint 0, vitest 9/9, build 213KB(gz 70KB). 33 회귀 + 성능 실측은 시연 직전 트랙(`docs/03-do/sprint-1-regression-checklist.md`) |
| S2 | M2 배포 | F007~F009 | 1~2일 | CF URL + localhost 백업, QA 체크리스트 통과, What-If 토글 동작 |
| S3 | M3 시연 준비 | F010~F012 | 2~3일 | 시연 스크립트·백업 영상·운영 매뉴얼 완비, 리허설 2회 |

**Critical Path:** F001(이송 기반) → F002~F006 → F007(배포). F009(실 LLM)·F012(P2)는 여유 시.
**선행:** 없음 (Mock 100%, 외부 의존 0). 외부 시연일만 PM 재지정 의존(§오픈이슈).

## 7. 오픈 이슈 (PRD §7 참조)

| # | 이슈 | 담당 |
|---|------|------|
| 1 | 외부 시연 일자 | 영업대표 (고객 PM 재지정, 외부) |
| R1 | 프로토타입→Vite 이송 공수 ✅ 재평가 완료 (3~5일→5~7일). 33개 인터랙션 목록화 + 난이도 분류 → Plan §4.1/§6.4 | 서민원 (Plan/Design 2026-05-24) |
| 2~5 | 사내 LLM·GIVC export·NDA·백업 영상 포맷 | PRD §7 |

---

*PRD `docs/req/prd-final.md` 기반.*
*- **Sprint 1 ✅** (M1 빌드 이송): [Plan](docs/01-plan/features/sprint-1-m1-migration.plan.md) · [Design](docs/02-design/features/sprint-1-m1-migration.design.md) · [Report](docs/05-act/sprint-1-report.md)*
*- **Sprint 2 🔄** (M2 배포): [Plan](docs/01-plan/features/sprint-2-m2-deploy.plan.md) · [Design](docs/02-design/features/sprint-2-m2-deploy.design.md). F007 ✅ 배포(https://kita.ktds-axbd.workers.dev, 라이브 스모크 통과) / F008 잔여: 접근제어·오프라인·QA(Master 수동, [deploy-guide](docs/deploy-guide.md)·[qa-checklist](docs/qa-checklist.md))*
*- 다음: F008 마감 → **F009 미니스프린트**(What-If 실 LLM, CF Workers AI) → Sprint 3(M3 시연준비)*
