/** F016 — 조회 실행 스모크: 재귀CTE·FTS5·정형 SQL이 실 SQLite(D1)에서 동작함을 단언.
 *  기본 --remote(lib/d1 LOC). 로컬은 `--local`(package smoke:queries). native 의존 0(wrangler 실행).
 *  선행: db:migrate(0001+0002) + ingest:all(또는 ingest:fts)로 데이터·entity_fts 적재. */
import { query } from './lib/d1.mjs';
import { graphReachSql, entitySearchSql, tradeSeriesSql } from '../../src/shared/givc-queries.mjs';

let fail = 0;
const check = (label, cond, detail) => {
  console.log(`${cond ? '✓' : '✖'} ${label}${detail ? ' — ' + detail : ''}`);
  if (!cond) fail++;
};

// 1) 그래프 재귀 CTE — MC(머시닝센터) 깊이2 도달
const reach = query(graphReachSql('MC', 2)).map((r) => r.id);
check('그래프 재귀CTE 도달', reach.length > 1, `${reach.length}노드 (${reach.slice(0, 5).join(',')}…)`);

// 2) FTS5 전문검색 — '감속기'(기계 가치사슬 보장 토큰)
const hits = query(entitySearchSql('감속기', 5));
check('FTS5 MATCH', hits.length >= 1, `${hits.length}건 (${hits.map((h) => h.entity_id).slice(0, 3).join(',')})`);

// 3) 정형 SQL — 무역 시계열(머시닝센터 845710)
const trade = query(tradeSeriesSql('845710'));
check('정형 무역시계열', trade.length >= 1, `${trade.length}분기`);

if (fail) {
  console.error(`\n✖ 조회 스모크 ${fail}건 실패`);
  process.exit(1);
}
console.log('\n✓ 조회 스모크 PASS — 재귀CTE·FTS5·정형 SQL 동작 확인');
