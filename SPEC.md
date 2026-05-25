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
- Infra: Cloudflare Workers — 커스텀 도메인 `https://kita.minu.best` (CF Access 보호)
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
| F007 | Cloudflare 배포 ✅ (Workers Static Assets) — 공개 커스텀 도메인 `https://kita.minu.best`(S3 전환: CF `custom_domain`+`workers_dev:false`) + localhost 백업(`serve:offline`). `wrangler.jsonc` 로컬전용 | KITA-REQ-007 | P0 | S2 | ✅ |
| F008 | 접근제어(**CF Access 게이팅** 적용 2026-05-25 — 지정 이메일+OTP/Google, 커스텀 도메인 위 보호. 이력: 비추측→공개→Access)·config로컬화·헬스체크·QA문서·다해상도/오프라인 자기완결성 라이브 검증·sourcemap·favicon ✅. 데모시점 운영(실노트북 QA·실오프라인)은 `docs/qa-checklist.md` 런북 이관 | KITA-REQ-008 | P0 | S2 | ✅ |
| F009 | What-If 하이브리드 LLM ✅ — 토글(OFF=Mock 기본)+Hono Worker `/api/chat`(CF Workers AI `@cf/meta/llama-3.1-8b-instruct-fp8`)+KV rate-limit 세션3회. 라이브 스모크 통과(429·실데이터 응답). 프롬프트 도메인 튜닝은 선택 polish | KITA-REQ-009 | P1 | 별도 | ✅ |

### Sprint 3 — M3 시연 준비 ✅ (2026-05-24)
| F | 기능 | REQ | 우선 | Sprint | 상태 |
|---|------|-----|------|--------|------|
| F010 | About 페이지 ✅ (Ontology 개념·데이터진화·확장 + Data ⭐△※ 카탈로그 7실/1추정/4가상·가상처리 원칙). S1 이송 + 데이터단계 표 polish | KITA-REQ-010 | P1 | S3 | ✅ |
| F011 | 시연 스크립트(`demo-script.md`)·운영 매뉴얼(`operations-manual.md`)·README 핸드오버 ✅. 백업 영상 녹화·리허설 2회는 서민원 수동 런북 | KITA-REQ-011 | P0 | S3 | ✅ |
| F012 | Tweaks 패널 ✅ (flavor/theme/hints위치/top5/lang, S1 완료). 다국어(EN) 전체 i18n은 **보류**(P2, 한국어 시연 — 해외 시연 확정 시) | KITA-REQ-012 | P2 | S3 | ✅ |

### 실데이터 파이프라인 (kita-givc) — 📋 신규 (PRD: `docs/req/kita-givc/prd-final.md`, 2026-05-25)
> Mock→실데이터 적재·조회. **Phase 1 = 비PII 공개데이터로 S6 톨루엔 수직 슬라이스**(near-term). GIVC+PII는 Phase 2(외부 게이트). 착수 게이트 = F013 M0 PoC.

| F | 기능 | REQ | 우선 | Sprint | 상태 |
|---|------|-----|------|--------|------|
| F013 | M0 PoC 게이트 ✅ 4/4 PASS — 0a 관세청2종 승인·제한없음 + DART 키유효 / 0b D1 깊이2 **0.37ms** / 0c Vectorize 의미검색 **100%** / 0d 톨루엔 실데이터 4분기 적재. 저장소(D1+Vectorize) 타당성 입증 → F014 진행 | KITA-REQ-013 | P0 | S4 | ✅ |
| F014 | 적재 파이프라인 + 저장소 스키마 ✅ — `pnpm ingest:all` 1명령(관세청 무역 4분기·국가3 + DART 기업 6사 실매출 + 그래프 11노드 + Vectorize), 정식 스키마 5테이블, 검증·provenance real 24 | KITA-REQ-014 | P0 | S5 | ✅ |
| F015 | Repository 실데이터 구현체 + 어댑터 계층 ✅ — SnapshotTolueneRepository(동기) + 어댑터(gap-fill·결정적 레이아웃) + index.ts 토글(VITE_DATA_SOURCE=real). **화면 코드 diff 0** + typecheck/lint/test 9/9 PASS | KITA-REQ-015 | P0 | S5 | ✅ |
| F016 | S6 P0 조회 정식화 + 검증 — 정형(SQL)·그래프(재귀CTE)·전문검색(FTS5) 3종 + 회귀(vitest+33인터랙션, 실데이터 모드)·성능 실측(Lighthouse 첫로딩 <2s·S4 재계산 <100ms) | KITA-REQ-016 | P0 | S6 | 🔧 |
| F018 | S6 P1 조회 확장 — 의미검색(RAG via Worker) + 뉴스 워드클라우드 실적재(뉴스빅데이터 메타 / BIGKinds 풀텍스트 저작권 차단). F016에서 분리(S6 2026-05-25), 외부 의존·저작권 게이트 | KITA-REQ-018 | P1 | 별도 | 📋 |
| F017 | Phase 2 확장 — S4 슬라이스 + GIVC·PII 적재(마스킹·접근통제·NDA). 외부 게이트 의존, 보류 | KITA-REQ-017 | P1 | 별도 | 📋 |

