# F016 — S6 P0 조회 정식화 + 검증 (Design)

> **Plan**: [f016-s6-queries.plan.md](../../01-plan/features/f016-s6-queries.plan.md) · **REQ**: KOAMI-REQ-016 · **생성**: 2026-05-25
> 결정1=하이브리드(빌드 정식화 + 읽기전용 D1 Worker) · 결정2=`entity_fts`(기업·그래프 코퍼스)로 FTS5 3종 유지.

## 0. 설계 요약

| 관점 | 설계 |
|------|------|
| **공용 SQL** | `src/shared/givc-queries.ts` — 3종 쿼리 SQL 상수 + 순수 빌더(파라미터 클램프·응답 매핑). 빌드 스크립트(CLI)·Worker(바인딩)·vitest가 공유. |
| **저장소** | `migrations/0002_fts.sql` `entity_fts`(FTS5, 기업·그래프 label) + ingest 채움. `news_meta`는 F018용 유지. |
| **Worker** | Hono `/api/givc/{graph,trade,search}` 읽기전용(SELECT-only). rate-limit을 `/api/chat`로 축소(쿼리 throttle 방지). `Env.DB` D1 바인딩. |
| **검증** | `--local` D1 스모크(CTE·FTS5 실행, 신규 native 의존 0) + vitest 순수 빌더 단위 + Playwright real 모드 S6 스모크 + 성능 실측. |

---

## 1. 공용 SQL 모듈 — `src/shared/givc-queries.ts`

빌드 스크립트(`scripts/ingest/*.mjs`, wrangler CLI)와 Worker(D1 바인딩)가 **같은 SQL 상수**를 소비하도록 단일 모듈에 정의. `.ts`로 두고 빌드 스크립트는 동일 SQL 문자열을 `.mjs` 측에서 import(또는 `.sql` 동시 export). Worker는 `?n` 바인딩, 빌드 CLI는 `esc()` 치환.

### 1.1 정형 SQL (무역·기업)
```ts
export const SQL_TRADE_SERIES =
  `SELECT period, exports, imports FROM trade_stats WHERE hs_code = ? ORDER BY period;`;
export const SQL_TRADE_BY_COUNTRY =
  `SELECT cnty_cd, cnty_nm, imports, share, provenance FROM trade_by_country
   WHERE hs_code = ? ORDER BY imports DESC;`;
export const SQL_COMPANIES =
  `SELECT id, name, biz, sales, share, core_type AS coreType, role, provenance AS source
   FROM companies ORDER BY core_type, name;`;
```

### 1.2 그래프 재귀 CTE (양방향, 깊이 클램프)
```ts
export const SQL_GRAPH_REACH =
  `WITH RECURSIVE reach(id, depth) AS (
     SELECT ?1, 0
     UNION
     SELECT CASE WHEN e.src = r.id THEN e.dst ELSE e.src END, r.depth + 1
     FROM graph_edges e JOIN reach r ON (e.src = r.id OR e.dst = r.id)
     WHERE r.depth < ?2
   )
   SELECT DISTINCT id FROM reach;`;
// 도달 노드 id 집합 → 노드 상세 + 부분 그래프 엣지는 후속 SELECT로 조립.
export const SQL_NODES_BY_IDS = (n: number) =>
  `SELECT id, type, label, r, meta, provenance AS source FROM graph_nodes
   WHERE id IN (${Array(n).fill('?').join(',')});`;
export const SQL_EDGES_WITHIN = (n: number) =>
  `SELECT src, dst FROM graph_edges
   WHERE src IN (${Array(n).fill('?').join(',')}) AND dst IN (${Array(n).fill('?').join(',')}) AND src < dst;`;
```
> 무방향 엣지가 `src<dst` 정규화 저장이어도 CTE는 `(e.src=r.id OR e.dst=r.id)`로 양방향 탐색 → 견고. `clampDepth(d)=Math.min(Math.max(1,d|0),4)` 순수 함수로 깊이 상한(폭주 방어, F013 깊이2 기준 여유).

### 1.3 FTS5 전문검색
```ts
export const SQL_ENTITY_SEARCH =
  `SELECT entity_id, kind, snippet(entity_fts, 2, '[', ']', '…', 8) AS hit
   FROM entity_fts WHERE entity_fts MATCH ? ORDER BY rank LIMIT ?;`;
export const sanitizeMatch = (q: string) =>          // FTS5 구문 안전화
  q.replace(/["*^]/g, ' ').trim().split(/\s+/).filter(Boolean).map((t) => `"${t}"`).join(' ');
```

## 2. `entity_fts` 스키마 + ingest 채움

