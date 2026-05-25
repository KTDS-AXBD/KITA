# F014 — kita-givc 적재 파이프라인 + 저장소 스키마 Planning Document

> **Summary**: F013 M0 게이트(4/4 PASS)에서 검증한 PoC 스크립트를 **정식 적재 파이프라인**으로 승격. ① D1 정식 스키마(migrations) ② 관세청 무역 적재 정식화(15101609 총량 + 15100475 국가별) ③ **DART 기업 적재 신규**(corpCode→company→재무) ④ 그래프·Vectorize 코퍼스 실데이터 빌드 ⑤ 검증·롤백 ⑥ 스냅샷 생성. Repository 실구현체·어댑터(F015)는 후속.
>
> **Project**: KITA PoC (kita-givc) · **Version**: 0.1.0 · **Author**: 서민원 + Claude Code · **Date**: 2026-05-25 · **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | F013 PoC는 톨루엔 무역 슬라이스만 적재(스크립트 단발). S6 화면을 실데이터로 채우려면 **기업(DART)·그래프·의미검색 코퍼스**까지 재현 가능한 파이프라인 + 정식 스키마가 필요. |
| **Solution** | PoC 스크립트를 `scripts/ingest/`로 정식화 — 관세청(무역) + **DART(기업)** + 그래프/Vectorize 빌드를 1명령 재현, 출처메타(⭐△※) 강제, 검증 실패 시 롤백/중단. |
| **Function/UX Effect** | 화면 변화 0(여전히 백엔드). 산출 = 실데이터로 채워진 D1/Vectorize + 스냅샷(F015가 소비). |
| **Core Value** | "GIVC 위 실데이터"의 핵심 — 무역·기업·그래프가 모두 ⭐real로 출처 추적 가능하게 적재. F013에서 입증한 저장소 위에 폭을 확장. |

---

## 1. Overview

### 1.1 Purpose

F013에서 타당성 입증한 D1+Vectorize 위에, S6 톨루엔 화면의 **전 데이터(무역·기업·그래프·뉴스P1)** 를 공개데이터에서 재현 가능하게 적재한다. 본 단계는 *적재 + 스키마*까지(조회·화면 연결은 F015/F016).

### 1.2 Background

- F013 게이트 4/4 PASS([리포트](../../05-act/f013-m0-gate-report.md)) — D1 그래프 0.37ms, Vectorize 100%, 관세청 실데이터 4분기 적재.
- 데이터 소스 확정: [데이터 수집 명세서](../../02-design/features/kita-givc-data-sources.md) — 관세청 15100475/15101609(✅ 승인), DART(✅ 키), 뉴스(P1).
- PoC 자산: `scripts/poc/schema-poc.sql`·`scripts/ingest/poc-toluene.mjs`·`scripts/poc/build-snapshot.mjs`.

**fs 실측 (2026-05-25):**
- 적재 대상 도메인 타입: `TolueneCompany`(name·biz·share·sales·coreType·role·source) / `TradeSeries` / `GraphNode`(company·country·hscode·rnd·metric).
- DART 신규 경로 미검증: corpCode.xml(zip)→company.json→fnlttSinglAcnt.json. corp_code 매핑 + 매출 추출 + share 추정 로직 신규.
- 현 Mock 기업명은 ※가상(○○석유화학 등) → 실 기업(롯데케미칼·한화토탈에너지스 등, corpCode 확정)으로 대체.

### 1.3 Related Documents

- SSOT: `SPEC.md` F014 (S5), 선행 F013 ✅, 후속 F015
- [데이터 수집 명세서](../../02-design/features/kita-givc-data-sources.md), [F013 Design](../../02-design/features/f013-m0-poc-gate.design.md)(스키마·스냅샷 옵션A)

---

## 2. Scope

### 2.1 In Scope (F014)

