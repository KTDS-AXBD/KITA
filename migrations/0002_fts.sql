-- F016 P0 — 기업·그래프 코퍼스 FTS5 전문검색 인덱스.
--   뉴스 풀텍스트(news_meta)는 F018(BIGKinds 저작권) — 본 인덱스는 이미 적재된 실데이터(기업·그래프) 검색용.
--   적용: pnpm db:migrate (0001 후) / db:migrate:local. 멱등 DROP+CREATE.
DROP TABLE IF EXISTS entity_fts;
CREATE VIRTUAL TABLE entity_fts USING fts5(
  entity_id UNINDEXED,   -- companies.id 또는 graph_nodes.id
  kind      UNINDEXED,   -- 'company' | 'node'
  text                   -- 인덱싱 대상(기업 name·biz·role / 그래프 label)
);
