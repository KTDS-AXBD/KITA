---
id: KOAMI-RPRT-012
title: Sprint 12 — F025 완료 리포트
sprint: 12
f_items: [F025]
match_rate: 100
status: DONE
date: 2026-05-25
---

# Sprint 12 Report — F025: 실 GIVC 스키마 미러(D1) + 멀티도메인 적재

## 결과 요약

**Match Rate: 100% (13/13 DoD PASS)** — iterate 없음.

| 지표 | 목표 | 실적 |
|------|------|------|
| migration 테이블 | 3개 | 3개 (gvc_products·gvc_network·gvc_metrics) |
| gvc_products | 8건 (mach 4 + semi 4) | 8건 ✅ |
| gvc_network | 7건 (mach 4 + semi 3) | 7건 ✅ |
| gvc_metrics | ≥24건 | 48건 (6지표 × 8 products) ✅ |
| §5.4 정합성 | 7/7 PASS | orphan=0, dangling=0, provenance 무결성 ✅ |
| vitest | 회귀 유지 | 31/31 PASS (기존 23 + 신규 8) ✅ |
| features/ diff | 0줄 | 0줄 ✅ |
| typecheck / lint / build | PASS | PASS ✅ |

## 구현 내역

### 신규 파일 (6건)
- `migrations/0003_gvc_mirror.sql` — GVC 스키마 미러 (의미명 칼럼, virt GVC코드, provenance CHECK)
- `scripts/ingest/gvc-seed.mjs` — 기계+반도체 멀티도메인 virt 시드 적재
- `scripts/ingest/gvc-integrity.mjs` — §5.4 정합성 검증 (7가지 체크, exit code)
- `src/types/gvc.ts` — GvcProduct/GvcNetworkEdge/GvcMetric/GvcDomain 타입
- `src/data/repository/GvcRepository.ts` — GvcRepository 인터페이스 + MockGvcRepository
- `src/data/repository/__tests__/GvcRepository.test.ts` — 8 vitest

### 수정 파일 (3건)
- `src/types/index.ts` — `export * from './gvc'` 추가
- `src/data/repository/index.ts` — gvcRepository/GvcRepository export 추가
- `package.json` — `db:migrate:gvc`, `ingest:gvc`, `ingest:gvc:integrity` scripts 추가

## 제약 준수 확인

| 제약 | 상태 |
|------|------|
| 실 컬럼코드 미포함 | ✅ 의미명만 (metric_sales_growth 등) |
| 실 GVC코드 미포함 | ✅ virt 포맷만 (GVC-MACH-xxx, GVC-SEMI-xxx) |
| 실 schema 원본(로컬전용) 미커밋 | ✅ gitignore 유지 |
| mart.* 미러 없음 (기존 파이프라인 유지) | ✅ trade_stats/companies 등 기존 5테이블 무변경 |
| features/ diff 0 | ✅ 0줄 |
| merge 금지 | ✅ PR 생성까지만 |

## 도메인 데이터 구조

### 기계 (mach, provenance=virt)
```
GVC-MACH-SS001(특수강/소재) → GVC-MACH-GB001(볼베어링/부품) → GVC-MACH-MC001(머시닝센터/장비)
                            ↘ GVC-MACH-GR001(기어감속기/부품) ↗
```

### 반도체 (semi, provenance=virt)
```
GVC-SEMI-SL001(CMP슬러리/소재) → GVC-SEMI-WF001(실리콘웨이퍼/소재) → GVC-SEMI-PG001(포토마스크/부품)
GVC-SEMI-RI001(포토레지스트/소재) ↗
```

### scmm 지표 6종 (provenance=est, 공개 산업보고서 기반)
metric_sales_growth / metric_capital_efficiency / metric_financial_cost_ratio /
metric_inventory_turnover / metric_employment_change / metric_rnd_growth

## 다음 단계 (F026, S13)

- `GvcRepository` 인터페이스를 `S6Repository`/`RndRepository`에 통합 (GVC 재정렬)
- `gvc_products.hs_codes` → 기존 `trade_stats`/`trade_by_country` 연결 어댑터
- 통합 시나리오 (mach+semi 교차 비교 화면) — features/ 변경 최소화
- 화면 diff 0 검증 (F026 DoD)

## 교훈

1. **공개 레포 virt 코드 포맷**: `GVC-MACH-xxx` 형식은 실 GVC코드(로컬전용)와 명확히 구별됨 — 네이밍 컨벤션이 보안 제약의 1차 방어선.
2. **JSDoc에서 glob 패턴(`*`) 주의**: `*.mjs` 형태 주석이 ES 모듈 파서에서 오류 — 주석 내 글로브 패턴은 `xxx` 로 대체.
3. **FK 순서 준수**: DROP(역순: metrics→network→products), CREATE(정순: products→network→metrics) — 멱등 마이그레이션의 표준 패턴.
4. **gvc-seed.mjs 멱등성**: 도메인 DELETE+INSERT 방식으로 중복 적재 없음 (FK 위반 없이 재실행 가능).