### 2.1 `migrations/0002_fts.sql`
```sql
-- F016 P0 — 기업·그래프 코퍼스 FTS5 (뉴스 news_meta는 F018용 유지)
DROP TABLE IF EXISTS entity_fts;
CREATE VIRTUAL TABLE entity_fts USING fts5(
  entity_id UNINDEXED,   -- companies.id 또는 graph_nodes.id
  kind      UNINDEXED,   -- 'company' | 'node'
  text                   -- 검색 대상(인덱싱)
);
```
> 멱등 DROP+CREATE(0001 패턴 일치). `db:migrate`에 0002 추가: `wrangler d1 execute koami-givc-poc <LOC> --file migrations/0002_fts.sql`.

### 2.2 채움 (ingest, `--local`/`--remote` 공용)
신규 `scripts/ingest/ingest-fts.mjs` (또는 `build-snapshot` 직전 단계):
```
companies → entity_fts(id, 'company', name || ' ' || biz || ' ' || role)
graph_nodes(label) → entity_fts(id, 'node', label)
```
`ingest:all`(`ingest-all.mjs`) 파이프라인 끝에 `ingest:fts` 추가. provenance는 원본 테이블 real 유지(FTS는 검색 인덱스라 별도 provenance 칼럼 없음 — 결과 매핑 시 원본 테이블에서 보강).

## 3. Worker 읽기전용 엔드포인트

### 3.1 바인딩 (`Env` + `wrangler.jsonc.example`)
```ts
interface Env { AI: Ai; ASSETS: Fetcher; RATE_LIMIT_KV: KVNamespace; DB: D1Database; }
```
`wrangler.jsonc.example`에 추가:
```jsonc
"d1_databases": [
  { "binding": "DB", "database_name": "koami-givc-poc", "database_id": "REPLACE_WITH_D1_ID" }
]
```
> 실 `wrangler.jsonc`는 gitignore — deploy-guide에 D1 바인딩 절차 추가. database_id는 MEMORY의 `f0536778…`.

### 3.2 rate-limit 범위 축소 (필수)
현재 `app.use('/api/*', rateLimit)` → 쿼리 엔드포인트까지 3회/시간 throttle. **`/api/chat`로 한정**:
```ts
app.use('/api/chat', createRateLimitMiddleware({ ... }));   // LLM만 제한
```
> 읽기전용 쿼리는 비용 낮음 → 무제한(또는 별도 관대한 limit). F009 동작 불변(LLM만 제한 유지).

### 3.3 라우트 계약 (SELECT-only)
| 라우트 | 파라미터 | 응답 | 비고 |
|--------|---------|------|------|
| `GET /api/givc/graph` | `root`(기본 TOL)·`depth`(clamp 1~4) | `{ nodes:[…], edges:[[src,dst]…] }` | 재귀CTE → 노드 상세 + 부분 엣지 |
| `GET /api/givc/trade` | `hs`(기본 290230) | `{ quarters, exports, imports, byCountry:[…] }` | 정형 SQL 2종 |
| `GET /api/givc/search` | `q`·`limit`(clamp ≤20) | `{ hits:[{entity_id,kind,hit}…] }` | FTS5 MATCH(`sanitizeMatch`) |
- 전부 `c.env.DB.prepare(SQL).bind(...).all()` — **SELECT 외 차단**(SQL 상수만 사용, 사용자 입력은 바인딩만). 빈/오류 입력 400.
- 라우트는 `app.all('*', ASSETS)` **앞**에 등록(SPA fallback보다 우선).

## 4. `build-snapshot.mjs` 재배선
평면 쿼리 → §1 공용 SQL 소비:
- graph: `SQL_GRAPH_REACH`(root=TOL, depth=4)로 도달 집합 → `SQL_NODES_BY_IDS`/`SQL_EDGES_WITHIN`. 11노드 소규모라 결과 동일하되 경로 정식화.
- trade/companies: `SQL_TRADE_SERIES`/`SQL_COMPANIES` 재사용(CLI는 `esc` 치환).
- 산출 스냅샷 shape 불변 → `git diff src/data/snapshot/s6.real.snapshot.json` 결정적(재실행 안정) 확인.

## 5. 검증 전략

### 5.1 `--local` D1 실행 스모크 (신규 의존 0)
`scripts/ingest/smoke-queries.mjs` — `lib/d1.mjs query()`로 `--local` 실행:
1. `db:migrate --local` + `ingest:all --local` (0001+0002 + 데이터 + FTS).
2. CTE: `SQL_GRAPH_REACH`(TOL, 2) → 도달 노드 수 > 1 단언.
3. FTS5: `SQL_ENTITY_SEARCH`('롯데' 또는 '석유화학') → hit ≥ 1.
4. 정형: `SQL_TRADE_SERIES`(290230) → 4분기 행.
   결과 콘솔 출력 → 리포트 첨부(autopilot hallucination 방어, ps+출력 증거).

