# F016 — S6 P0 조회 정식화 + 검증 (Plan)

> **REQ**: KOAMI-REQ-016 · **우선**: P0 · **Sprint**: S6 · **선행**: F013(M0 게이트)·F014(적재)·F015(Repository) ✅
> **생성**: 2026-05-25 (`/pdca plan F016`, fs 실측 기반) · **트랙**: koami-givc Phase 1 마지막

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | F014가 D1에 실데이터를 적재했고 F015가 스냅샷을 화면에 연결했지만, "온톨로지 위 조회"의 실체인 **4종 조회가 정식화되지 않음** — `build-snapshot.mjs`는 평면 SELECT만 쓰고(그래프 재귀CTE ✗·FTS5 ✗), 쿼리 레이어 테스트 0, 33 회귀는 Mock 모드 기준. |
| **Solution** | P0 3종 조회(**정형 SQL·그래프 재귀CTE·FTS5 전문검색**)를 빌드/Worker 공용 SQL 모듈로 정식화 + vitest 검증, **읽기전용 D1 쿼리 Worker 엔드포인트**(하이브리드, curl 시연), real 모드 33 회귀 + 성능 실측. RAG·뉴스 풀텍스트는 F018로 분리. |
| **Function/UX Effect** | 화면은 스냅샷 동기 서빙 유지(화면 코드 무변경·데모 Mock 기본 안전). "GIVC 그래프를 재귀 CTE로 깊이 탐색·전문검색"이 curl/테스트로 입증되는 **온톨로지 조회 역량 실증**. |
| **Core Value** | 스냅샷(시연 안전) + 정식 쿼리 레이어(역량 증거)의 이중화 — PoC가 "정적 화면"이 아니라 "실 쿼리 가능 데이터 기반"임을 증명. |

---

## 1. 배경 (fs 실측)

| 항목 | 실측 결과 |
|------|----------|
| 화면 데이터 서빙 | `SnapshotTolueneRepository`(동기) → `s6.real.snapshot.json` 정적 import. **런타임 D1 조회 없음.** |
| 스냅샷 빌드 | `scripts/ingest/build-snapshot.mjs` — `graph_nodes`/`graph_edges`/`trade_stats`/`companies` **평면 SELECT**. 그래프는 `src<dst` 엣지 덤프(재귀CTE 아님). |
| 그래프 재귀CTE | F013 게이트에서 깊이2 0.37ms **증명만** 됨 — 파이프라인 미반영. |
| FTS5 | `news_meta` 가상테이블만 존재(`migrations/0001` L60). **쿼리 없음 + 뉴스 데이터 미적재**(BIGKinds 저작권 차단 → F018). |
| 테스트 | `src/features/rnd/scoring.test.ts` 9개(S4 스코어링)뿐. **데이터/쿼리 레이어 테스트 0.** |
| 33 회귀 | `docs/03-do/sprint-1-regression-checklist.md` — Sprint 1 **Mock 모드** 기준. real 모드 미검증. |
| D1 쿼리 헬퍼 | `scripts/ingest/lib/d1.mjs` — wrangler CLI `execFileSync` 래퍼(`query`/`run`/`validate`/`upsert`). Worker는 D1 **바인딩** API(별도). |

## 2. 범위

### In scope (P0)
1. **쿼리 정식화 (3종)** — 빌드·Worker 공용 SQL 모듈로 추출.
   - **정형 SQL**: 무역 시계열(hs_code 파라미터)·국가별 비중·기업 목록. 문자열 보간 → `esc`/바인딩 안전화.
   - **그래프 재귀CTE**: 루트(TOL)에서 깊이 N 양방향 탐색 → 도달 노드/엣지. 평면 덤프 대체.
   - **FTS5 전문검색**: 기업(biz·name·role) + 그래프 label 코퍼스 FTS5 인덱스 + `MATCH` 쿼리.
