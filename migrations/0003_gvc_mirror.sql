-- F025 — GVC 스키마 미러 (gvc.* 패턴 정렬, 의미명 칼럼).
-- ⚠️ 칼럼명은 의미 기반 — 실 컬럼코드 절대 미포함 (Public 레포 제약).
-- ⚠️ gvc_code는 virt 포맷 가짜코드 (GVC-MACH-*/GVC-SEMI-*) — 실 GVC코드 미사용.
-- 적용: pnpm db:migrate:gvc (--local 테스트 → --remote 실적용)
-- 멱등: DROP+CREATE (0001 패턴 답습)

DROP TABLE IF EXISTS gvc_metrics;
DROP TABLE IF EXISTS gvc_network;
DROP TABLE IF EXISTS gvc_products;

-- GVC 품목 식별자 (product_network GVC코드 PK 패턴)
CREATE TABLE gvc_products (
  gvc_code   TEXT PRIMARY KEY,
  domain     TEXT NOT NULL CHECK (domain IN ('mach','semi')),
  label      TEXT NOT NULL,
  hs_codes   TEXT,                    -- JSON array (관세청 연계 참조용)
  tier       TEXT CHECK (tier IN ('소재','부품','장비')),
  sort       INTEGER NOT NULL DEFAULT 0,
  provenance TEXT NOT NULL CHECK (provenance IN ('real','est','virt'))
);

-- product_network 형 방향 그래프 (전후방 가치사슬 엣지)
CREATE TABLE gvc_network (
  gvc_from   TEXT NOT NULL REFERENCES gvc_products(gvc_code),
  gvc_to     TEXT NOT NULL REFERENCES gvc_products(gvc_code),
  tier_label TEXT,
  sort       INTEGER NOT NULL DEFAULT 0,
  provenance TEXT NOT NULL CHECK (provenance IN ('real','est','virt')),
  PRIMARY KEY (gvc_from, gvc_to)
);
CREATE INDEX idx_gvc_network_to ON gvc_network(gvc_to);

-- scmm 계열 지표 (의미명 metric_key — 6개 패밀리)
CREATE TABLE gvc_metrics (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  gvc_code   TEXT NOT NULL REFERENCES gvc_products(gvc_code),
  metric_key TEXT NOT NULL,
  value      REAL,
  unit       TEXT,
  period     TEXT,
  provenance TEXT NOT NULL CHECK (provenance IN ('real','est','virt'))
);
CREATE INDEX idx_gvc_metrics_code ON gvc_metrics(gvc_code, metric_key);
