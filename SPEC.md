# KOAMI PoC — SPEC (SSOT)

> GIVC × 온톨로지 PoC 데모 사이트. KT DS Enterprise사업본부 AX컨설팅팀 / 서민원 책임.
> 본 문서가 단일 진실 소스(SSOT). PRD: `docs/req/prd-final.md`. 디자인 프로토타입: `docs/spec/claude design/`.
> 생성: 2026-05-24 (ax:req-interview → prd-final → SPEC 등록)

---

## 1. 개요

빌드 없는 디자인 프로토타입(CDN React+Babel)을 **Vite+React 프로덕션 SPA**로 이송하고 **Cloudflare Pages/Workers**에 배포하여, Prototype 리뷰 시연(25~35분)을 실제 구동 가능한 PoC로 완성한다. 데이터는 100% Mock(⭐실/△추정/※가상 표기), What-If는 하이브리드 LLM(기본 정적 + 옵션 CF Workers AI).

## 2. 기술 스택

- Frontend: Vite + React 18 (SPA)
- 상태: Zustand / 데이터: Repository 패턴 (Mock → 향후 GIVC 격리)
- Infra: Cloudflare Workers — 커스텀 도메인 `https://koami.minu.best` (CF Access 보호)
- 선택 Backend: `@ktds-axbd/harness-kit` Workers (`/api/chat`, rate limit) + Cloudflare Workers AI
- 데이터: 100% Mock (TS/JSON fixtures, 출처 메타 필드 강제)

## 3. 완성 목표 (Done)

시연 가능 프로덕션 PoC = 빌드 + 배포(CF URL + localhost 백업) + 시연 스크립트 + 백업 영상. 목표: PM 재지정 후 1주 이내 시연 가능 상태. 총 공수 6~10일(솔로).

---

## 5. F-items (요구사항)

> 상태: 📋 PLANNED / 🔄 IN_PROGRESS / ✅ DONE / ❌ REJECTED. REQ: `KOAMI-REQ-NNN`.

### Sprint 1 — M1 빌드 이송 ✅ 완료 (2026-05-24, PR #1 merged `ead6098`)
| F | 기능 | REQ | 우선 | Sprint | 상태 |
|---|------|-----|------|--------|------|
| F001 | Vite+React 이송 기반 (Zustand 상태관리 + Repository 데이터레이어 스캐폴딩, JSX/AXIS 자산 보존) | KOAMI-REQ-001 | P0 | S1 | ✅ |
| F002 | Landing 페이지 이송 (시나리오 선택 카드) | KOAMI-REQ-002 | P0 | S1 | ✅ |
| F003 | S4 R&D 추천 (Top5 표/카드·선정근거 지식그래프·유사사례·반대추천·가중치 슬라이더 실시간 재계산) | KOAMI-REQ-003 | P0 | S1 | ✅ |
| F004 | S6 톨루엔 가시화 (지식그래프·무역통계 차트·핵심/예비 기업표·뉴스 워드클라우드) | KOAMI-REQ-004 | P0 | S1 | ✅ |
| F005 | 데이터 출처 표기 시스템 (⭐/△/※ 메타 필드 강제 + tooltip 출처) | KOAMI-REQ-005 | P0 | S1 | ✅ |
| F006 | 지식그래프 좌표 빌드타임 생성 스크립트 + boost 계수 별도 파일 분리 | KOAMI-REQ-006 | P0 | S1 | ✅ |

### Sprint 2 — M2 배포 (1~2일) + What-If
| F | 기능 | REQ | 우선 | Sprint | 상태 |
|---|------|-----|------|--------|------|
| F007 | Cloudflare 배포 ✅ (Workers Static Assets) — 공개 커스텀 도메인 `https://koami.minu.best`(S3 전환: CF `custom_domain`+`workers_dev:false`) + localhost 백업(`serve:offline`). `wrangler.jsonc` 로컬전용 | KOAMI-REQ-007 | P0 | S2 | ✅ |
| F008 | 접근제어(**CF Access 게이팅** 적용 2026-05-25 — 지정 이메일+OTP/Google, 커스텀 도메인 위 보호. 이력: 비추측→공개→Access)·config로컬화·헬스체크·QA문서·다해상도/오프라인 자기완결성 라이브 검증·sourcemap·favicon ✅. 데모시점 운영(실노트북 QA·실오프라인)은 `docs/qa-checklist.md` 런북 이관 | KOAMI-REQ-008 | P0 | S2 | ✅ |
| F009 | What-If 하이브리드 LLM ✅ — 토글(OFF=Mock 기본)+Hono Worker `/api/chat`(CF Workers AI `@cf/meta/llama-3.1-8b-instruct-fp8`)+KV rate-limit 세션3회. 라이브 스모크 통과(429·실데이터 응답). 프롬프트 도메인 튜닝은 선택 polish | KOAMI-REQ-009 | P1 | 별도 | ✅ |

