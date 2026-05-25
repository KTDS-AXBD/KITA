---
id: KOAMI-PLAN-012
title: Sprint 12 — F025 실 GIVC 스키마 미러(D1) + 멀티도메인 적재
sprint: 12
f_items: [F025]
status: IN_PROGRESS
created: 2026-05-25
---

# Sprint 12 Plan — F025: 실 GIVC 스키마 미러(D1) + 멀티도메인 적재

## 1. 목표

M0 게이트(F024) ✅ GO를 바탕으로, 고객 실 `gvc.*` 스키마 패턴을 D1에 **의미 기반 이름**으로 미러링하고 기계+반도체 멀티도메인 데이터를 적재한다.

> **🚨 핵심 제약**: 이 레포는 Public — 실 컬럼코드·실 GVC코드·DDL 원문 커밋 절대 금지. 의미명 + virt GVC코드(`GVC-MACH-*`, `GVC-SEMI-*`)만 사용.
> **M0 발견 반영**: mart.* 미제공 → 무역/기업재무는 기존 `koami-givc` 파이프라인 유지. 신규 미러 = scmm 지표 + product_network 그래프만.

## 2. 배경 및 현황

| 현재 | 목표 |
|------|------|
| 자체 발명 스키마 5테이블 (trade_stats·companies·graph_nodes/edges·news_meta) | GVC코드 PK + product_network 그래프 + scmm 지표 패턴 정렬 |
| HS코드 기반 품목 식별 | GVC코드 체계(`GVC-MACH-*`/`GVC-SEMI-*`) 도입 |
| 기계 단일 도메인 | 기계 + 반도체 멀티도메인 |
| Repository 없음 (GVC 레이어) | `GvcRepository` 인터페이스 + Mock 구현 |

## 3. 구현 범위

### 3.1 신규 파일

| 파일 | 설명 |
|------|------|
| `migrations/0003_gvc_mirror.sql` | GVC 스키마 미러 (gvc_products·gvc_network·gvc_metrics) |
| `scripts/ingest/gvc-seed.mjs` | 기계+반도체 멀티도메인 시드 데이터 적재 |
| `scripts/ingest/gvc-integrity.mjs` | §5.4 정합성 검증 (orphan·dangling·provenance) |
| `src/types/gvc.ts` | GvcProduct·GvcNetworkEdge·GvcMetric 타입 |
| `src/data/repository/GvcRepository.ts` | GvcRepository 인터페이스 + MockGvcRepository |

### 3.2 수정 파일

| 파일 | 변경 내용 |
|------|---------|
| `src/types/index.ts` | `export * from './gvc'` 추가 |
| `src/data/repository/index.ts` | GvcRepository export 추가 |
| `package.json` | `db:migrate:gvc`, `ingest:gvc`, `ingest:gvc:integrity` scripts 추가 |

### 3.3 변경 금지 (features/ diff 0)
- `src/features/` 하위 모든 파일 — 변경 없음
- `src/data/mock/` — 변경 없음
- 기존 migration `0001`, `0002` — 변경 없음
- 기존 ingest scripts — 변경 없음

## 4. 스키마 설계 요약 (의미명 원칙)

### gvc_products (GVC 품목 식별자)
- `gvc_code TEXT PK` — virt 포맷 가짜코드(`GVC-MACH-MC001`)
- `domain TEXT` — `mach` | `semi`
- `label TEXT` — 한글 품목명
- `hs_codes TEXT` — JSON array (관세청 연계용, 기존 파이프라인 참조)
- `tier TEXT` — `소재` | `부품` | `장비`
- `provenance TEXT` — CHECK(real|est|virt)

### gvc_network (product_network형 방향 그래프)
- `gvc_from TEXT FK → gvc_products`
- `gvc_to TEXT FK → gvc_products`
- `tier_label TEXT` — 가치사슬 단계 레이블
- `sort INTEGER` — 정렬 순서
- `provenance TEXT`

### gvc_metrics (scmm 계열 지표, 의미명)
- `gvc_code TEXT FK → gvc_products`
- `metric_key TEXT` — `metric_sales_growth` | `metric_capital_efficiency` | `metric_financial_cost_ratio` | `metric_inventory_turnover` | `metric_employment_change` | `metric_rnd_growth`
- `value REAL`, `unit TEXT`, `period TEXT`
- `provenance TEXT`

## 5. 데이터 도메인 설계

### 기계 도메인 (virt GVC코드, ※virt)
| GVC 코드 | 품목 | tier | HS 연계 |
|----------|------|------|---------|
| GVC-MACH-MC001 | 머시닝센터 | 장비 | 845710 |
| GVC-MACH-GB001 | 볼베어링 | 부품 | 848210 |
| GVC-MACH-GR001 | 기어감속기 | 부품 | 848340 |
| GVC-MACH-SS001 | 특수강 | 소재 | 722840 |

네트워크 방향: SS001 → GB001, SS001 → GR001, GB001 → MC001, GR001 → MC001

### 반도체 도메인 (virt GVC코드, ※virt)
| GVC 코드 | 품목 | tier | HS 연계 |
|----------|------|------|---------|
| GVC-SEMI-WF001 | 실리콘웨이퍼 | 소재 | 381800 |
| GVC-SEMI-SL001 | CMP슬러리 | 소재 | 382490 |
| GVC-SEMI-PG001 | 포토마스크 | 부품 | 903190 |
| GVC-SEMI-RI001 | 포토레지스트 | 소재 | 370130 |

네트워크 방향: SL001 → WF001, WF001 → PG001, RI001 → PG001

> HS 연계값은 기존 koami-givc trade_stats·trade_by_country의 hs_code와 연결 참조용. 실 데이터 추가 적재 없음(기존 파이프라인 유지).

## 6. §5.4 정합성 검증 항목

| 검증 | 기준 | 판정 |
|------|------|------|
| GVC orphan | gvc_metrics/gvc_network의 gvc_code → gvc_products 참조 0건 위반 | 0 = PASS |
| Edge dangling | gvc_from/gvc_to → gvc_products 존재 | 0 dangling = PASS |
| provenance | real/est/virt 외 값 없음 | 0 위반 = PASS |
| 도메인 균형 | mach/semi 각 products ≥ 2, metrics ≥ 4 | PASS |

## 7. DoD 체크리스트

- [ ] `migrations/0003_gvc_mirror.sql` — 3테이블(gvc_products·gvc_network·gvc_metrics), 의미명
- [ ] D1 local migrate PASS (`--local`)
- [ ] 기계+반도체 `gvc_products` 각 4건 적재
- [ ] `gvc_network` 엣지: 기계 4건, 반도체 3건
- [ ] `gvc_metrics` 각 도메인 × 6지표 = 최소 24건
- [ ] `gvc-integrity.mjs` orphan=0, dangling=0, provenance PASS
- [ ] `GvcRepository` 인터페이스 + MockGvcRepository 타입 에러 0
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm test` (vitest 23 회귀 유지)
- [ ] `git diff src/features/` → 변경 0줄
- [ ] 시각검증: Mock 콘솔에러 0 (real 모드도 콘솔에러 0)

## 8. 리스크

| 리스크 | 대응 |
|--------|------|
| FK 참조 오류 (gvc_network → gvc_products) | seed 순서: gvc_products 먼저, network/metrics 나중 |
| 기존 vitest 회귀 | GvcRepository Mock만 추가 — 기존 S6/Rnd Repository 무변경 |
| provenance 위반 노출 | gvc-integrity.mjs 적재 후 즉시 실행, CI 준용 |
