---
id: KOAMI-DESIGN-012
title: Sprint 12 — F025 실 GIVC 스키마 미러(D1) + 멀티도메인 적재 Design
sprint: 12
f_items: [F025]
status: IN_PROGRESS
created: 2026-05-25
---

# Sprint 12 Design — F025: 실 GIVC 스키마 미러(D1) + 멀티도메인 적재

## 1. 아키텍처 결정 (ADR)

### ADR-1: 신규 테이블 prefix = `gvc_*`
기존 테이블(trade_stats·companies 등)과 네임스페이스 분리. 향후 F026 Repository 교체 시 `gvc_*` 테이블만 GVC 레이어로 식별.

### ADR-2: 의미명 칼럼만 커밋 (공개 레포 제약)
실 컬럼코드(로컬전용 스키마 원본)는 gitignore 로컬전용에만 존재. 커밋 파일은 의미명(`metric_sales_growth`)만 사용.

### ADR-3: virt GVC 코드 포맷 (`GVC-{DOMAIN}-{ID}`)
실 GVC코드(로컬전용)와 명확히 구별. provenance=virt 필수. 기계: `GVC-MACH-*`, 반도체: `GVC-SEMI-*`.

### ADR-4: mart.* 대체 불가 → 기존 파이프라인 유지
M0 게이트: mart.* DDL 미제공. 무역/기업재무 원천은 기존 `trade_stats`/`trade_by_country`/`companies` 유지. gvc_products의 `hs_codes` 필드로 조회 연결만 선언.

### ADR-5: features/ diff 0 강제
GvcRepository를 추가하되, S6Repository/RndRepository 및 features/ 소비 코드 일체 변경 없음. F026에서 교체.

## 2. 파일 구조 매핑

### 2.1 신규 파일

```
migrations/
  0003_gvc_mirror.sql          ← GVC 스키마 3테이블 (gvc_products/gvc_network/gvc_metrics)

scripts/ingest/
  gvc-seed.mjs                 ← 기계+반도체 멀티도메인 virt 시드 적재
  gvc-integrity.mjs            ← §5.4 정합성 검증 (orphan/dangling/provenance)

src/types/
  gvc.ts                       ← GvcProduct / GvcNetworkEdge / GvcMetric / GvcDomain

src/data/repository/
  GvcRepository.ts             ← interface GvcRepository + class MockGvcRepository
```

### 2.2 수정 파일

```
src/types/index.ts             ← export * from './gvc' 추가 (1줄)
src/data/repository/index.ts   ← GvcRepository export 추가 (3줄)
package.json                   ← db:migrate:gvc / ingest:gvc / ingest:gvc:integrity scripts
```

### 2.3 변경 없음 (diff 0 보장)
```
src/features/           ← 전혀 변경 없음
src/data/mock/          ← 변경 없음
src/data/snapshot/      ← 변경 없음
migrations/0001_*.sql   ← 변경 없음
migrations/0002_*.sql   ← 변경 없음
scripts/ingest/ingest-*.mjs  ← 변경 없음 (기존 파이프라인 유지)
```

## 3. Migration 0003 상세

```sql
-- F025 — GVC 스키마 미러 (gvc.* 패턴 정렬, 의미명).
-- ⚠️ 컬럼명은 의미 기반 — 실 컬럼코드 절대 미포함 (Public 레포 제약).
-- 적용: pnpm db:migrate:gvc (--local 또는 --remote)

DROP TABLE IF EXISTS gvc_metrics;
DROP TABLE IF EXISTS gvc_network;
DROP TABLE IF EXISTS gvc_products;

CREATE TABLE gvc_products (
  gvc_code   TEXT PRIMARY KEY,
  domain     TEXT NOT NULL CHECK (domain IN ('mach','semi')),
  label      TEXT NOT NULL,
  hs_codes   TEXT,                    -- JSON ["NNNNNN",...] (관세청 연계 참조용)
  tier       TEXT CHECK (tier IN ('소재','부품','장비')),
  sort       INTEGER NOT NULL DEFAULT 0,
  provenance TEXT NOT NULL CHECK (provenance IN ('real','est','virt'))
);

CREATE TABLE gvc_network (
  gvc_from   TEXT NOT NULL REFERENCES gvc_products(gvc_code),
  gvc_to     TEXT NOT NULL REFERENCES gvc_products(gvc_code),
  tier_label TEXT,
  sort       INTEGER NOT NULL DEFAULT 0,
  provenance TEXT NOT NULL CHECK (provenance IN ('real','est','virt')),
  PRIMARY KEY (gvc_from, gvc_to)
);
CREATE INDEX idx_gvc_network_to ON gvc_network(gvc_to);

CREATE TABLE gvc_metrics (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  gvc_code   TEXT NOT NULL REFERENCES gvc_products(gvc_code),
  metric_key TEXT NOT NULL,   -- metric_sales_growth / metric_capital_efficiency /
                               -- metric_financial_cost_ratio / metric_inventory_turnover /
                               -- metric_employment_change / metric_rnd_growth
  value      REAL,
  unit       TEXT,
  period     TEXT,             -- 'YYYY' 또는 'YYYYQn'
  provenance TEXT NOT NULL CHECK (provenance IN ('real','est','virt'))
);
CREATE INDEX idx_gvc_metrics_code ON gvc_metrics(gvc_code, metric_key);
```

## 4. 시드 데이터 설계 (virt GVC 코드)