### Sprint 3 — M3 시연 준비 ✅ (2026-05-24)
| F | 기능 | REQ | 우선 | Sprint | 상태 |
|---|------|-----|------|--------|------|
| F010 | About 페이지 ✅ (Ontology 개념·데이터진화·확장 + Data ⭐△※ 카탈로그 7실/1추정/4가상·가상처리 원칙). S1 이송 + 데이터단계 표 polish | KOAMI-REQ-010 | P1 | S3 | ✅ |
| F011 | 시연 스크립트(`demo-script.md`)·운영 매뉴얼(`operations-manual.md`)·README 핸드오버 ✅. 백업 영상 녹화·리허설 2회는 서민원 수동 런북 | KOAMI-REQ-011 | P0 | S3 | ✅ |
| F012 | Tweaks 패널 ✅ (flavor/theme/hints위치/top5/lang, S1 완료). 다국어(EN) 전체 i18n은 **보류**(P2, 한국어 시연 — 해외 시연 확정 시) | KOAMI-REQ-012 | P2 | S3 | ✅ |

### 실데이터 파이프라인 (koami-givc) — 📋 신규 (PRD: `docs/req/koami-givc/prd-final.md`, 2026-05-25)
> Mock→실데이터 적재·조회. **Phase 1 = 비PII 공개데이터로 S6 톨루엔 수직 슬라이스**(near-term). GIVC+PII는 Phase 2(외부 게이트). 착수 게이트 = F013 M0 PoC.

| F | 기능 | REQ | 우선 | Sprint | 상태 |
|---|------|-----|------|--------|------|
| F013 | M0 PoC 게이트 ✅ 4/4 PASS — 0a 관세청2종 승인·제한없음 + DART 키유효 / 0b D1 깊이2 **0.37ms** / 0c Vectorize 의미검색 **100%** / 0d 톨루엔 실데이터 4분기 적재. 저장소(D1+Vectorize) 타당성 입증 → F014 진행 | KOAMI-REQ-013 | P0 | S4 | ✅ |
| F014 | 적재 파이프라인 + 저장소 스키마 ✅ — `pnpm ingest:all` 1명령(관세청 무역 4분기·국가3 + DART 기업 6사 실매출 + 그래프 11노드 + Vectorize), 정식 스키마 5테이블, 검증·provenance real 24 | KOAMI-REQ-014 | P0 | S5 | ✅ |
| F015 | Repository 실데이터 구현체 + 어댑터 계층 ✅ — SnapshotTolueneRepository(동기) + 어댑터(gap-fill·결정적 레이아웃) + index.ts 토글(VITE_DATA_SOURCE=real). **화면 코드 diff 0** + typecheck/lint/test 9/9 PASS | KOAMI-REQ-015 | P0 | S5 | ✅ |
| F016 | S6 P0 조회 정식화 + 검증 ✅ — 공용 SQL 빌더(정형·그래프 재귀CTE·FTS5 entity_fts) 빌드·Worker 공유 + 읽기전용 `/api/givc/*` 3종(하이브리드) + vitest 14(총 23) + 실모드 검증(콘솔에러0·실기업6사) + 성능 실측(첫로딩 97ms·S4 재계산 0.17ms) | KOAMI-REQ-016 | P0 | S6 | ✅ |
| F018 | S6 P1 조회 확장 — 의미검색(RAG via Worker) + 뉴스 워드클라우드 실적재(뉴스빅데이터 메타 / BIGKinds 풀텍스트 저작권 차단). F016에서 분리(S6 2026-05-25), 외부 의존·저작권 게이트 | KOAMI-REQ-018 | P1 | 별도 | 📋 |
| F017 | Phase 2 확장 — S4 슬라이스 + GIVC·PII 적재(마스킹·접근통제·NDA). 외부 게이트 의존, 보류 | KOAMI-REQ-017 | P1 | 별도 | 📋 |

### 기계산업 콘텐츠 전환 — 📋 신규 (2026-05-25, /todo plan)
> 데모 콘텐츠(톨루엔·화학무역)를 확정 고객 **한국기계산업진흥회(KOAMI)** 도메인으로 전환. S4는 이미 멀티도메인(`domains.ts`에 기계금속 C28·C25 포함)이라 저비용, S6는 톨루엔이 아키텍처(`TolueneRepository`·`types/toluene.ts`·`S6Page`·snapshot)까지 결합돼 재구축 필요. 착수 게이트 = F019(품목·데이터 가용성 결정). 역량 스토리(GIVC+온톨로지)는 도메인 무관이라 본질 유지.