- [ ] **D1 정식 스키마(migrations)** — `migrations/000X_*.sql`: trade_stats·companies·graph_nodes·graph_edges·news_meta(FTS5). PoC 스키마 승격 + `d1_migrations` 기록.
- [ ] **관세청 무역 적재 정식화** — 15101609(총량→TradeSeries) + 15100475(국가별→국가노드·비중). 출처메타 ⭐real.
- [ ] **DART 기업 적재(신규)** — corpCode.xml→대상 기업 corp_code→company.json(업종·개황)→fnlttSinglAcnt.json(매출) → `companies` 테이블 + 그래프 company 노드. share=△est(매출기반).
- [ ] **그래프 빌드** — 실데이터(톨루엔↔HS↔국가↔기업) 노드·엣지 생성(≤50, provenance 부착).
- [ ] **Vectorize 코퍼스** — 실 엔티티 설명 텍스트 임베딩→upsert(의미검색용, mutation 폴링).
- [ ] **검증·롤백** — 행수·NOT NULL·출처메타 100%·스키마 타입. 실패 시 라운드 롤백 + 비제로 exit.
- [ ] **스냅샷 생성** — D1→`s6.real.snapshot.json`(KnowledgeGraph/TradeSeries/Companies shape, 옵션A).
- [ ] **재현성** — `pnpm ingest:all` 1명령(또는 도메인별) 클린 재실행.

### 2.2 Out of Scope (→ F015/F016)

- Repository 실구현체·어댑터 계층·화면 연결(F015)
- 4종 조회·회귀·성능(F016)
- 뉴스 워드클라우드 적재(P1 — 메타데이터 소스 확정 후)
- S4 R&D 슬라이스 / GIVC·PII(Phase 2)
- 증분 적재·스케줄(Phase 1은 전체 재적재)

### 2.3 비가역/대외 작업 (Safety Judgment)

| 작업 | 등급 | 주체 |
|------|------|:----:|
| 스키마·적재·검증 코드 | 코드 | 🤖 |
| D1 적재(remote upsert)·Vectorize upsert | 계정 자원(가역, 재적재 가능) | 🤖 |
| 임베딩 호출(실 과금, 소량) | 과금 | 🤖(소량) |
| D1 migration remote 적용 | 스키마 변경(가역, drop/recreate) | 🤖 + 보고 |

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | D1 정식 스키마 migration(trade_stats·companies·graph_*·news_meta) + d1_migrations 기록 | High | Pending |
| FR-02 | 관세청 15101609 총량→TradeSeries(분기) 적재 | High | Pending |
| FR-03 | 관세청 15100475 국가별→국가노드·비중 적재 | High | Pending |
| FR-04 | DART corpCode→대상 기업 corp_code 해소 + company.json 개황 적재 | High | Pending |
| FR-05 | DART fnlttSinglAcnt.json 매출→companies.sales, share=매출기반 △est | High | Pending |
| FR-06 | 그래프 노드·엣지 실데이터 빌드(≤50, provenance NOT NULL) | High | Pending |
| FR-07 | Vectorize 코퍼스 실데이터 임베딩·upsert(폴링 반영) | Medium | Pending |
| FR-08 | 적재 검증(행수·NOT NULL·출처메타·타입) + 실패 시 롤백·비제로 exit | High | Pending |
| FR-09 | 스냅샷 생성(D1→JSON, 도메인 shape 일치) | High | Pending |
| FR-10 | `pnpm ingest:all` 1명령 재현 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement |
|----------|----------|-------------|
| 재현성 | 클린 D1 → 1명령 전체 적재 PASS | 재실행 |
| 출처메타 | 전 적재행 provenance NOT NULL | 스키마 제약 |
| 정합성 | 검증 PASS(행수>0·필수 NOT NULL) | 검증 스텝 |
| 노드 수 | 그래프 ≤50 | 빌드 카운트 |
| 멱등성 | 재적재 시 중복 없음(upsert 키) | PK/INSERT OR REPLACE |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] D1 migration 적용 + 4개 테이블 생성(d1_migrations 기록)
- [ ] 관세청 무역(총량+국가별) 실데이터 적재 + 검증 PASS
- [ ] DART 기업 5~8사 개황+매출 적재(corp_code 실해소) + 그래프 company 노드
- [ ] 그래프 실데이터 빌드(≤50, provenance 100%) + Vectorize 코퍼스 upsert
- [ ] 스냅샷 `s6.real.snapshot.json` 생성(Companies 포함 shape)
- [ ] `pnpm ingest:all` 클린 재현 + 검증 PASS
- [ ] 적재 통계 리포트(도메인별 행수·provenance 분포)