2. **읽기전용 Worker 쿼리 엔드포인트** (하이브리드) — `src/worker/index.ts`에 D1 바인딩 기반 SELECT-only 엔드포인트(graph/trade/search). curl 시연 증거. 화면 미연결.
3. **vitest 쿼리 검증** — better-sqlite3 인메모리(`migrations/0001` + 시드)로 CTE/FTS5/SQL 결과 단언.
4. **real 모드 33 회귀** — `VITE_DATA_SOURCE=real` 빌드에서 Playwright S6 스모크(콘솔 에러 0·실 기업명 렌더) + real 모드 체크리스트 문서.
5. **성능 실측** — Lighthouse 첫 로딩 <2s + S4 재계산 <100ms(real 모드).

### Out of scope (→ F018)
- 의미검색(RAG via Worker + Vectorize).
- 뉴스 워드클라우드 실적재(뉴스빅데이터 메타 / BIGKinds 풀텍스트 저작권).
- 실데이터 모드 라이브 배포(현 데모 Mock 기본 — 별도 게이트).
- Worker 쿼리 엔드포인트의 화면 연결(런타임 라이브 조회 UI).

## 3. 접근

### 3.1 공용 SQL 모듈 (DRY)
빌드 스크립트(CLI)와 Worker(바인딩)가 같은 SQL을 소비하도록 SQL 문자열을 단일 모듈로 추출.
```
scripts/ingest/queries/s6.queries.mjs   # SQL 상수 + 빌드용 query() 래퍼
src/worker/givc-queries.ts               # 동일 SQL 상수(또는 공유) + D1 바인딩 실행
```
> 그래프 재귀CTE 예시 (양방향, 무방향 엣지 `src<dst` 저장 대응):
> ```sql
> WITH RECURSIVE reach(id, depth) AS (
>   SELECT ?1, 0
>   UNION
>   SELECT CASE WHEN e.src = r.id THEN e.dst ELSE e.src END, r.depth + 1
>   FROM graph_edges e JOIN reach r ON (e.src = r.id OR e.dst = r.id)
>   WHERE r.depth < ?2
> )
> SELECT DISTINCT id FROM reach;
> ```

### 3.2 FTS5 코퍼스 (마이그레이션 0002)
`migrations/0002_fts.sql` — 기업·그래프 label 코퍼스 FTS5 테이블 + ingest 채움.
```sql
CREATE VIRTUAL TABLE entity_fts USING fts5(entity_id UNINDEXED, kind UNINDEXED, text);
-- ingest: companies(name·biz·role) + graph_nodes(label) → entity_fts
```
> `news_meta`는 F018용으로 유지(미사용). `entity_fts`가 P0 검색 코퍼스.

### 3.3 읽기전용 Worker 엔드포인트
`src/worker/index.ts` + D1 바인딩(`wrangler.jsonc.example`에 `koami-givc-poc` 추가).
- `GET /api/givc/graph?root=TOL&depth=2` → 재귀CTE 노드/엣지
- `GET /api/givc/trade?hs=290230` → 무역 시계열
- `GET /api/givc/search?q=<term>` → FTS5 MATCH 결과
- **SELECT-only**(쓰기 차단) + 입력 파라미터화. CF Access 게이팅 하 → curl 스모크는 `wrangler dev` 로컬 또는 service token.

### 3.4 빌드 스냅샷 재배선
`build-snapshot.mjs`가 §3.1 정식 쿼리(재귀CTE 포함) 소비 → 스냅샷 재생성. 11노드 소규모라 결과 동일하되 **쿼리 경로가 정식화**됨(git diff 스냅샷 안정 확인).

### 3.5 검증 전략
- **vitest**: better-sqlite3로 `migrations/0001`+`0002` 적용 + 소량 시드 → CTE 도달집합·FTS5 MATCH·SQL 행 단언(SQLite FTS5는 better-sqlite3 기본 포함).
- **Playwright**: real 모드 빌드 `pnpm preview` → S6 navigate → 콘솔 에러 0 + 실 기업명("롯데케미칼") 렌더 + 스냅샷 캡처.
- **성능**: real 모드에서 Lighthouse(또는 `performance` API) 첫 로딩 + S4 가중치 재계산 `performance.now()`.