| F | 기능 | REQ | 우선 | Sprint | 상태 |
|---|------|-----|------|--------|------|
| F019 | 전환 스코프 게이트 ✅ GO — **시나리오**: KOAMI 실제 미션(소부장 GIVC·가치사슬)에 정렬, 청중 산업부→KOAMI 소부장담당+회원사. **S6**: 공작기계 중심 다단계 가치사슬(장비←부품, 소부장 자립화 스토리). **데이터 가용성 라이브 실측**: 관세청 4개 HS(845710 머시닝센터 수출$972M·845811 NC선반 $1443M·848210 볼베어링 $755M·848340 기어감속기 수입$994M>수출$648M=자립화과제) 전부 조회 OK·**외부 신청 0**(hsSgn 파라미터). DART corp_code 해소는 F021/F023 이관 | KOAMI-REQ-019 | P0 | S7 | ✅ |
| F020 | S4 R&D 기계산업 재스킨 ✅ — `domains.ts`(소부장 기계 가치사슬 도메인 6종+프리셋 3종, 헤드라인=감속기 국산화) + `rnd.ts`(후보풀 8사·counter·similar·그래프·hints·what-if 전면 교체) 소부장 가상 SME로. **화면 코드(features/rnd) diff 0** + typecheck/lint/test 23 PASS. ⚠️헤드라인 프리셋 weights 튜닝(서민원)·브라우저 시각회귀=시연직전 트랙 | KOAMI-REQ-020 | P0 | S8 | ✅ |
| F022 | 랜딩/About 프레이밍 전환 ✅ — 청중(산업부·산자부→KOAMI 소부장·회원사)·시나리오(소부장 자립화 R&D·공작기계 가치사슬)·MiniS6 노드(톨루엔→감속기)·데이터 카탈로그 전환(`LandingPage`·`AboutDataPage`·`AboutOntologyPage`). 표시텍스트 잔존 0(라우트 `/scenario/toluene`만 F021 대상) | KOAMI-REQ-022 | P1 | S8 | ✅ |
| F021 | S6 시나리오 기계산업 재구축 ✅ — 톨루엔→공작기계 다단계 가치사슬(소재→부품→장비). 아키텍처 리네임 `Toluene*`→`S6*`(types/s6·mock/s6·S6Repository·s6Snapshot·features/s6) + 라우트 `/scenario/s6` + 다단계 그래프(머시닝센터 anchor←부품 베어링/감속기/CNC←소재 특수강) + KPI/무역/기업표 tier. Mock diff 화학잔존0·결정적 layout(stale JSON 미사용). typecheck/lint/test 23·build·브라우저 시각검증(콘솔에러0). ⚠️real 스냅샷=톨루엔 유지(F023) | KOAMI-REQ-021 | P0 | S9 | ✅ |
| F023 | 실데이터 파이프라인 기계산업 적재 ✅ — koami-givc 톨루엔→공작기계 다단계 재적재([게이트](docs/05-act/f023-data-gate-report.md)·[리포트](docs/05-act/f023-report.md)). **재적재**: 관세청 기계 멀티HS(845710 앵커+848210/848340/722840 tier)·DART 상장 기계사 10사(tier 장비/부품/소재)·그래프 18노드 다단계·provenance real=47·Vectorize 18(톨루엔 잔재 삭제). **다단계 그래프**: 소재(특수강)→부품(베어링·감속기)→장비(머시닝센터 anchor), 무역수지 D1 런타임 산출(감속기 수입$497M·특수강$50M=자립화 적자). **DoD**: Repository 스왑 화면 diff 0(스냅샷+어댑터 교체만) + S9 잔존 KPI 하드코딩(게이트 2배 중복값 $972M) 데이터연동 수정(getKpis Mock큐레이션/real산출). typecheck/lint/test 23/build·시각검증 real+Mock 콘솔0·로컬스모크 PASS. ⚠️라이브 배포는 트랙완료 후 별도 | KOAMI-REQ-023 | P1 | S10 | ✅ |

### ChatGIVC DB 스키마 정렬 — 📋 신규 (2026-05-25, /req-interview)
> 고객이 제공한 **실 ChatGIVC 운영 DB 스키마**(~60 `gvc.*` 테이블 DDL+주석) + NL→SQL 퓨샷에 PoC 데이터 레이어를 정렬. 데모가 고객 실 데이터모델(GVC코드·`product_network` 전후방·`scmm` SCM지표)을 말하게 하고 본사업화 시 Repository→실 GIVC 연동을 자연 연결로. **제약**: 실 DB 접속정보 0바이트·기업/R&D/코드 DLP 암호화 → **스키마+퓨샷만**(실데이터는 공개+가상 fallback). **착수 게이트=F024(퓨샷 SQL 실행성 M0)**. PRD·실테이블 매핑: `docs/req/chatgivc-align/`(로컬전용, 80/100·Ambiguity 0.11 Ready). 확립 패턴(F015/F023 화면 diff 0) 답습.
> **공개 경계 (거버넌스 결정 2026-05-25)**: 실 GIVC **테이블명·컬럼명은 공개 OK**(데모 UI가 의도적으로 노출하는 신뢰 요소 — Landing/About/S4·F027 실 질의 패널). **로컬전용(비공개)=전체 스키마 덤프(`docs/spec/기진회 DB/` 60테이블 DDL)·실데이터·PII·DLP 암호화 자료·실 GVC 제품코드(데모는 virt `GVC-{도메인}-*` 사용)**.