### 4.1 기계 도메인 (domain='mach', provenance='virt')

**gvc_products**:
| gvc_code | label | tier | hs_codes |
|----------|-------|------|---------|
| GVC-MACH-MC001 | 머시닝센터 | 장비 | ["845710"] |
| GVC-MACH-GB001 | 볼베어링 | 부품 | ["848210"] |
| GVC-MACH-GR001 | 기어감속기 | 부품 | ["848340"] |
| GVC-MACH-SS001 | 특수강 | 소재 | ["722840"] |

**gvc_network** (소재→부품→장비 방향):
```
GVC-MACH-SS001 → GVC-MACH-GB001  (소재→부품)
GVC-MACH-SS001 → GVC-MACH-GR001  (소재→부품)
GVC-MACH-GB001 → GVC-MACH-MC001  (부품→장비)
GVC-MACH-GR001 → GVC-MACH-MC001  (부품→장비)
```

**gvc_metrics** (산업평균 추정, provenance='est' — 공개 산업보고서 기반):
- 6 metric_key × 4 gvc_code = 24건

### 4.2 반도체 도메인 (domain='semi', provenance='virt')

**gvc_products**:
| gvc_code | label | tier | hs_codes |
|----------|-------|------|---------|
| GVC-SEMI-WF001 | 실리콘웨이퍼 | 소재 | ["381800"] |
| GVC-SEMI-SL001 | CMP슬러리 | 소재 | ["382490"] |
| GVC-SEMI-PG001 | 포토마스크 | 부품 | ["903190"] |
| GVC-SEMI-RI001 | 포토레지스트 | 소재 | ["370130"] |

**gvc_network**:
```
GVC-SEMI-SL001 → GVC-SEMI-WF001   (슬러리→웨이퍼 폴리싱)
GVC-SEMI-WF001 → GVC-SEMI-PG001   (웨이퍼→포토마스크 공정)
GVC-SEMI-RI001 → GVC-SEMI-PG001   (레지스트→포토마스크 공정)
```

**gvc_metrics** (provenance='est'):
- 6 metric_key × 4 gvc_code = 24건

## 5. 타입 정의 (`src/types/gvc.ts`)

```typescript
import type { Provenance } from './provenance';

export type GvcDomain = 'mach' | 'semi';

export interface GvcProduct {
  gvcCode: string;
  domain: GvcDomain;
  label: string;
  hsCodes: string[];           // 관세청 연계 참조
  tier: '소재' | '부품' | '장비' | null;
  sort: number;
  provenance: Provenance;
}

export interface GvcNetworkEdge {
  gvcFrom: string;
  gvcTo: string;
  tierLabel: string | null;
  sort: number;
  provenance: Provenance;
}

export type GvcMetricKey =
  | 'metric_sales_growth'
  | 'metric_capital_efficiency'
  | 'metric_financial_cost_ratio'
  | 'metric_inventory_turnover'
  | 'metric_employment_change'
  | 'metric_rnd_growth';

export interface GvcMetric {
  gvcCode: string;
  metricKey: GvcMetricKey;
  value: number | null;
  unit: string | null;
  period: string | null;
  provenance: Provenance;
}
```

## 6. Repository 인터페이스 (`src/data/repository/GvcRepository.ts`)

```typescript
interface GvcRepository {
  listDomains(): GvcDomain[];
  listProducts(domain: GvcDomain): GvcProduct[];
  getNetwork(domain: GvcDomain): GvcNetworkEdge[];
  listMetrics(gvcCode: string): GvcMetric[];
  listMetricsByDomain(domain: GvcDomain, metricKey: GvcMetricKey): GvcMetric[];
}
```

MockGvcRepository: 정적 virt 데이터 반환 (시드와 동일 구조). F026 시 실 D1 조회 Repository로 교체.

## 7. §5.4 정합성 검증 (`scripts/ingest/gvc-integrity.mjs`)

```
1. orphan_check: gvc_metrics + gvc_network의 gvc_code가 gvc_products에 없는 건 → 0 PASS
2. dangling_check: gvc_network(gvc_from/gvc_to)가 gvc_products에 없는 건 → 0 PASS
3. provenance_check: real/est/virt 외 값 → 0 PASS
4. domain_balance: 각 domain products ≥ 2, metrics ≥ 4 → PASS
```

출력: JSON 리포트 + 0건이면 `✓ 정합성 PASS`, 위반 시 `✖` + exit(1).

## 8. 구현 순서

1. `migrations/0003_gvc_mirror.sql` 작성 + D1 local 적용 테스트
2. `src/types/gvc.ts` + `src/types/index.ts` 수정
3. `src/data/repository/GvcRepository.ts` 작성
4. `src/data/repository/index.ts` export 추가
5. `scripts/ingest/gvc-seed.mjs` 작성 + 적재 테스트
6. `scripts/ingest/gvc-integrity.mjs` 작성 + 정합성 검증
7. `package.json` scripts 추가
8. `pnpm typecheck` + `pnpm test` 확인
9. `git diff src/features/` → 0줄 확인

## 9. 제약 재확인

- ✅ migration SQL — 의미명만, 실 컬럼코드 없음
- ✅ gvc_code — `GVC-MACH-*`/`GVC-SEMI-*` virt 포맷
- ✅ 무역/기업 원천 — 기존 파이프라인 유지 (mart.* 미러링 없음)
- ✅ features/ diff 0 — GvcRepository만 추가
- ✅ PR base = `main`, merge 금지