### 5.2 vitest 순수 단위 (hermetic)
`src/shared/givc-queries.test.ts` — DB 없이 순수 함수:
- `clampDepth(0|5|2.7)` → 1·4·2 경계.
- `sanitizeMatch('a*"b c')` → `"a" "b" "c"`(FTS 구문 안전).
- `SQL_NODES_BY_IDS(3)` 플레이스홀더 수 = 3.
- 응답 매퍼(행→도메인 shape, provenance 보존).
> CTE/FTS5 **실행**은 §5.1(`--local` 실 SQLite=Miniflare, FTS5 포함)이 담당. native better-sqlite3 미도입(WSL 빌드·의존 정책 회피).

### 5.3 Worker 스모크
`wrangler dev`(로컬 D1, CF Access 미적용) → curl 3종 200 + 실데이터 JSON:
```
curl 'localhost:8787/api/givc/graph?root=TOL&depth=2'
curl 'localhost:8787/api/givc/trade?hs=290230'
curl 'localhost:8787/api/givc/search?q=롯데'
```

## 6. real 모드 회귀 + 성능
- **회귀**: `docs/03-do/f016-regression-real.md` — Sprint 1 33항목을 `VITE_DATA_SOURCE=real` 빌드 기준으로 재기술(S6 실데이터 차이: I26 TradeChart 실 4분기·I27 그래프 11노드·I28 기업표 6사·I24 DataMark provenance). Playwright 자동(콘솔 에러 0 + 실 기업명 렌더 + 캡처) + 수동 시각 항목 런북 표기.
- **성능**: real 모드 `pnpm build && pnpm preview` → Lighthouse 첫 로딩 <2s + S4 재계산 `performance.now()` <100ms. 번들 214KB 유지 확인.

## 7. 파일 변경 매핑

| 파일 | 변경 | 종류 |
|------|------|:---:|
| `src/shared/givc-queries.ts` | SQL 상수 + 순수 빌더 | 신규 |
| `src/shared/givc-queries.test.ts` | vitest 단위 | 신규 |
| `migrations/0002_fts.sql` | `entity_fts` | 신규 |
| `scripts/ingest/ingest-fts.mjs` | FTS 채움 | 신규 |
| `scripts/ingest/smoke-queries.mjs` | `--local` 실행 스모크 | 신규 |
| `scripts/ingest/ingest-all.mjs` | FTS 단계 추가 | 수정 |
| `scripts/ingest/build-snapshot.mjs` | 공용 SQL(CTE) 재배선 | 수정 |
| `src/worker/index.ts` | givc 3엔드포인트 + DB 바인딩 + rate-limit 축소 | 수정 |
| `wrangler.jsonc.example` | `d1_databases` 바인딩 | 수정 |
| `package.json` | `ingest:fts`·`smoke:queries` 스크립트 | 수정 |
| `docs/03-do/f016-regression-real.md` | real 모드 33 회귀 | 신규 |
| `docs/deploy-guide.md` | D1 바인딩 절차 | 수정 |

## 8. 설계 결정·한계

- **하이브리드**: 화면은 스냅샷 동기 서빙 유지(F015 "화면 diff 0"·Mock 기본 안전 보존). Worker 엔드포인트는 "라이브 조회 가능" 증거(화면 미연결). 결정1.
- **FTS5 코퍼스 = 기업·그래프**: 뉴스(F018·저작권)와 분리. 기업 biz 단문이라 임팩트는 제한적 — P0는 **메커니즘 증명** 목표. 결정2.
- **검증 = `--local` + 순수 단위**: native 의존(better-sqlite3) 미도입 → WSL 빌드 리스크·신규 의존 정책 회피. CTE/FTS5 실행은 Miniflare 로컬 D1(실 SQLite, FTS5 포함). 완전 hermetic vitest 실행이 후속 필요 시 better-sqlite3 재검토.
- **rate-limit 축소**: `/api/*`→`/api/chat`. F009 의도(LLM 비용 제한) 유지하며 쿼리 무throttle.
- **CF Access**: 원격 Worker 엔드포인트는 게이팅 하 → curl 스모크는 로컬 `wrangler dev`. 원격 검증 필요 시 service token(별도).
- **스냅샷 결과 불변**: 11노드 소규모라 CTE 재배선해도 동일 산출 — 정식화는 "경로/테스트/역량"이지 데이터 변화 아님.

## 9. 구현 순서 (Plan §5 대응)
1. `src/shared/givc-queries.ts`(SQL+빌더) + vitest 단위(§5.2).
2. `migrations/0002_fts.sql` + `ingest-fts.mjs` + `ingest:all` 배선.
3. `build-snapshot.mjs` 재배선 → 스냅샷 재생성·diff 확인.
4. `smoke-queries.mjs`(`--local`) → CTE/FTS5/SQL 실행 단언.
5. Worker givc 엔드포인트 + DB 바인딩 + rate-limit 축소 → `wrangler dev` curl 스모크.
6. real 모드 빌드 + Playwright S6 스모크 + 성능 실측.
7. `f016-regression-real.md` + deploy-guide D1 절차.

---

*다음: `/pdca do F016` (구현 시작) — 또는 `/pdca design` 재검토.*