| F | 기능 | REQ | 우선 | Sprint | 상태 |
|---|------|-----|------|--------|------|
| F024 | M0 퓨샷 SQL 실행성 사전 게이트 ✅ **GO** (in-session 실측) — 퓨샷 310개 전수 분류 → `gvc.*` 계열 SQL 변환·D1 실행 **10/10 PASS**(임계≥5, 6지표패밀리+집계+그래프+RANK윈도우+방언변환, 실 D1 `--local` parity 확인 success:true). **결정적 발견**: `gvc.*` only 25개만 직접 실행 가능(전부 `scmm` 재무지표), ~285개는 `mart.*` 의존(DDL 미제공) → **F027 실행:정적 비율 확정**(`scmm`·그래프 계열 live / `mart.*` 무역원천 큐레이션). 방언변환 규칙 도출(F025/F027 재사용). 리포트 `docs/req/chatgivc-align/`(로컬). → F025~F027 착수 가능 | KOAMI-REQ-024 | P0 | S11 | ✅ |
| F025 | 실 GIVC 스키마 미러(D1) + 멀티도메인 적재 ✅ — 화면 매핑 핵심 테이블 SQLite 미러(GVC코드 PK·`product_network` 전후방·`scmm`/`rnd_ntis` 지표 서브셋·`trade_search_data_country`·`item_trd_rnk`·`hs_anomaly`·`ecosys_riskmng_ewindex`·`product338`) + 기계(virt GVC)+반도체(실리콘웨이퍼, virt GVC) 적재(공개+가상). migration 0003(`gvc_products`/`gvc_network`/`gvc_metrics` 의미명)·`GvcRepository`·신규 vitest8(총31)·**화면 diff 0**. typecheck/lint/test PASS. [리포트](docs/05-act/sprint-12-f025-report.md) | KOAMI-REQ-025 | P0 | S12 | ✅ |
| F026 | Repository/어댑터 GVC 재정렬 + 통합 시나리오 ✅ — `gvcS6Adapter`(`GvcRepository`→S6 도메인 타입 매핑) + 반도체 **S6 도메인 토글**(`DomainToggle`·`gvcDomainStore`) + 통합뷰(`GvcIntegration` 공통 소재/장비 교차)·`GvcPane`. 기존 S6 렌더 무손상(import 1줄 외 additive). typecheck/lint/test **45**(신규14)·proprietary 0(코드+산문). autopilot STATUS=DONE(CI-부재 가드레일로 S12 false-FAILED 차단) → Master 검토·수동 merge | KOAMI-REQ-026 | P0 | S13 | ✅ |
| F027 | 실 질의 데모 패널(ChatGIVC Query) ✅ — `ChatGivcQueryPane`(S6 하단 탭)+`chatgivc-catalog`(실SQL↔미러SQL **병기, C하이브리드**)+`executor`(GvcRepository 재사용 live + 큐레이션 정적). 도메인 토글 연동·출처표기(⭐/△/※). 실 GVC코드 0(virt + 자가 가드 테스트)·기존 S6 무손상(탭 additive)·test **71**(신규26). autopilot STATUS=FAILED(CI-부재 오판, 구현 MATCH100 정상) → Master 검토·스크럽(실코드 prefix illustrative)·수동 merge | KOAMI-REQ-027 | P0 | S14 | ✅ |
| F028 | 본사업화 연동 청사진(blueprint) ✅ — (a)화면별 Repository↔실 `gvc.*`/`mart.*` 쿼리 매핑표 (b)퓨샷 NL→SQL 역량 카탈로그 (c)실 DB 전환 Migration Plan (d)PII/DLP/NDA 거버넌스 게이트 (e)확장성 **+ (f) 실 컬럼↔의미명 1:1 매핑 정식화**(scmm 6패밀리·product_network·어댑터 REAL_COLUMN_MAP 규칙). 문서(로컬 `docs/req/chatgivc-align/`). 잔여(mart.* DDL·NL→SQL엔진·보안승인·실GVC코드)는 외부 게이트 | KOAMI-REQ-028 | P0 | S15 | ✅ |

### 시연 운영 · 의견 회신 설문 — 🆕 (2026-05-26, /req-interview)
> 시연 후 고객(KOAMI)이 시나리오 우선순위·데이터 확보 의향·일정 의견을 회신할 수 있게 설문 페이지를 프로덕션 사이트에 추가. 09번 단독 HTML(`docs/spec/설문지/`, axis 토큰 적용 완성본)을 iframe 임베드(이식 설계서 B안). 응답 수집은 Google Form 백엔드 POST(placeholder, 실 폼 생성 시 entry.* 주입 활성화).
> **결정(req-interview 2026-05-26)**: 이식=커스텀 HTML iframe / 진행=바로 구현+SPEC / 노출=S4·S6 하단 CTA만(헤더 네비 비노출) / 수집=placeholder 유지.

| F | 기능 | REQ | 우선 | Sprint | 상태 |
|---|------|-----|------|--------|------|
| F029 | 의견 회신 설문 페이지 ✅ — 09번 단독 HTML을 `public/survey-static.html`로 복사 + `/survey` 라우트(`SurveyPage` iframe 임베드, 이식 설계서 B안) + S4·S6 하단 `SurveyCta` 카드(헤더 네비 비노출). 폼 로직(localStorage 임시저장·미리보기 모달·Google Form POST) 정적 HTML 격리·사이트 코드 무손상(라우트 1줄+import 2줄+CTA 2곳). Google Form 백엔드=placeholder(실 폼 생성 후 entry.* 주입 시 활성화). 검증 typecheck/lint/test 71/build·로컬 preview 실측(라우트·iframe 전체 렌더·CTA·콘솔에러0) | KOAMI-REQ-029 | P1 | 별도 | ✅ |

