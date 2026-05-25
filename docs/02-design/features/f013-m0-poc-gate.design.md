# F013 — kita-givc M0 PoC 게이트 Design Document

> **Plan**: [f013-m0-poc-gate.plan.md](../../01-plan/features/f013-m0-poc-gate.plan.md) · **Project**: KITA PoC (kita-givc) · **Version**: 0.1.0 · **Author**: 서민원 + Claude Code · **Date**: 2026-05-25 · **Status**: Draft
>
> **소스 세트 확정**: 무역=관세청(data.go.kr) / 기업=OpenDART / 뉴스=뉴스빅데이터 메타데이터. 동기 인터페이스 보존 = **옵션 A 스냅샷**(Plan §6.3).

---

## 1. Overview

### 1.1 Design Goals

M0 게이트 0a~0d를 **최소 수직 슬라이스(톨루엔 1종)** 로 실행해 저장소(D1+Vectorize) 제안을 검증한다. 산출물은 *판단 근거*(스키마·벤치·정확도·비용)이며 화면/Repository는 건드리지 않는다.

### 1.2 Design Principles

1. **측정 우선** — 모든 기준(≤50ms·≥80%·1라운드)은 실측 스크립트로 캡처. 추정치 금지.
2. **동기 인터페이스 불변** — 실데이터는 D1/Vectorize에 적재하되, 화면은 **정적 스냅샷**을 동기 조회(기존 `s6.layout.json` 선례). M0 0d에 스냅샷 경로 PoC 포함.
3. **출처메타 승계** — 적재 행은 `provenance ∈ {real,est,virt}` NOT NULL. 관세청·OpenDART=⭐real, 메타데이터 파생=△est.
4. **격리** — PoC 리소스(D1 `kita-givc-poc`, Vectorize `kita-givc-poc`)는 기존 데모 Worker와 분리. 실패해도 라이브 데모 무영향.

---

## 2. Architecture

### 2.1 PoC 토폴로지

```
[공개데이터 소스]                    [적재/검증 (Node 스크립트)]            [저장소]            [검증 경로]
관세청 무역통계 API ─┐                                                    ┌─ D1 (정형·그래프·FTS5)
OpenDART 기업      ─┼─→ scripts/ingest/poc-toluene.mjs ──upsert──────────┤
뉴스빅데이터 메타   ─┘    (추출→정규화→provenance→검증)                    └─ Vectorize (의미검색)
                                                                              │
                          scripts/poc/bench-graph.mjs ──── 0b 깊이2 ≤50ms ────┤
                          scripts/poc/bench-vectorize.mjs ─ 0c ≥80%·비용 ─────┤
                          scripts/poc/build-snapshot.mjs ── (옵션A 검증) ──→ s6.real.snapshot.json
```

### 2.2 동기 인터페이스 보존 (옵션 A 확정)

| 경로 | 용도 | 동기성 |
|------|------|--------|
| D1/Vectorize **라이브 쿼리** | 적재 검증(0b/0c/0d), 향후 Worker RAG(`/api/chat`) | 비동기(서버) |
| **정적 스냅샷** (`build-snapshot.mjs` → JSON) | SPA 화면 조회(F015 RealRepository) | **동기**(import) |

> 화면(`S6Page.tsx`)·Repository 인터페이스(`TolueneRepository`) **무변경**. F015는 `MockTolueneRepository`와 동일 시그니처의 `SnapshotTolueneRepository`(스냅샷 import 동기 반환)로 교체. M0는 스냅샷 *생성 경로*만 PoC(0d 말미).

---

## 3. 0b — D1 그래프 PoC

### 3.1 스키마 (현 `KnowledgeGraph` shape 매핑)

```sql
-- graph_nodes: GraphNode(id,type,label,r,meta?,source)
CREATE TABLE graph_nodes (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL CHECK(type IN ('company','rnd','metric','hscode','country')),
  label      TEXT NOT NULL,
  r          REAL NOT NULL DEFAULT 8,
  meta       TEXT,                       -- JSON 직렬화 (Record<string,string>)
  provenance TEXT NOT NULL CHECK(provenance IN ('real','est','virt'))
);
-- graph_edges: GraphEdge = [from,to] (무방향 튜플)
CREATE TABLE graph_edges (
  src TEXT NOT NULL REFERENCES graph_nodes(id),
  dst TEXT NOT NULL REFERENCES graph_nodes(id),
  PRIMARY KEY (src, dst)
);
CREATE INDEX idx_edges_src ON graph_edges(src);
CREATE INDEX idx_edges_dst ON graph_edges(dst);
```