---

## 6. Execution Plan (Sprint)

| Sprint | 마일스톤 | F-items | 공수 | DoD |
|--------|---------|---------|------|-----|
| S1 ✅ | M1 빌드 이송 | F001~F006 | 실적 ~2.5h (autopilot) | ✅ Vite+TS 구동, tsc/lint 0, vitest 9/9, build 213KB(gz 70KB). 33 회귀 + 성능 실측은 시연 직전 트랙(`docs/03-do/sprint-1-regression-checklist.md`) |
| S2 | M2 배포 | F007~F009 | 1~2일 | CF URL + localhost 백업, QA 체크리스트 통과, What-If 토글 동작 |
| S3 | M3 시연 준비 | F010~F012 | 2~3일 | 시연 스크립트·백업 영상·운영 매뉴얼 완비, 리허설 2회 |
| S4 | M0 PoC 게이트 (kita-givc) | F013 | 1~2일(+버퍼) | 데이터소스 확정 + D1 그래프 ≤50ms·Vectorize ≥80% PoC 통과 |
| S5 | 적재 + Repository | F014~F015 | 2~3일 | 공개데이터 적재 재현(검증 PASS) + Repository/어댑터 교체로 화면 코드 변경 0 |
| S6 | S6 조회 + 검증 | F016 | 2~3일 | S6 톨루엔 실데이터 구동 + 정형·그래프·FTS 동작 + 회귀·성능 기준 PASS |

**Critical Path:** F001(이송 기반) → F002~F006 → F007(배포). F009(실 LLM)·F012(P2)는 여유 시.
**실데이터 트랙(kita-givc) Critical Path:** F013(M0 PoC 게이트) → F014+F015(적재·Repository) → F016(조회·검증). F017(Phase 2)는 GIVC 접근·PII 규정 확보 의존(외부 게이트).
**선행:** F001~F012는 외부 의존 0. 실데이터 트랙은 F013 PoC 통과가 F014~F016 선행 게이트.

## 7. 오픈 이슈 (PRD §7 참조)

| # | 이슈 | 담당 |
|---|------|------|
| 1 | 외부 시연 일자 | 영업대표 (고객 PM 재지정, 외부) |
| R1 | 프로토타입→Vite 이송 공수 ✅ 재평가 완료 (3~5일→5~7일). 33개 인터랙션 목록화 + 난이도 분류 → Plan §4.1/§6.4 | 서민원 (Plan/Design 2026-05-24) |
| 2~5 | 사내 LLM·GIVC export·NDA·백업 영상 포맷 | PRD §7 |
| 6~10 | kita-givc: 공개데이터 소스·라이선스 확정, D1 그래프 적정성, Vectorize 비용, Phase2 GIVC·PII 게이트 | PRD kita-givc §7 |

---

