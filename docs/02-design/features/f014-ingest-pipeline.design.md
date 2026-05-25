# F014 — kita-givc 적재 파이프라인 + 저장소 스키마 Design Document

> **Plan**: [f014-ingest-pipeline.plan.md](../../01-plan/features/f014-ingest-pipeline.plan.md) · **데이터 명세**: [kita-givc-data-sources.md](kita-givc-data-sources.md) · **Date**: 2026-05-25 · **Status**: Draft
> **검증 완료(fs 실측)**: 관세청 무역 200(F013) · DART corpCode→corp_code 해소 · company.json 개황 · fnlttSinglAcnt 매출(롯데케미칼 2024 20.4조).

---

## 1. Design Goals

F013 PoC를 정식 파이프라인으로 승격 + DART 기업 적재 추가. **재현 가능·출처메타 강제·검증/롤백·동기 스냅샷**. 화면/Repository 무변경(F015 별도).

## 2. 저장소 스키마 (D1 migration)

`migrations/0001_kita_givc.sql` (PoC 스키마 승격 + companies 추가):

```sql
-- 무역 (관세청) — TradeSeries 원천
CREATE TABLE trade_stats (
  hs_code TEXT NOT NULL, period TEXT NOT NULL,         -- 'YYYYQn'
  exports REAL NOT NULL, imports REAL NOT NULL, unit TEXT NOT NULL DEFAULT 'USD',
  src_date TEXT, provenance TEXT NOT NULL CHECK(provenance IN('real','est','virt')),
  PRIMARY KEY(hs_code, period));
-- 국가별 (그래프 국가노드·비중)
CREATE TABLE trade_by_country (
  hs_code TEXT NOT NULL, cnty_cd TEXT NOT NULL, cnty_nm TEXT NOT NULL,
  exports REAL NOT NULL, imports REAL NOT NULL, share REAL,   -- 수입 비중
  provenance TEXT NOT NULL, PRIMARY KEY(hs_code, cnty_cd));
-- 기업 (DART) — TolueneCompany
CREATE TABLE companies (
  id TEXT PRIMARY KEY, corp_code TEXT, name TEXT NOT NULL, biz TEXT,
  sales TEXT, share TEXT, core_type INTEGER, role TEXT,
  provenance TEXT NOT NULL CHECK(provenance IN('real','est','virt')));
-- 그래프 (KnowledgeGraph)
CREATE TABLE graph_nodes (id TEXT PRIMARY KEY, type TEXT NOT NULL, label TEXT NOT NULL,
  r REAL NOT NULL DEFAULT 8, meta TEXT, provenance TEXT NOT NULL);
CREATE TABLE graph_edges (src TEXT NOT NULL, dst TEXT NOT NULL, PRIMARY KEY(src,dst));
CREATE INDEX idx_edges_src ON graph_edges(src);
-- 뉴스 (P1, FTS5)
CREATE VIRTUAL TABLE news_meta USING fts5(keyword, freq UNINDEXED, sentiment UNINDEXED, provenance UNINDEXED);
```

## 3. 적재 소스별 매핑 (검증 기반)

### 3.1 관세청 무역 (✅ F013 검증)
- **15101609** `Itemtrade/getItemtradeList` → `year`(YYYY.MM)→분기 집계 → `trade_stats`(provenance=real).
- **15100475** `nitemtrade/getNitemtradeList` cntyCd별 → `trade_by_country`. 비중 = 국가수입 / Σ수입.
- ⚠️ Encoding 키 raw append (URLSearchParams 금지), XML 파서.

### 3.2 DART 기업 (✅ 검증)
- **대상 corp_code**(verified): 롯데케미칼 00165413 · 금호석유화학 00106368 · 대한유화 00260383 · 효성화학 01316236 · 한화토탈에너지스 00461593 · 여천NCC 00278373.
- **company.json** → `corp_name`(name)·`induty_code`(→biz 라벨)·`ceo_nm`/`est_dt`(meta).
- **fnlttSinglAcnt.json**(bsns_year=2024, reprt_code=11011, fs_div=CFS) → `account_nm="매출액"`의 `thstrm_amount`(원) → `sales`(조 단위 포맷).
- **share** = 기업매출 / Σ(대상기업 매출) → **△est**(전사 매출 기반 proxy, 톨루엔 시장점유 아님 — 출처표기로 한계 명시).
- **core_type/role**: 톨루엔 밸류체인 분류(원료공급=1·후방수요/가공=2) — 큐레이션(소수), provenance △est.
- 비상장사(여천NCC·한화토탈): company.json OK, 재무는 외감 사업보고서 존재 시 적재(없으면 sales=△est/null).

### 3.3 그래프 빌드
- 노드: TOL(rnd) + HS290230(hscode) + 국가(trade_by_country 상위) + 기업(companies) + 용도/규제(metric, △est).
- 엣지: TOL↔HS·TOL↔국가·TOL↔기업. ≤50 노드(상위 선별).

### 3.4 Vectorize 코퍼스
- 엔티티(기업·국가·제품) 설명 텍스트 → bge-m3 임베딩 → upsert(mutation 폴링). doc_id=노드 id.

## 4. 검증·롤백 (FR-08)

- 도메인별: 행수>0 · 필수컬럼 NOT NULL · provenance ∈ {real,est,virt} · 수치 타입.
- 실패 시: 해당 도메인 적재 abort + 비제로 exit(부분 적재 잔재 금지). 전체 재적재 허용(멱등 upsert).

## 5. 오케스트레이션

```
scripts/ingest/lib/{d1,datagokr,dart}.mjs   # 공통 헬퍼
ingest-trade.mjs · ingest-companies.mjs · build-graph.mjs · ingest-vectorize.mjs
ingest-all.mjs  →  스키마확인 → 무역 → 기업 → 그래프 → 벡터 → 검증 → 리포트(도메인별 행수·provenance)
build-snapshot.mjs (Companies 추가)  →  s6.real.snapshot.json
```
- `pnpm ingest:all` 1명령. corpCode.xml은 `scripts/ingest/.cache/`에 캐시(재다운 방지).

## 6. Implementation Order

1. migration `0001_kita_givc.sql` + 적용
2. `lib/` 헬퍼(d1 검증·datagokr·dart)
3. ingest-trade(15101609+15100475) → 검증
4. ingest-companies(DART 6사) → 검증
5. build-graph(실데이터 노드·엣지)
6. ingest-vectorize(코퍼스)
7. ingest-all 오케스트레이션 + 검증 리포트
8. build-snapshot(Companies) → 재현 검증

## 7. Test Plan

| 대상 | 통과 |
|------|------|
| migration | 5테이블 생성 + d1_migrations 기록 |
| 무역 | trade_stats 분기 + trade_by_country 국가 적재 |
| 기업 | companies 6사 + 매출 실값 + share△est |
| 그래프 | ≤50 노드, provenance NOT NULL 100% |
| 재현 | `pnpm ingest:all` 클린 재실행 PASS |
| 스냅샷 | shape 일치(TradeSeries·Companies·Graph) |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-25 | 초안 — 스키마 DDL, DART 6사 corp_code 검증 매핑, share △est, 오케스트레이션. 무역·DART 경로 fs 실측 완료 | 서민원 + Claude Code |