> 무방향 → 적재 시 양방향 2행 insert(또는 조회에서 src/dst 합집합). 노드 ~19개(≤50).

### 3.2 깊이2 탐색 (재귀 CTE)

```sql
WITH RECURSIVE reach(id, depth) AS (
  SELECT 'TOL', 0
  UNION
  SELECT CASE WHEN e.src = r.id THEN e.dst ELSE e.src END, r.depth + 1
  FROM reach r
  JOIN graph_edges e ON (e.src = r.id OR e.dst = r.id)
  WHERE r.depth < 2
)
SELECT DISTINCT n.* FROM reach JOIN graph_nodes n ON n.id = reach.id;
```

### 3.3 벤치 프로토콜 (FR-04)

- `scripts/poc/bench-graph.mjs`: 워밍업 3회 → 측정 20회 → **중앙값·p95 ms** 기록. `wrangler d1 execute kita-givc-poc --command` 또는 로컬 better-sqlite3 동등 비교.
- **PASS = 중앙값 ≤ 50ms**. 미달 시 (a) 경로 사전계산 테이블 `node_reach(seed,id,depth)` (b) 대안 그래프 DB(§5.5).

---

## 4. 0c — Vectorize 의미검색 PoC

### 4.1 임베딩·인덱스

| 항목 | 결정 | 근거 |
|------|------|------|
| 임베딩 모델 | **`@cf/baai/bge-m3`** | 다국어(한국어) 지원. (영문 한정이면 bge-base-en-v1.5) |
| 차원 | 모델 출력 차원(bge-m3=1024) | 인덱스 `dimensions` 일치 필수 |
| metric | **cosine** | 의미 유사도 표준 |
| 인덱스 | `wrangler vectorize create kita-givc-poc --dimensions=1024 --metric=cosine` | |
| 메타데이터 | `{doc_id, provenance, src_table}` | 출처 추적 |

### 4.2 샘플셋·정확도 산식 (FR-06)

- **라벨 샘플셋** `scripts/poc/fixtures/semantic-eval.json`: 톨루엔 도메인 질의 N(≥15)건 × 각 정답 doc_id(들).
- 코퍼스: 무역/기업/뉴스메타 설명 텍스트 임베딩 → upsert.
- 측정: 질의 임베딩 → top-k(k=3) 검색 → **정확도 = (정답이 top-k에 포함된 질의 수) / 전체 질의 수**.
- **PASS = ≥ 0.80**. 미달 시 (a) k·전처리·청킹 튜닝 (b) 모델 교체 (c) RAG는 P1 후순위(§5.5).

### 4.3 비용 추산 (FR-07)

| 비용 축 | 산식 | 데모 볼륨 가정 |
|---------|------|---------------|
| 임베딩(Workers AI) | 토큰/뉴런 단가 × 문서수 × 1회 적재 | 코퍼스 ~수백 chunk |
| Vectorize 저장 | stored vector-dimensions 단가 | doc수 × 1024 |
| Vectorize 쿼리 | queried vector-dimensions 단가 × 쿼리/월 | What-If 세션 한정 |

> CF 공식 단가표로 **월 추산표** 작성. 임계 초과 시 RAG 후순위 권고.

---

## 5. 0d — 적재 1라운드 PoC

### 5.1 `scripts/ingest/poc-toluene.mjs`

```
입력: 관세청 무역통계 API (HS 290230, 최근 N분기) [+ OpenDART 1~2사]
1) 추출   — fetch(API, {serviceKey}) → 원본 JSON (R2 보관 선택)
2) 정규화 — TradeSeries{quarters,exports,imports} / TolueneCompany shape로 매핑(어댑터)
3) 출처메타 — provenance='real' 부착 (NOT NULL)
4) 검증   — 행수>0 · 필수컬럼 NOT NULL · 스키마 타입 일치. 실패 시 비제로 종료(롤백)
5) 적재   — D1 upsert (trade_stats, graph_nodes/edges)
6) 조회   — getTradeSeries 동등 SELECT 1회 + 행수 echo
7) 스냅샷 — (옵션A 검증) build-snapshot.mjs로 s6.real.snapshot.json 생성
```

