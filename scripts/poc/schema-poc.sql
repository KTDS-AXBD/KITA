-- F013 M0 PoC — D1 스키마 (kita-givc-poc)
-- Design §3.1 / §5. 본 적재 정식 migration은 F014에서. 여기는 PoC 검증용.
-- 적용: wrangler d1 execute kita-givc-poc --file scripts/poc/schema-poc.sql --remote
--   (또는 --local 로컬 better-sqlite3 비교)

-- ── 그래프 (0b) — 현 KnowledgeGraph shape 매핑 (src/types/graph.ts) ──────────
DROP TABLE IF EXISTS graph_edges;
DROP TABLE IF EXISTS graph_nodes;

CREATE TABLE graph_nodes (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL CHECK (type IN ('company','rnd','metric','hscode','country')),
  label      TEXT NOT NULL,
  r          REAL NOT NULL DEFAULT 8,
  meta       TEXT,                                          -- JSON (Record<string,string>)
  provenance TEXT NOT NULL CHECK (provenance IN ('real','est','virt'))
);

-- GraphEdge = readonly [string,string] (무방향). 적재 시 양방향 2행.
CREATE TABLE graph_edges (
  src TEXT NOT NULL REFERENCES graph_nodes(id),
  dst TEXT NOT NULL REFERENCES graph_nodes(id),
  PRIMARY KEY (src, dst)
);
CREATE INDEX idx_edges_src ON graph_edges(src);
CREATE INDEX idx_edges_dst ON graph_edges(dst);

-- ── 정형 무역통계 (0d) — TradeSeries 원천 (관세청 HS 290230) ──────────────────
DROP TABLE IF EXISTS trade_stats;
CREATE TABLE trade_stats (
  hs_code    TEXT NOT NULL,                                 -- '290230'
  period     TEXT NOT NULL,                                 -- 'YYYYQn' (예: '2023Q4')
  exports    REAL NOT NULL,                                 -- 수출액
  imports    REAL NOT NULL,                                 -- 수입액
  unit       TEXT NOT NULL DEFAULT 'USD',
  src_date   TEXT,                                          -- 데이터 기준일 (화면 출처표기 노출)
  provenance TEXT NOT NULL CHECK (provenance IN ('real','est','virt')),
  PRIMARY KEY (hs_code, period)
);

-- ── 뉴스 메타데이터 (전문검색, FTS5) — 뉴스빅데이터 키워드 (원문 아님) ─────────
DROP TABLE IF EXISTS news_meta;
CREATE VIRTUAL TABLE news_meta USING fts5(
  keyword,            -- 키워드/표제어
  freq UNINDEXED,     -- 빈도 (워드클라우드 가중치)
  sentiment UNINDEXED,-- pos/neg/dim/'' (NewsWord.t 매핑)
  provenance UNINDEXED
);