### GIVC Ontology Platform 전환 (v0.32) — 📋 신규 (2026-05-27, /req-interview)
> 신규 프로토타입 `docs/spec/기진회_2차세미나_프로토타입_v0.32_260527.html`(7페이지 사이드바 대시보드)를 라이브 KOAMI에 **전면 재구축**. 현 시나리오 SPA → 온톨로지 엔지니어링 방법론 쇼케이스(데이터→CQ→온톨로지→그래프→시나리오→비교→계획). 전략 메시지=고객 보유 **chatGIVC(LLM+RAG) 대비 온톨로지+KG 우월성**(인과추적·재현성·설명가능성). 6월 Prototype 리뷰 시연 대상. PRD: `docs/req/givc-ontology-platform/prd-final.md`(로컬전용).
> **결정(req-interview 2026-05-27, AskUserQuestion 12건)**: 범위=전면 재구축(7페이지 전부 P0) / 그래프=cytoscape(force-layout 은퇴)+NL→Cypher 시연 스크립트 / 데이터=Mock 우선+koami-givc D1 real 부분(공작기계) / 출처=실·추정·**유료** 3분류(가상 제거) / 도메인=토글(시나리오·그래프만, **기본=소부장 공작기계**, 호르무즈=보조 CQ-001) / About·Survey=사이드바 REFERENCE 흡수 / 검토=외부AI 생략(F029 선례). **고객 KOAMI 불변** 확정.

| F | 기능 | REQ | 우선 | Sprint | 상태 |
|---|------|-----|------|--------|------|
| F030 | 디자인 시스템 + 앱 셸 ✅ — `v032-tokens.css`(`--op-*` prefix로 기존 `--axis-*`와 네임스페이스 격리·25토큰·노드색11) + `src/shell/`(AppLayout·Sidebar MAIN5+REF2·HeaderBar 브레드크럼) + `src/components/platform/` 공용 9종(Badge 실/추정/유료+verified/draft/pending·KpiCard·DataTable·EntityCard·Tooltip3·CypherBlock·Toggle·Modal·Timeline) + `/platform/*` 7라우트(data·cq·ontology·graph·scenario·compare·plan, stub) + cytoscape PoC(소부장 10노드 미니그래프·성능로깅). **기존 라우트(/scenario/rnd·s6·about·survey) AppHeader 유지=공존**(diff 1796+/3-, big-bang 회피). 검증 typecheck/lint/test **71**/build(699KB·gz226·cytoscape포함, 번들최적화는 F034 dynamic import). PR #5 squash merge. ⚠️CI부재 false-FAILED(MATCH100) Master 독립검증 후 수동merge | KOAMI-REQ-030 | P0 | S16 | ✅ |
| F031 | 데이터 현황 페이지 — KPI 4(총27/실19/추정4/유료4) + 데이터소스 현황표(상태닷·구분배지·출처·활용영역·수집방법·갱신일). 소부장 우선 정렬 + 호르무즈 소스 통합 | KOAMI-REQ-031 | P0 | S17 | 🔧 |
| F032 | CQ 관리 페이지 — 좌 CQ 목록(필터 pills·상태배지 verified/draft/pending) + 우 상세(질문·배경·엔티티태그·Cypher·검증결과) + 신규 CQ 등록 모달 | KOAMI-REQ-032 | P0 | S18 | 📋 |
| F033 | 온톨로지 모델 정의 페이지 — 엔티티 13종·관계 8종·속성 카드(색상블록·툴팁) + 제약(constraints) 다크블록 + 관계 속성 편집 모달 | KOAMI-REQ-033 | P0 | S18 | 📋 |
| F034 | 지식그래프 페이지 — cytoscape + 노드 상세패널 + 범례 + 툴바(도메인 토글·노드필터·영향경로). 소부장/호르무즈 2그래프(initSobujiang/initHormuz) | KOAMI-REQ-034 | P0 | S19 | 📋 |
| F035 | 시나리오 분석 페이지 (시연 하이라이트) — CQ 선택(토글 CQ-002 소부장/CQ-001 호르무즈) → NL질의 → Cypher 변환 → 애니메이션 추론 → 결과 A 영향경로(cytoscape mini) B Top5 C 설명가능성(인과경로·취약성·EWS·재현성) D 대응옵션 E 의사결정 리포트 | KOAMI-REQ-035 | P0 | S20 | 📋 |
| F036 | 비교 검증 페이지 (전략 핵심) — chatGIVC(LLM+RAG) vs 온톨로지+KG 2카드(채팅버블·주석 ✗/✓) + 6축 비교표 | KOAMI-REQ-036 | P0 | S17 | 🔧 |
| F037 | 추진 계획 페이지 — Phase 0~4 타임라인(5/26~6/27) + CQ Tier1(시연 2)/Tier2(고객확인 5) 목록 + 푸터 | KOAMI-REQ-037 | P0 | S17 | 🔧 |
| F038 | 데이터 레이어 / Repository — Mock fixtures(27소스·2그래프·CQ·온톨로지·시나리오결과) 출처메타 강제 + koami-givc D1 real 어댑터(공작기계 무역/기업) 재활용 | KOAMI-REQ-038 | P0 | S19·S21 | 📋 |
| F039 | 배포 — build + deploy:cf → koami.minu.best 교체 + 버전 활성화 검증(versions deploy) + CF Access 유지 + 회귀 | KOAMI-REQ-039 | P0 | S21 | 📋 |

---

## 6. Execution Plan (Sprint)