- **PASS = 클린 상태에서 1명령 재현 성공 + 검증 PASS** (FR-08).
- HS 290230(톨루엔) 6자리 기준, 품목 라벨 교차확인.

### 5.2 적재 검증·롤백

- 검증 실패 시: 해당 라운드 D1 트랜잭션 롤백 + 비제로 exit(CI 감지). 부분 적재 잔재 금지.

---

## 6. 게이트 판정

### 6.1 판정 기준

| 항목 | PASS 기준 | 측정 | FAIL 분기 |
|------|----------|------|----------|
| 0a | 소스 3종 상업이용 라이선스 확인 + API key 동작 | 약관/KOGL 캡처 + 호출 200 | 소스 재선정/뉴스 가상유지 |
| 0b | 깊이2 중앙값 ≤50ms | bench-graph 20회 | 사전계산 or 대안 그래프 |
| 0c | top-k 정확도 ≥80% | semantic-eval N건 | 튜닝 or RAG P1 후순위 |
| 0d | 1라운드 재현 + 검증 PASS | 클린 재실행 | 정규화/소스 재검토 |

### 6.2 종합 판정 → `docs/05-act/f013-m0-gate-report.md`

- **4개 PASS** → "M1(F014) 진행" 권고.
- **0b 또는 0c FAIL** → 대안 적용 후 재측정 1회 → 여전히 미달 시 **범위 축소**(정형+그래프만, RAG 보류) 권고(§5.5).
- **0a FAIL(라이선스)** → 슬라이스 소스 재선정.

---

## 7. Test / 측정 Plan

| 대상 | 방법 | 통과 |
|------|------|------|
| 그래프 벤치 | bench-graph.mjs 20회 중앙값/p95 | ≤50ms |
| 의미검색 | semantic-eval.json N≥15 top-k hit | ≥80% |
| 적재 재현 | 클린 D1 → 1명령 → 검증 | exit 0 + 행수>0 |
| 스냅샷 경로 | build-snapshot → JSON shape가 `KnowledgeGraph`/`TradeSeries` 일치 | tsc 통과(타입 검증) |
| 출처메타 | 적재행 provenance NOT NULL | 스키마 제약 |

---

## 8. Convention / 바인딩

- 신규 디렉토리: `scripts/ingest/`, `scripts/poc/`, `scripts/poc/fixtures/`.
- `wrangler.jsonc`(로컬+example): PoC용 D1·Vectorize 바인딩 추가. 기존 AI/KV/assets 유지.
- API key: `.dev.vars`에 `DATA_GO_KR_KEY`·`OPENDART_KEY`(gitignore, 600). 커밋 금지.
- D1 마이그레이션: PoC 스키마 `migrations/`(또는 PoC 인라인 `--command`). 본 적재는 F014에서 정식 migration.

---

## 9. Implementation Order

1. 👤 Master — data.go.kr·OpenDART API key 발급 + `wrangler d1 create kita-givc-poc` + `wrangler vectorize create kita-givc-poc` 승인
2. 🤖 0b — D1 그래프 스키마 + 톨루엔 노드/엣지 적재 + bench-graph → ≤50ms 캡처
3. 🤖 0c — bge-m3 임베딩 + Vectorize upsert + semantic-eval → ≥80% + 비용표
4. 🤖 0d — poc-toluene.mjs(추출~조회) + build-snapshot 경로 검증
5. 🤖 0a — 라이선스 캡처(KOGL 유형/약관) + API 호출 200 확인
6. 🤖 게이트 리포트 → PASS 시 `/pdca do`(F014) / FAIL 시 분기 권고

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-25 | 초안 — D1 그래프 스키마+깊이2 재귀CTE+벤치, Vectorize(bge-m3·≥80%·비용), 적재 스크립트 IO+검증/롤백, 동기 인터페이스=스냅샷(옵션A), 게이트 판정 기준·분기 | 서민원 + Claude Code |
