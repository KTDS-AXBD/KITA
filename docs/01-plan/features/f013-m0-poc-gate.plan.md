# F013 — kita-givc M0 PoC 게이트 Planning Document

> **Summary**: 실데이터 파이프라인(kita-givc) **착수 게이트**. ① 공개데이터 소스·라이선스 확정(0a) ② D1 그래프 깊이2 ≤50ms(0b) ③ Vectorize 의미검색 ≥80%·비용추산(0c) ④ 적재 1라운드 스크립트 재현(0d). **4개 전부 통과 시에만 M1(F014~F016) 착수.** 미달 시 저장소 재선택 또는 범위 축소(§5.5). 신규 스택(D1 그래프·Vectorize·임베딩) 러닝커브 + 외부 결정(데이터소스·라이선스)이 섞인 리스크 선소거가 목적.
>
> **Project**: KITA PoC (kita-givc 트랙) · **Version**: 0.1.0 · **Author**: 서민원 + Claude Code · **Date**: 2026-05-25 · **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | S6 톨루엔 화면은 100% Mock. "GIVC 위 온톨로지"의 설득력은 *실데이터*에서 나오지만, 신규 스택(D1 그래프·Vectorize·임베딩)과 외부 결정(데이터소스·라이선스)에 미검증 리스크가 커서 곧장 적재 파이프라인(F014)에 들어가면 매몰비용 위험. |
| **Solution** | **M0 선행 게이트** — 실제 적재 전에 0a~0d 4개 PoC로 "이 저장소·소스로 가능한가"를 작은 수직 슬라이스로 입증. 통과 시 M1, 미달 시 즉시 저장소 재선택/범위 축소. |
| **Function/UX Effect** | 화면 변화 0 (PoC는 백엔드·스크립트 레벨). 산출물은 *판단 근거* — 소스 비교표·성능 벤치·정확도 측정·비용 추산. |
| **Core Value** | 낙관 일정 금지(PRD §6.1). 작은 실패를 빨리 사서, F014~F016(P0 5~6일)에 잘못된 전제로 진입하는 큰 실패를 막는다. |

---

## 1. Overview

### 1.1 Purpose

kita-givc Phase 1(비PII 공개데이터·S6 톨루엔 수직 슬라이스)의 **착수 가부**를 결정한다. PRD §4.0 M0 게이트(0a~0d)를 실행해 저장소(D1+Vectorize+R2) *제안*을 검증/확정한다.

### 1.2 Background

