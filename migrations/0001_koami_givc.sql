-- F014 koami-givc 정식 스키마 (Design §2). 적용: pnpm db:migrate (execute --file, 멱등 DROP+CREATE)
-- ⚠️ d1_migrations 정식 기록은 본 사업화 단계에서 wrangler d1 migrations apply로 전환.

DROP TABLE IF EXISTS trade_stats;
CREATE TABLE trade_stats (
  hs_code    TEXT NOT NULL,
  period     TEXT NOT NULL,                          -- 'YYYYQn'
  exports    REAL NOT NULL,
  imports    REAL NOT NULL,
  unit       TEXT NOT NULL DEFAULT 'USD',
  src_date   TEXT,
  provenance TEXT NOT NULL CHECK (provenance IN ('real','est','virt')),
  PRIMARY KEY (hs_code, period)
);

DROP TABLE IF EXISTS trade_by_country;
CREATE TABLE trade_by_country (
  hs_code    TEXT NOT NULL,
  cnty_cd    TEXT NOT NULL,
  cnty_nm    TEXT NOT NULL,
  exports    REAL NOT NULL,
  imports    REAL NOT NULL,
  share      REAL,                                   -- 수입 비중(0~1)
  provenance TEXT NOT NULL CHECK (provenance IN ('real','est','virt')),
  PRIMARY KEY (hs_code, cnty_cd)
);

DROP TABLE IF EXISTS companies;
CREATE TABLE companies (
  id         TEXT PRIMARY KEY,
  corp_code  TEXT,
  name       TEXT NOT NULL,
  biz        TEXT,
  sales      TEXT,
  share      TEXT,
  core_type  INTEGER,                                -- 1=원료공급 / 2=후방수요·가공
  role       TEXT,
  provenance TEXT NOT NULL CHECK (provenance IN ('real','est','virt'))
);

DROP TABLE IF EXISTS graph_edges;
DROP TABLE IF EXISTS graph_nodes;
CREATE TABLE graph_nodes (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL CHECK (type IN ('company','rnd','metric','hscode','country')),
  label      TEXT NOT NULL,
  r          REAL NOT NULL DEFAULT 8,
  meta       TEXT,
  provenance TEXT NOT NULL CHECK (provenance IN ('real','est','virt'))
);
CREATE TABLE graph_edges (
  src TEXT NOT NULL REFERENCES graph_nodes(id),
  dst TEXT NOT NULL REFERENCES graph_nodes(id),
  PRIMARY KEY (src, dst)
);
CREATE INDEX idx_edges_src ON graph_edges(src);
CREATE INDEX idx_edges_dst ON graph_edges(dst);

DROP TABLE IF EXISTS news_meta;
CREATE VIRTUAL TABLE news_meta USING fts5(keyword, freq UNINDEXED, sentiment UNINDEXED, provenance UNINDEXED);