| Sprint | 마일스톤 | F-items | 공수 | DoD |
|--------|---------|---------|------|-----|
| S1 ✅ | M1 빌드 이송 | F001~F006 | 실적 ~2.5h (autopilot) | ✅ Vite+TS 구동, tsc/lint 0, vitest 9/9, build 213KB(gz 70KB). 33 회귀 + 성능 실측은 시연 직전 트랙(`docs/03-do/sprint-1-regression-checklist.md`) |
| S2 | M2 배포 | F007~F009 | 1~2일 | CF URL + localhost 백업, QA 체크리스트 통과, What-If 토글 동작 |
| S3 | M3 시연 준비 | F010~F012 | 2~3일 | 시연 스크립트·백업 영상·운영 매뉴얼 완비, 리허설 2회 |
| S4 | M0 PoC 게이트 (koami-givc) | F013 | 1~2일(+버퍼) | 데이터소스 확정 + D1 그래프 ≤50ms·Vectorize ≥80% PoC 통과 |
| S5 | 적재 + Repository | F014~F015 | 2~3일 | 공개데이터 적재 재현(검증 PASS) + Repository/어댑터 교체로 화면 코드 변경 0 |
| S6 | S6 조회 + 검증 | F016 | 2~3일 | S6 톨루엔 실데이터 구동 + 정형·그래프·FTS 동작 + 회귀·성능 기준 PASS |
| S7 | 전환 스코프 게이트 | F019 | 1~2일(+버퍼) | S6 품목 확정 + S4 도메인/사례 확정 + 관세청 기계 HS·DART 기계사 가용성 실측 + 프레이밍 방침 → F020~F023 착수 가능 |
| S8 ✅ | S4 재스킨 + 프레이밍 | F020·F022 | 실적 ~1세션 | ✅ S4 후보풀·프리셋 소부장 교체(화면코드 diff 0)·랜딩/About KOAMI 프레이밍 전환·typecheck/lint/test 23/build PASS. 브라우저 시각회귀 시연직전 트랙 |
| S9 ✅ | S6 기계산업 재구축 | F021 | 실적 ~1세션 | ✅ 톨루엔→공작기계 다단계 가치사슬(소재→부품→장비) 전면 교체·아키텍처 리네임 Toluene*→S6*·라우트 /scenario/s6·tsc/lint/test 23/build/시각검증 PASS. real 스냅샷은 F023 |
| S10 ✅ | 기계산업 실데이터 적재 | F023 | 실적 ~1세션 | ✅ 미니게이트 GO(3/3) → 톨루엔→공작기계 다단계 재적재(멀티HS·상장 기계사10사 tier·그래프18노드·real=47·Vectorize18) + Repository 스왑 화면 diff0 + S9 KPI 하드코딩(2배 중복값) 데이터연동 수정. tsc/lint/test23/build·시각검증 real+Mock·로컬스모크 PASS. [게이트](docs/05-act/f023-data-gate-report.md)·[리포트](docs/05-act/f023-report.md) |
| S11 ✅ | M0 퓨샷 SQL 실행성 게이트 (chatgivc-align) | F024 | 실적 ~in-session | ✅ GO — 퓨샷 310개 분류, gvc.* 계열 10/10 D1 실행 PASS(실 D1 parity 확인), 실행:정적 비율 확정(F027), 방언변환 규칙 도출 → F025~F027 착수 가능 |
| S12 ✅ | 스키마 미러 + 멀티도메인 적재 | F025 | 실적 ~autopilot | ✅ 핵심 테이블 SQLite 미러(GVC코드 PK·전후방 가치사슬·재무지표) + 기계+반도체 virt 적재 + GvcRepository + 화면 diff0 + typecheck/lint/test31 PASS. (autopilot 구현 후 Master 공개유출 검토·스크럽·수동 merge) |
| S13 ✅ | Repository 정렬 + 통합 시나리오 | F026 | 실적 ~autopilot | ✅ gvcS6Adapter + 반도체 S6 도메인 토글 + 통합뷰. 기존 S6 무손상·test45·proprietary0. STATUS=DONE(가드레일로 false-FAILED 차단)·Master 수동 merge |
| S14 ✅ | 실 질의 데모 패널 | F027 | 실적 ~autopilot | ✅ ChatGivcQueryPane(S6 탭)+카탈로그(C하이브리드 병기)+executor·도메인토글·test71·실GVC코드0. CI-부재 오판 FAILED→Master 검토·스크럽·수동 merge |
| S15 ✅ | 본사업화 연동 청사진 | F028 | 실적 ~병렬(S12·S14) | ✅ blueprint (a)~(f) 완성 — 실컬럼↔의미명 1:1 매핑 정식화. 잔여는 외부 게이트(mart.* DDL·보안승인) |
| S16 ✅ | 디자인 시스템 + 앱 셸 (v0.32) | F030 | 실적 ~13분(autopilot) | ✅ `--op-*` 토큰 격리·shell(AppLayout/Sidebar/HeaderBar)·공용 9종·/platform/* 7라우트 stub·cytoscape PoC + 기존 라우트 공존(diff 1796+/3-). typecheck/lint/test71/build PASS. Master 독립검증(typecheck·test·build 재실행·proprietary0)·PR #5 수동merge `705bddc` |
| S17 | 정적 콘텐츠 3종 | F031·F036·F037 | 6월 리뷰 역산 | 데이터현황·비교검증·추진계획 렌더 + 출처배지(실/추정/유료) 부착. 셸 이후 병렬 |
| S18 | 방법론 2종 | F032·F033 | 6월 리뷰 역산 | CQ 관리(목록·상세·등록모달) + 온톨로지 정의(엔티티13·관계8·제약). 도메인 공용 |
| S19 | 지식그래프 + 데이터레이어 | F034·F038 | 6월 리뷰 역산 | cytoscape 그래프 + 노드 상세패널 + 도메인 토글(소부장/호르무즈) + Mock/real 어댑터 |
| S20 | 시나리오 분석 (하이라이트) | F035 | 6월 리뷰 역산 | CQ 선택→Cypher→애니메이션 추론→A~E 결과. 콘솔에러0 |
| S21 | 통합 + 배포 + 회귀 | F038·F039 | 6월 리뷰 역산 | 데이터레이어 통합·koami.minu.best 교체 배포·버전 활성화 검증·회귀 |

**Critical Path:** F001(이송 기반) → F002~F006 → F007(배포). F009(실 LLM)·F012(P2)는 여유 시.
**실데이터 트랙(koami-givc) Critical Path:** F013(M0 PoC 게이트) → F014+F015(적재·Repository) → F016(조회·검증). F017(Phase 2)는 GIVC 접근·PII 규정 확보 의존(외부 게이트).
**기계산업 콘텐츠 전환 Critical Path:** F019(스코프 게이트) → F020+F022(S4 재스킨·프레이밍) → F021(S6 재구축) → F023(실데이터 적재). 전부 순차(S8·S9가 `types/index.ts`·`mock/index.ts` 공유 → 병렬 불가). F019 데이터 가용성 통과가 F020~F023 선행 게이트.
**ChatGIVC 스키마 정렬 Critical Path:** F024(M0 퓨샷 SQL 실행성 게이트) → F025(스키마 미러+멀티도메인) → F026(Repository 정렬+통합 시나리오) → F027(실 질의 패널). F028(청사진)은 병렬 가능(문서·스키마 기반·실DB 무관). **Track A(F024~F027 데모)는 실 GIVC DB 접근 없이 완결 가능**(공개+가상)·**Track B(F028 청사진)도 접근 무관** = 외부 게이트가 본 트랙을 막지 않음. F024 GO가 F025~F027 선행 게이트.
**GIVC Ontology Platform 전환(v0.32) Critical Path:** F030(디자인 시스템·앱 셸 + cytoscape PoC) → {F031·F036·F037 정적, F032·F033 방법론} 병렬 → F034(그래프)·F038(데이터레이어) → F035(시나리오 분석) → F039(배포). F030 셸이 전 페이지 선행 게이트. 정적·방법론 페이지(S17·S18)는 셸 이후 병렬, 그래프·시나리오(S19·S20)가 시연 하이라이트 critical. cytoscape는 force-layout 은퇴(신규 의존성)·NL→Cypher는 시연 스크립트(실 엔진=본사업 외부게이트).
**선행:** F001~F012는 외부 의존 0. 실데이터 트랙은 F013 PoC 통과가 F014~F016 선행 게이트.

## 7. 오픈 이슈 (PRD §7 참조)

| # | 이슈 | 담당 |
|---|------|------|
| 1 | 외부 시연 일자 | 영업대표 (고객 PM 재지정, 외부) |
| R1 | 프로토타입→Vite 이송 공수 ✅ 재평가 완료 (3~5일→5~7일). 33개 인터랙션 목록화 + 난이도 분류 → Plan §4.1/§6.4 | 서민원 (Plan/Design 2026-05-24) |
| 2~5 | 사내 LLM·GIVC export·NDA·백업 영상 포맷 | PRD §7 |
| 6~10 | koami-givc: 공개데이터 소스·라이선스 확정, D1 그래프 적정성, Vectorize 비용, Phase2 GIVC·PII 게이트 | PRD koami-givc §7 |
| 11~17 | chatgivc-align: 반도체=S6 도메인 토글(F026 결정)·실질의패널=S6 하단패널(F027 결정)·재무지표 가상치 비중·실 GIVC DB 접근시점(외부)·가치사슬 가상 근거·KOAMI 사전 피드백 일정 | PRD chatgivc-align §7 |

---

*PRD `docs/req/prd-final.md` 기반.*
*- **Sprint 1 ✅** (M1 빌드 이송): [Plan](docs/01-plan/features/sprint-1-m1-migration.plan.md) · [Design](docs/02-design/features/sprint-1-m1-migration.design.md) · [Report](docs/05-act/sprint-1-report.md)*
*- **Sprint 2 ✅** (M2 배포): [Plan](docs/01-plan/features/sprint-2-m2-deploy.plan.md) · [Design](docs/02-design/features/sprint-2-m2-deploy.design.md). F007 배포 + F008 접근제어·QA·헬스체크 완료(라이브 검증). 데모시점 운영은 [qa-checklist](docs/qa-checklist.md)·[deploy-guide](docs/deploy-guide.md) 런북*
*- **F009 ✅** (What-If 하이브리드 LLM): [Plan](docs/01-plan/features/f009-whatif-llm.plan.md) · [Design](docs/02-design/features/f009-whatif-llm.design.md). Hono `/api/chat`+CF Workers AI+KV rate-limit, 라이브 스모크 통과*
*- **Sprint 3 ✅** (M3 시연준비): [Plan](docs/01-plan/features/sprint-3-m3-demo-prep.plan.md). F010 About·F011 [시연스크립트](docs/demo-script.md)·[운영매뉴얼](docs/operations-manual.md)·README·F012 Tweaks ✅ (다국어 EN 보류 P2)*
*- **커스텀 도메인 전환** (2026-05-24): 공개 URL `https://koami.minu.best` (CF `custom_domain`, `workers_dev:false`). **CF Access 게이팅 적용** (2026-05-25): 지정 이메일(sinclairseo@gmail.com·ktds.axbd@gmail.com) + OTP/Google. F008 접근제어 이력: 비추측 URL+시연후 만료 → 공개 → Access 게이팅. 배포·접근제어 [deploy-guide](docs/deploy-guide.md)*
*- **🎉 F001~F012 전부 완료** — 시연 가능 프로덕션 PoC 달성. **URL: https://koami.minu.best** (CF Access 보호). **남은 건 서민원 수동 런북**: 백업 영상 녹화 + 리허설 2회 + 실 노트북 QA ([qa-checklist](docs/qa-checklist.md)·[operations-manual](docs/operations-manual.md))*
*- **실데이터 파이프라인 (koami-givc) 📋 신규** (2026-05-25): /ax:req-interview → PRD(스코어 73=구조적 천장·Ambiguity 0.12 Ready). F013~F017 등록 — Phase 1=비PII 공개데이터 S6 슬라이스(F013 M0 PoC 게이트 → F014 적재 + F015 Repository/어댑터 → F016 조회·검증), Phase 2=GIVC+PII(외부 게이트, F017). PRD 영업기밀 로컬전용(`docs/req/koami-givc/`)*
*- **F016 ✅** (S6 P0 조회 정식화·검증): [Plan](docs/01-plan/features/f016-s6-queries.plan.md) · [Design](docs/02-design/features/f016-s6-queries.design.md) · [회귀·성능](docs/03-do/f016-regression-real.md). 공용 SQL 빌더(`src/shared/givc-queries.mjs` — 정형·그래프 재귀CTE·FTS5, 빌드·Worker·vitest 3자 공유) + `entity_fts`(기업·그래프 코퍼스, `migrations/0002`) + 읽기전용 `/api/givc/{graph,trade,search}`(하이브리드, rate-limit `/api/chat`로 축소) + build-snapshot 재귀CTE 재배선(데이터 동일·결정적). 검증: vitest 23·실모드 콘솔에러0·실기업6사 렌더·첫로딩 97ms·S4 재계산 0.17ms·원격 D1 조회 스모크 3종·Worker curl 3종. P1(RAG·뉴스)=F018 분리. ⚠️ Worker D1 바인딩명 `DB` 필수(deploy-guide)*
*- **F015 ✅** (Repository 실구현체+어댑터): [Plan](docs/01-plan/features/f015-repository-adapter.plan.md) · [Report](docs/05-act/f015-report.md). `SnapshotTolueneRepository`(동기, 옵션A) + 어댑터(`src/data/repository/adapters/tolueneSnapshot.ts` — 스냅샷→도메인·이상치 △est·결정적 방사형 레이아웃·뉴스/힌트 Mock fallback) + `index.ts` 토글. **화면 코드(features/) diff 0** = "Repository 교체만으로 Mock→실데이터" 입증. 다음=F016 조회·회귀·성능*
*- **F014 ✅** (적재 파이프라인+스키마): [Plan](docs/01-plan/features/f014-ingest-pipeline.plan.md) · [Design](docs/02-design/features/f014-ingest-pipeline.design.md) · [Report](docs/05-act/f014-report.md). `pnpm ingest:all` — 관세청 무역(15101609 총량+15100475 국가별, 일본82%·중국18%) + DART 기업 6사(롯데케미칼 20.4조 등 실매출, corp_code 해소) + 그래프 11노드 + Vectorize. 정식 스키마 `migrations/0001`. share=△est(매출proxy). 다음=F015 Repository 실구현체·어댑터*
*- **F013 ✅** (M0 PoC 게이트 4/4 PASS): [Plan](docs/01-plan/features/f013-m0-poc-gate.plan.md) · [Design](docs/02-design/features/f013-m0-poc-gate.design.md) · [게이트 리포트](docs/05-act/f013-m0-gate-report.md) · [데이터 명세](docs/02-design/features/koami-givc-data-sources.md). 0a 관세청 15100475+15101609 활용신청 승인(제한없음/상업가능, Playwright 자동)·DART 키 유효 / 0b D1 깊이2 **0.37ms** / 0c Vectorize 의미검색 **100%**(bge-m3) / 0d 톨루엔 실데이터 4분기(2024Q1~Q4 JP+CN+US) 적재. 저장소 D1 `koami-givc-poc`·Vectorize `koami-givc-poc`(1024d). 교훈: curl이 %-인코딩 키 URL 거부(`malformed`)→node fetch 사용. **→ F014 진행 가능***