*PRD `docs/req/prd-final.md` 기반.*
*- **Sprint 1 ✅** (M1 빌드 이송): [Plan](docs/01-plan/features/sprint-1-m1-migration.plan.md) · [Design](docs/02-design/features/sprint-1-m1-migration.design.md) · [Report](docs/05-act/sprint-1-report.md)*
*- **Sprint 2 ✅** (M2 배포): [Plan](docs/01-plan/features/sprint-2-m2-deploy.plan.md) · [Design](docs/02-design/features/sprint-2-m2-deploy.design.md). F007 배포 + F008 접근제어·QA·헬스체크 완료(라이브 검증). 데모시점 운영은 [qa-checklist](docs/qa-checklist.md)·[deploy-guide](docs/deploy-guide.md) 런북*
*- **F009 ✅** (What-If 하이브리드 LLM): [Plan](docs/01-plan/features/f009-whatif-llm.plan.md) · [Design](docs/02-design/features/f009-whatif-llm.design.md). Hono `/api/chat`+CF Workers AI+KV rate-limit, 라이브 스모크 통과*
*- **Sprint 3 ✅** (M3 시연준비): [Plan](docs/01-plan/features/sprint-3-m3-demo-prep.plan.md). F010 About·F011 [시연스크립트](docs/demo-script.md)·[운영매뉴얼](docs/operations-manual.md)·README·F012 Tweaks ✅ (다국어 EN 보류 P2)*
*- **커스텀 도메인 전환** (2026-05-24): 공개 URL `https://kita.minu.best` (CF `custom_domain`, `workers_dev:false`). **CF Access 게이팅 적용** (2026-05-25): 지정 이메일(sinclairseo@gmail.com·ktds.axbd@gmail.com) + OTP/Google. F008 접근제어 이력: 비추측 URL+시연후 만료 → 공개 → Access 게이팅. 배포·접근제어 [deploy-guide](docs/deploy-guide.md)*
*- **🎉 F001~F012 전부 완료** — 시연 가능 프로덕션 PoC 달성. **URL: https://kita.minu.best** (CF Access 보호). **남은 건 서민원 수동 런북**: 백업 영상 녹화 + 리허설 2회 + 실 노트북 QA ([qa-checklist](docs/qa-checklist.md)·[operations-manual](docs/operations-manual.md))*
*- **실데이터 파이프라인 (kita-givc) 📋 신규** (2026-05-25): /ax:req-interview → PRD(스코어 73=구조적 천장·Ambiguity 0.12 Ready). F013~F017 등록 — Phase 1=비PII 공개데이터 S6 슬라이스(F013 M0 PoC 게이트 → F014 적재 + F015 Repository/어댑터 → F016 조회·검증), Phase 2=GIVC+PII(외부 게이트, F017). PRD 영업기밀 로컬전용(`docs/req/kita-givc/`)*
*- **F015 ✅** (Repository 실구현체+어댑터): [Plan](docs/01-plan/features/f015-repository-adapter.plan.md) · [Report](docs/05-act/f015-report.md). `SnapshotTolueneRepository`(동기, 옵션A) + 어댑터(`src/data/repository/adapters/tolueneSnapshot.ts` — 스냅샷→도메인·이상치 △est·결정적 방사형 레이아웃·뉴스/힌트 Mock fallback) + `index.ts` 토글. **화면 코드(features/) diff 0** = "Repository 교체만으로 Mock→실데이터" 입증. 다음=F016 조회·회귀·성능*
*- **F014 ✅** (적재 파이프라인+스키마): [Plan](docs/01-plan/features/f014-ingest-pipeline.plan.md) · [Design](docs/02-design/features/f014-ingest-pipeline.design.md) · [Report](docs/05-act/f014-report.md). `pnpm ingest:all` — 관세청 무역(15101609 총량+15100475 국가별, 일본82%·중국18%) + DART 기업 6사(롯데케미칼 20.4조 등 실매출, corp_code 해소) + 그래프 11노드 + Vectorize. 정식 스키마 `migrations/0001`. share=△est(매출proxy). 다음=F015 Repository 실구현체·어댑터*
*- **F013 ✅** (M0 PoC 게이트 4/4 PASS): [Plan](docs/01-plan/features/f013-m0-poc-gate.plan.md) · [Design](docs/02-design/features/f013-m0-poc-gate.design.md) · [게이트 리포트](docs/05-act/f013-m0-gate-report.md) · [데이터 명세](docs/02-design/features/kita-givc-data-sources.md). 0a 관세청 15100475+15101609 활용신청 승인(제한없음/상업가능, Playwright 자동)·DART 키 유효 / 0b D1 깊이2 **0.37ms** / 0c Vectorize 의미검색 **100%**(bge-m3) / 0d 톨루엔 실데이터 4분기(2024Q1~Q4 JP+CN+US) 적재. 저장소 D1 `kita-givc-poc`·Vectorize `kita-givc-poc`(1024d). 교훈: curl이 %-인코딩 키 URL 거부(`malformed`)→node fetch 사용. **→ F014 진행 가능***