- PRD `docs/req/kita-givc/prd-final.md` §4.0(M0)·§5.5(중단조건)·§6.2(기술스택 제안)·§7(오픈이슈 #4·#5).
- 기술스택은 **제안 단계** — "M0에서 검증"이라고 PRD가 명시. 즉 D1 그래프 적정성·Vectorize 도입 여부가 본 게이트의 검증 대상.
- 신규 스택 러닝커브로 M0에 **별도 버퍼** 배정(낙관 일정 금지, §6.1).

**fs 실측 (2026-05-25):**
- **Repository 패턴 기구축** — `src/data/repository/TolueneRepository.ts`에 인터페이스 정의 + `MockTolueneRepository` 구현. `src/data/repository/index.ts`가 싱글턴 export. 화면은 `tolueneRepository.getProduct()` 식으로 소비(`features/toluene/S6Page.tsx`).
- ⚠️ **인터페이스가 동기** — `getProduct(): TolueneProduct` 등 7개 메서드 모두 `Promise` 아님. 실데이터(D1/Vectorize)는 본질적으로 비동기 → **동기/비동기 불일치**가 "화면 코드 무변경"(PRD §5.1 KPI=변경량 0)의 최대 장애물(§6.3 결정 필요).
- **출처메타 강제 기구축** — `src/types/provenance.ts`: `Provenance = 'real'|'est'|'virt'` + `SourceMap<K>`(키 누락 시 컴파일 에러). 적재 스키마는 이 메타를 NOT NULL 컬럼으로 그대로 승계해야 함.
- **빌드타임 스냅샷 선례** — `src/data/graph-layout/s6.layout.json`(force-layout 1회→JSON). 동기 인터페이스+오프라인을 동시에 만족시킨 기존 패턴 → 실데이터에도 재사용 후보(§6.3).
- S6 도메인 타입: `src/types/toluene.ts`(TolueneProduct/TolueneCompany/TradeSeries/WordCloudCollection/TolueneHintCard/KnowledgeGraph). 적재 어댑터의 타깃 shape.

### 1.3 Related Documents

- SSOT: `SPEC.md` F013 (Sprint S4), 의존: F014~F016
- PRD `docs/req/kita-givc/prd-final.md` (로컬전용) §4.0·§5·§6.2·§7
- 인터페이스 계약: `src/data/repository/TolueneRepository.ts`, `src/types/provenance.ts`

---

## 2. Scope

### 2.1 In Scope (F013 = M0 게이트)

- [ ] **0a 소스·라이선스 확정** — S6(무역통계·기업·뉴스) 커버 가능한 공개 소스 1세트 선정 + **상업적 이용 가능 확인**(라이선스 캡처). 비교표(§6.1) 근거.
- [ ] **0b D1 그래프 PoC** — 톨루엔 노드·엣지(≤50) 인접리스트 D1 적재 → **깊이 2 탐색 ≤50ms** 실측(반복 측정 중앙값).
- [ ] **0c Vectorize 의미검색 PoC** — 샘플 텍스트 임베딩(CF Workers AI) → Vectorize 검색 **정확도 ≥80%**(라벨링된 샘플셋 N건) + **예상 볼륨 비용 추산**(임베딩·쿼리·스토리지).
- [ ] **0d 적재 1라운드 PoC** — 대표 소스 1종 추출→정규화→D1 적재→조회 1회 성공(`scripts/ingest/poc-*.mjs`, 재현 가능).
- [ ] **게이트 판정 리포트** — `docs/05-act/f013-m0-gate-report.md`: 0a~0d PASS/FAIL + 측정치 + 진행/축소/재선택 권고.
- [ ] **저장소 리소스 프로비저닝**(PoC 범위) — D1 DB 1개 + Vectorize 인덱스 1개(소규모). R2는 0d 원본 보관 시만.

### 2.2 Out of Scope (→ F014~F016)

- 본 적재 파이프라인·전체 스키마(F014) / Repository 실구현체·어댑터(F015) / S6 4종 조회·회귀(F016)
- S4 R&D 슬라이스(Phase 1 제외, S6 단일 입증 집중)
- GIVC 직접 적재·PII(Phase 2, F017, 외부 게이트)
- 증분 적재·스케줄·실시간 동기화(P2/Phase 2)
- 화면 코드 변경(M0는 백엔드·스크립트 레벨)

### 2.3 비가역/대외 작업 (Safety Judgment)

| 작업 | 등급 | 주체 |
|------|------|:----:|
| PoC 스크립트·스키마·벤치 코드 | 코드 | 🤖 자동 |
| 데이터소스 후보 리서치·비교표 | 분석 | 🤖 자동 |
| **공개데이터 API key 신청**(data.go.kr·OpenDART 등) | 대외 계정 | 👤 **Master** |
| **데이터소스 최종 선정·라이선스 수용 판단** | 비즈니스 결정 | 👤 **Master** |
| **CF D1/Vectorize 리소스 생성**(`wrangler d1 create` 등) | 계정 자원(저비용·가역) | 👤 Master 승인 후 🤖 |
| Vectorize 임베딩 호출(실 과금) | 과금 | 🤖(소량) / 비용 추산은 보고 |

> 0a 최종 선정은 Master 결정(오픈이슈 #4·#5). 🤖는 후보 조사·비교표·라이선스 캡처까지.

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | (0a) S6 3종 데이터 커버 공개소스 후보 비교표 — 커버리지·라이선스(상업이용)·포맷·접근방식·갱신주기·HS코드 단위 | High | Pending |
| FR-02 | (0a) 선정 소스의 라이선스 **상업적 이용 가능** 명시 캡처(공공누리 유형 or 약관 인용) | High | Pending |
| FR-03 | (0b) 톨루엔 그래프(≤50 노드) D1 인접리스트 스키마 + 깊이2 재귀 조회(CTE/반복) | High | Pending |
| FR-04 | (0b) 깊이2 탐색 **≤50ms** 실측(워밍업 후 중앙값, 측정 스크립트 포함) | High | Pending |
| FR-05 | (0c) 샘플 텍스트→CF Workers AI 임베딩→Vectorize upsert→top-k 검색 | High | Pending |
| FR-06 | (0c) 라벨링 샘플셋 기준 **정확도 ≥80%**(질의-정답 매칭률) | High | Pending |
| FR-07 | (0c) 예상 볼륨(문서수·차원·쿼리/일) 기준 **월 비용 추산표** | High | Pending |
| FR-08 | (0d) 1종 소스 추출→정규화→출처메타 부착→D1 적재→조회 1회 성공 스크립트(`scripts/ingest/poc-toluene.mjs`) | High | Pending |
| FR-09 | M0 게이트 판정 리포트(PASS/FAIL/측정치/권고) | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement |
|----------|----------|-------------|
| 성능 | 그래프 깊이2 ≤50ms (0b) | wrangler d1 execute 반복 실측 |
| 정확도 | 의미검색 ≥80% (0c) | 라벨 샘플셋 hit rate |
| 비용 | Vectorize+임베딩 월 추산 명시 (0c) | 단가×볼륨 산식 |
| 재현성 | 적재 1라운드 1명령 재현 (0d) | 클린 상태 재실행 PASS |
| 출처메타 | PoC 적재행도 provenance NOT NULL | 스키마 제약 |
| 라이선스 | 상업적 이용 가능 근거 보존 (0a) | 약관/라이선스 캡처 |

---

## 4. Success Criteria

### 4.1 Definition of Done (= 게이트 통과 조건)

- [ ] **0a** 🤖→👤: 소스 비교표 작성 + Master가 1세트 선정 + 상업이용 라이선스 확인
- [ ] **0b** 🤖: 톨루엔 그래프 D1 적재 후 깊이2 탐색 **≤50ms** 실측 캡처
- [ ] **0c** 🤖: 샘플 의미검색 **≥80%** + 비용 추산표
- [ ] **0d** 🤖: 적재 1라운드 스크립트 재현 성공(행수·출처메타 검증 PASS)
- [ ] **게이트 판정**: 4개 PASS → "M1 진행" 권고 / 0b·0c 미달 → "저장소 재선택 or 범위 축소"(§5.5) 권고 리포트
- [ ] **👤 Master**: API key 신청 + CF 리소스 생성 승인 + 최종 게이트 판정 수용

### 4.2 Quality Criteria

- [ ] 측정치는 *실측*(추정·예상치 금지 — Production Smoke 메타규칙 준수)
- [ ] 0b/0c 미달 시 대안(전용 그래프 DB / 외부 벡터 / 범위축소) 분기 명시
- [ ] PoC 산출물(스크립트·스키마·리포트) 실파일 존재(hallucination 금지)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **동기/비동기 인터페이스 불일치** (현 Repo 동기, 실데이터 비동기) → 화면 코드 변경 유발 | High | High | §6.3 결정 — **빌드타임/적재후 스냅샷**(기존 `s6.layout.json` 선례)으로 동기 인터페이스 유지. M0에서 스냅샷 경로 PoC로 선검증 |
| 뉴스 풀텍스트 저작권(BIGKinds 전재·복제·배포 금지) | High | High | 워드클라우드는 **메타데이터/키워드**만 사용(공개) 또는 뉴스는 Phase1 ※가상 유지(범위 축소). 0a에서 확정 |
| 공개데이터 라이선스 상업이용 불가/모호 | High | Med | 0a에서 KOGL 유형·약관 명시 캡처. data.go.kr 공공누리 우선(상업이용 가능 유형 확인) |
| D1 그래프 깊이2 >50ms (재귀 CTE 한계) | Med | Med | 인접리스트+인덱스 튜닝 / 사전계산 경로 테이블 / 미달 시 대안 그래프(§5.5) |
| Vectorize 비용 급증(대량 텍스트) | Med | Med | 0c 비용 추산 선행 + 데모 볼륨 한정. 임계 초과 시 RAG는 P1로 후순위 |
| 신규 스택 러닝커브로 M0 지연 | Med | High | 버퍼 배정(§6.1). 수직 슬라이스(톨루엔 1종)로 범위 최소화 |
| HS코드 매핑 불일치(2902.30 톨루엔 정확성) | Low | Med | HS 6자리 290230 기준 + 품목 라벨 교차확인 |

---

## 6. Architecture Considerations

### 6.1 데이터소스 후보 비교 (0a 리서치 결과 — 2026-05-25)

> 위임 리서치 산출. **✅ 소스 세트 확정**(Master 수용 2026-05-25): 무역=관세청(data.go.kr) / 기업=OpenDART / 뉴스=뉴스빅데이터 메타데이터. 라이선스 유형(KOGL)·약관은 0a에서 데이터셋별 정밀 캡처. (오픈이슈 #4·#5 → 소스 결정분 해소, API key·라이선스 캡처 잔여.)

| 종류 | 후보 | 커버리지 | 라이선스(상업이용) | 접근 | 권고 |
|------|------|----------|-------------------|------|:----:|
| **무역통계** | **관세청 품목별/국가별 수출입실적** (data.go.kr OpenAPI) | HS 2/4/6/10자리 → **톨루엔 290230 직접** | 공공누리(KOGL) — data.go.kr 대다수 **Type1**(출처표시·상업·변경 허용). *데이터셋별 유형 0a 확인* | 무료 API key, JSON/XML. endpoint `apis.data.go.kr/1220000/nitemtrade/getNitemtradeList` | ⭐ **정본** |
| 무역통계(보조) | UN Comtrade | 글로벌 HS 290230 교역흐름 | 무료티어(500 calls/day·100K rec/call), attribution·재배포 제한 약관 확인 | 무료 API key | △ 글로벌 비교용 |
| 무역통계(대안) | K-stat (무역협회, 산업부 위탁) | 국내 최대 수출입 DB | API·재배포 약관이 data.go.kr보다 덜 개방 | 웹 중심 | 비추(정본은 관세청) |
| **기업** | **OpenDART** (금감원 전자공시) | 석유화학 상장사(롯데케미칼·한화토탈·S-Oil·GS칼텍스 등) 공시·재무·기업개황 | 공공 공시데이터, 무료 API key — *약관 0a 확인* | 무료 API key, JSON/XML | ⭐ **추천** |
| 기업(보조) | data.go.kr 기업기본정보 | 사업자·기업 기본 | 공공누리 | 무료 API | △ 보완 |
| **뉴스** | BIGKinds 풀텍스트 | 톨루엔 관련 기사 본문 | ⚠️ **저작권 보호**(전재·복제·배포 금지) → 원문 재배포 불가 | API(승인) | ❌ 원문 부적합 |
| 뉴스(대안1) | 한국언론진흥재단 **뉴스빅데이터 메타데이터** (data.go.kr) | 키워드·빈도·메타 | 공공누리 | data.go.kr | ⭐ **워드클라우드용**(메타만) |
| 뉴스(대안2) | (범위축소) 뉴스 Phase1 ※가상 유지 | — | — | — | △ §5.5 fallback |

**0a 핵심 판단**: 무역통계·기업은 공개·상업이용 가능성 높음 → 실데이터화. **뉴스 풀텍스트는 라이선스 차단** → 메타데이터 키워드 대체 or 가상 유지가 0a의 실질 결정.

### 6.2 저장소 PoC 설계 (제안 — M0 검증 대상)

```
scripts/ingest/poc-toluene.mjs        # 0d: 1종 소스 추출→정규화→provenance 부착→D1 upsert→조회
scripts/poc/bench-graph.mjs           # 0b: 깊이2 탐색 반복 실측(중앙값)
scripts/poc/bench-vectorize.mjs       # 0c: 임베딩→upsert→top-k→정확도/비용

D1 (정형·그래프·FTS5)
  ├─ trade_stats(hs_code, country, period, value, ..., provenance)   # 정형
  ├─ graph_nodes(id, label, type, provenance) / graph_edges(src,dst,rel)  # 인접리스트(0b)
  └─ news_meta(keyword, freq, ...) FTS5                                # 전문검색(대안1)
Vectorize (의미검색, 0c)               # 임베딩 인덱스(샘플)
R2 (원본)                              # 0d 원본 파일 보관(선택)
임베딩: CF Workers AI
```

### 6.3 핵심 결정 — 동기 인터페이스 보존 (Design 확정 대상)

| 옵션 | 설명 | 화면변경 | 오프라인 | 비고 |
|------|------|:-------:|:-------:|------|
| **A. 빌드타임/적재후 스냅샷** ⭐ | 적재→D1/Vectorize→**정적 JSON 스냅샷** 생성→프론트는 스냅샷 동기 조회(`s6.layout.json` 선례) | **0** | ✅ 자동 | Phase1 전체 재적재 허용(PRD §4.2)과 정합. D1/Vectorize 라이브 조회는 적재검증·Worker RAG용 |
| B. 인터페이스 async화 | `getProduct(): Promise<T>` + 화면 await | 다수 | △ | KPI(변경량 0) 위반 |
| C. 앱 init 프리페치 | 시작 시 전부 로드 후 동기 서빙 | 소(부트스트랩) | △ 번들 필요 | 초기 로딩 영향 |

> **권고 A** — M0에서 "적재→스냅샷→동기 조회" 경로를 0d에 포함해 선검증. F015 어댑터는 스냅샷 생성 단계에서 스키마차 흡수. (확정은 `/pdca design` 단계.)

### 6.4 공수 추정

| 단계 | 작업 | 실행 | 추정 |
|------|------|:----:|------|
| 0a | 소스 비교표(완료) + Master 선정·API key·라이선스 확인 | 🤖+👤 | 0.5일 |
| 0b | D1 그래프 스키마+적재+깊이2 벤치 | 🤖 | 0.5일 |
| 0c | 임베딩+Vectorize+정확도/비용 | 🤖 | 0.5~1일 |
| 0d | 적재 1라운드 스크립트(+스냅샷 경로 PoC) | 🤖 | 0.5일 |
| 판정 | 게이트 리포트 | 🤖 | 0.25일 |
| **합계** | (신규스택 버퍼 포함) | | **~2~2.5일** |

---

## 7. Convention Prerequisites

- [x] Repository 패턴·provenance 타입·빌드타임 스냅샷 선례 확립(S1)
- [ ] 👤 data.go.kr·OpenDART API key 발급(Master)
- [ ] 👤 CF D1/Vectorize 리소스 생성 승인 — `wrangler d1 create kita-givc` / `wrangler vectorize create`
- [ ] `wrangler.jsonc`에 D1/Vectorize 바인딩 추가(PoC 범위, example 동기화)
- [ ] `scripts/ingest/`·`scripts/poc/` 디렉토리(신규)

---

## 8. Next Steps

1. [ ] `/pdca design f013-m0-poc-gate` — D1 그래프 스키마·재귀조회, Vectorize 인덱스·샘플셋·정확도 산식, 적재 스크립트 IO, **§6.3 동기 인터페이스 옵션 확정(권고 A)**, 게이트 판정 기준 수치화
2. [x] SPEC.md F013 📋→🔄 (본 세션 전환 완료)
3. [x] 0a 소스 세트 확정(관세청+OpenDART+뉴스메타, 2026-05-25) — 잔여: 👤 Master API key 신청 + CF 리소스 생성 승인 + 라이선스 캡처
4. [ ] 🤖 0b→0c→0d PoC 실행 → 게이트 판정 리포트
5. [ ] 게이트 PASS 시 → F014(적재 파이프라인) Plan / FAIL 시 → 저장소 재선택 or 범위 축소(§5.5)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-25 | 초안 — M0 게이트(0a~0d) Plan. 데이터소스 비교표(관세청 data.go.kr 정본·OpenDART 기업·뉴스 메타데이터 대안), 동기 인터페이스 보존 결정(권고=스냅샷), 신규스택 버퍼 공수 ~2~2.5일 | 서민원 + Claude Code |
