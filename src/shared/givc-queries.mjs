/**
 * F016 — koami-givc P0 공용 SQL 빌더 (빌드 스크립트 · Worker · vitest 공유).
 *
 * 설계: 바인딩(`?`) 대신 **완성 SQL 문자열을 반환하는 빌더**로 통일.
 *   - 빌드 CLI(`lib/d1.mjs query()`): `--command` 인라인 실행(바인딩 없음).
 *   - Worker: `c.env.DB.prepare(sql).all()`.
 *   양쪽이 같은 빌더를 소비 → 불일치 0. 입력은 빌더 내부에서 전량 sanitize → injection 안전.
 *
 * 타입은 인접 givc-queries.d.ts 참조(.mjs라 node/Worker/vitest 모두 import 가능).
 */

const HS_DEFAULT = '845710'; // F023: 머시닝센터(공작기계) 앵커 HS

/** SQL 문자열 리터럴 escape (작은따옴표 → 2개). lib/d1.mjs esc와 동일 규약 */
export const esc = (s) => String(s).replace(/'/g, "''");

/** HS 코드 — 숫자만 허용(비숫자 제거). 빈 값이면 기본 845710(머시닝센터) */
export const sanitizeHs = (hs) => {
  const d = String(hs ?? '').replace(/[^0-9]/g, '');
  return d || HS_DEFAULT;
};

/** 그래프 ID — 영문/숫자/언더스코어만 허용(노드 id 규약: MC·CN·HS845710·기업id) */
export const sanitizeId = (id) => String(id ?? '').replace(/[^A-Za-z0-9_]/g, '') || 'MC';

/** 탐색 깊이 — 정수 1~4 클램프(재귀 폭주 방어, F013 깊이2 기준 여유) */
export const clampDepth = (d) => {
  const n = Math.trunc(Number(d));
  if (!Number.isFinite(n)) return 2;
  return Math.min(Math.max(n, 1), 4);
};

/** 결과 개수 상한 — 1~50 클램프 */
export const clampLimit = (n, max = 20) => {
  const v = Math.trunc(Number(n));
  if (!Number.isFinite(v) || v <= 0) return max;
  return Math.min(v, 50);
};

/** FTS5 MATCH 식 안전화 — 특수문자 제거 후 토큰별 따옴표(prefix 검색 차단, 구문오류 방지) */
export const sanitizeMatch = (q) =>
  String(q ?? '')
    .replace(/["*^():]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => `"${t}"`)
    .join(' ');

// ── 정형 SQL ────────────────────────────────────────────────
export const tradeSeriesSql = (hs = HS_DEFAULT) =>
  `SELECT period, exports, imports FROM trade_stats WHERE hs_code='${sanitizeHs(hs)}' ORDER BY period;`;

export const tradeByCountrySql = (hs = HS_DEFAULT) =>
  `SELECT cnty_cd, cnty_nm, imports, share, provenance FROM trade_by_country WHERE hs_code='${sanitizeHs(hs)}' ORDER BY imports DESC;`;

export const companiesSql = () =>
  `SELECT id, name, biz, sales, share, core_type AS coreType, role, tier, provenance AS source FROM companies ORDER BY core_type, name;`;

// ── 그래프 재귀 CTE (양방향, 깊이 클램프) ─────────────────────
/** 루트에서 깊이 N까지 도달하는 노드 id 집합. 무방향 엣지(양방향 저장)도 견고하게 탐색 */
export const graphReachSql = (root = 'MC', depth = 4) =>
  `WITH RECURSIVE reach(id, depth) AS (
  SELECT '${sanitizeId(root)}', 0
  UNION
  SELECT CASE WHEN e.src = r.id THEN e.dst ELSE e.src END, r.depth + 1
  FROM graph_edges e JOIN reach r ON (e.src = r.id OR e.dst = r.id)
  WHERE r.depth < ${clampDepth(depth)}
)
SELECT DISTINCT id FROM reach;`;

/** 노드 id 목록 → 노드 상세(provenance AS source). 결정적 정렬(타입랭크: 중심→hscode→국가→기업, then id) */
export const nodesByIdsSql = (ids) => {
  const list = (ids ?? []).map((id) => `'${sanitizeId(id)}'`).join(',') || "''";
  return `SELECT id, type, label, r, meta, provenance AS source FROM graph_nodes WHERE id IN (${list}) ORDER BY CASE type WHEN 'rnd' THEN 0 WHEN 'hscode' THEN 1 WHEN 'country' THEN 2 WHEN 'company' THEN 3 ELSE 4 END, id;`;
};

/** 부분 그래프 엣지(src<dst dedup, 결정적 정렬) */
export const edgesWithinSql = (ids) => {
  const list = (ids ?? []).map((id) => `'${sanitizeId(id)}'`).join(',') || "''";
  return `SELECT src, dst FROM graph_edges WHERE src IN (${list}) AND dst IN (${list}) AND src < dst ORDER BY src, dst;`;
};

// ── FTS5 전문검색 (기업·그래프 코퍼스) ────────────────────────
export const entitySearchSql = (q, limit = 20) => {
  const m = sanitizeMatch(q);
  return `SELECT entity_id, kind, snippet(entity_fts, 2, '[', ']', '…', 8) AS hit
FROM entity_fts WHERE entity_fts MATCH '${esc(m)}' ORDER BY rank LIMIT ${clampLimit(limit)};`;
};