## 4. DoD

- [ ] **3종 쿼리 정식화**: 공용 SQL 모듈(정형 SQL 파라미터화 · 그래프 재귀CTE · FTS5 MATCH) — 빌드 스크립트 + Worker 양쪽 소비.
- [ ] **FTS5 코퍼스**: `migrations/0002` `entity_fts` + ingest 채움(기업·그래프 label). real provenance 유지.
- [ ] **Worker 엔드포인트**: 읽기전용 graph/trade/search 3종 — `wrangler dev` curl 스모크 실데이터 반환(graph depth2 / trade / search 각 1건).
- [ ] **vitest 쿼리 테스트**: CTE/FTS5/SQL green (기존 9 → 누계 보고). turbo 우회 1회 실행.
- [ ] **스냅샷 재생성**: 정식 쿼리로 빌드 → `git diff src/data/snapshot/` 안정(결정적).
- [ ] **real 모드 33 회귀**: Playwright S6 스모크(콘솔 에러 0·실 기업명) + `docs/03-do/f016-regression-real.md` 체크리스트 + 수동 런북 표기.
- [ ] **성능**: Lighthouse 첫 로딩 <2s + S4 재계산 <100ms 실측 기록.
- [ ] **provenance**: ⭐real/△est/※virt 누락 0 유지(무역·기업 real, share △est, 뉴스·힌트 virt).
- [ ] **green**: typecheck(turbo 우회)·lint·test 통과.

> CI guard(DoD 6축 f)는 N/A — KOAMI는 `.github/workflows` 미존재(MEMORY). 로컬 검증으로 대체.

## 5. 작업 순서

1. 공용 SQL 모듈 추출(정형 SQL + 그래프 재귀CTE) — `scripts/ingest/queries/s6.queries.mjs`.
2. `migrations/0002_fts.sql`(`entity_fts`) + ingest 채움 스크립트.
3. `build-snapshot.mjs` 정식 쿼리로 재배선 → 스냅샷 재생성·diff 확인.
4. Worker 읽기전용 엔드포인트 + `wrangler.jsonc.example` D1 바인딩.
5. vitest 쿼리 테스트(better-sqlite3 시드).
6. real 모드 빌드 + Playwright S6 스모크 + 성능 실측.
7. `f016-regression-real.md` 작성 + 수동 런북 항목 표기.

## 6. 리스크

| # | 리스크 | 대응 |
|---|--------|------|
| 1 | FTS5 코퍼스(기업 biz 단문) 빈약 → 시연 임팩트 약함 | P0는 **메커니즘 증명**이 목표. 임팩트 큰 뉴스 전문검색은 F018. |
| 2 | Worker D1 바인딩 = `wrangler.jsonc` 수정(gitignore) | `wrangler.jsonc.example`에 바인딩 명시 + deploy-guide 갱신. |
| 3 | CF Access가 Worker 엔드포인트 게이팅 → curl 스모크 차단 | `wrangler dev` 로컬 스모크 우선 / 원격은 service token. |
| 4 | better-sqlite3 ≠ D1 정확 동작(CTE·FTS5 방언 미세차) | 핵심 문법 동일. 최종 1회 `--local` D1 교차 확인 권장. |
| 5 | 스냅샷 재생성 = D1 원격 데이터 적재 의존 | 선행 `pnpm ingest:all` 재적재 확인(또는 `--local`). |
| 6 | real 모드 번들에 Mock+실 양쪽 포함(F015 기지) | 데이터 전부 공개(관세청·DART) → 기밀 누수 아님. 번들 214KB 유지 목표. |

---

*다음 단계: `/pdca design F016` (공용 SQL 모듈·`entity_fts` 스키마·Worker 엔드포인트 계약·검증 픽스처 상세 설계).*