### 4.2 Quality Criteria

- [ ] 출처메타 누락 0(NOT NULL 강제)
- [ ] 검증 실패 시 부분 적재 잔재 0(롤백)
- [ ] 실측 데이터(hallucination 0 — DART 응답 실파싱)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| DART corpCode.xml(zip) 파싱·corp_code 매핑 부정확 | High | Med | 기업명 다중 후보 매칭 + 수동 확정 목록. 톨루엔 관련사 선별 |
| DART 재무 계정 구조 복잡(연결/별도·reprt_code) | Med | Med | 주요계정(fnlttSinglAcnt) 매출액 우선, reprt_code=11011(사업보고서) |
| share 직접 데이터 없음 | Med | High | 매출기반 △est 명시(출처표기), 또는 ※가상 |
| 그래프 노드 50 초과 | Low | Low | 핵심 엔티티 선별(상위 기업·국가) |
| Vectorize 비용 | Low | Low | 코퍼스 한정(F013 추산), 폴링 반영 |
| 무역 1년 제한(API) | Low | Med | 연도별 분할 호출 후 병합 |

---

## 6. Architecture Considerations

### 6.1 적재 파이프라인 구조

```
scripts/ingest/
  ├─ lib/d1.mjs            # wrangler d1 execute 래퍼 + 검증/롤백 헬퍼
  ├─ lib/datagokr.mjs      # 관세청 fetch+XML 파서 (raw key)
  ├─ lib/dart.mjs          # OpenDART fetch+JSON (corpCode·company·재무)
  ├─ ingest-trade.mjs      # 15101609+15100475 → trade_stats·국가노드
  ├─ ingest-companies.mjs  # DART → companies·기업노드
  ├─ build-graph.mjs       # 노드·엣지 조립(provenance)
  ├─ ingest-vectorize.mjs  # 코퍼스 임베딩·upsert
  └─ ingest-all.mjs        # 오케스트레이션(검증·롤백·리포트)
migrations/000X_kita_givc.sql   # 정식 스키마
scripts/poc/build-snapshot.mjs  # 재사용(Companies 추가)
```

### 6.2 Key Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| 무역 총량 vs 국가별 | 둘 다(15101609 차트·15100475 노드) | 명세서 §2.1/§2.2 |
| 기업 소스 | DART(company+fnlttSinglAcnt) | 키 검증됨, 공개 공시 |
| share | △est(매출기반) | DART 직접 데이터 없음 |
| 적재 단위 | 1 도메인 1 라운드, 실패 시 롤백 | F013 Design §6.2 |
| 동기 인터페이스 | 스냅샷(옵션A) 유지 | F013 확정 |

### 6.3 공수 추정

| 단계 | 작업 | 추정 |
|------|------|------|
| 스키마 | migration 정식화 | 0.3일 |
| 무역 | 적재 정식화(PoC 승격) | 0.3일 |
| 기업 | DART corpCode·company·재무(신규) | 0.7일 |
| 그래프·벡터 | 실데이터 빌드 | 0.4일 |
| 검증·스냅샷·재현 | 오케스트레이션 | 0.3일 |
| **합계** | | **~2일** |

---

## 7. Convention Prerequisites

- [x] F013 PoC 자산 + CF 리소스(D1·Vectorize) + API key/DART key
- [ ] `migrations/` 디렉토리(신규) + wrangler d1 migrations 설정
- [ ] DART 대상 기업 corp_code 확정(corpCode.xml)

---

## 8. Next Steps

1. [ ] `/pdca design f014-ingest-pipeline` — DART corp_code 매핑·재무 계정 추출·share 산식, 스키마 DDL, 검증·롤백 상세, 오케스트레이션
2. [x] SPEC F014 📋→🔄
3. [ ] 구현: 스키마→무역→기업→그래프→벡터→스냅샷→재현 검증
4. [ ] F015(Repository 실구현체·어댑터·화면 연결)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-25 | 초안 — PoC 승격 + DART 기업 적재 신규 + 정식 스키마/검증/롤백/스냅샷. F013 게이트 PASS 기반 | 서민원 + Claude Code |
