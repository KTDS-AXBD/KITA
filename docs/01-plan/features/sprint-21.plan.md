---
id: KOAMI-PLAN-021
type: plan
sprint: 21
features: [F038]
created: 2026-05-27
status: approved
---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | `GraphRepositoryReal`이 `GraphRepository`(Mock)를 그대로 상속 — real D1 연결 stub 상태. `VITE_DATA_SOURCE=real` 설정 시에도 Mock 픽스처만 반환 |
| **Solution** | Worker에 `/api/givc/cyto-graph` 엔드포인트 추가 → `graph_nodes`/`graph_edges` D1 쿼리 → `CytoGraph` 변환 반환. `GraphRepositoryReal.getGraph('sobujiang')`이 이 API를 fetch |
| **Core Value** | S19 Mock 토글 구조 완성 — real 모드에서 공작기계 D1 실데이터(18노드·real provenance) 서빙 |

---

## §1 목표

1. **F038 S21분**: `GraphRepositoryReal` → Worker `/api/givc/cyto-graph` 연결
2. **Worker 엔드포인트**: `graph_nodes` + `graph_edges` D1 쿼리 → `CytoGraph` JSON
3. **도메인 분기**: `sobujiang` → D1 real / `hormuz` → Mock fallback (D1 데이터 없음)

## §2 범위

**포함**:
- `src/worker/index.ts` — `/api/givc/cyto-graph` GET 엔드포인트 추가
- `src/data/repository/GraphRepository.ts` — `GraphRepositoryReal.getGraph()` 구현
- `src/data/repository/__tests__/GraphRepository.test.ts` — real 어댑터 테스트 추가

**제외**:
- D1 스키마 변경 (migration 불필요 — `graph_nodes`/`graph_edges` 기존 테이블 재활용)
- hormuz 도메인 D1 적재 (F039 이후 외부 게이트)
- cytoscape 레이아웃 좌표 D1 저장 (cytoscape cose 자동 레이아웃이 처리)

## §3 기존 코드 실측

```
src/data/repository/GraphRepository.ts    — stub (TODO S21 주석)
src/data/repository/__tests__/GraphRepository.test.ts — Mock 5건
src/worker/index.ts                       — /api/givc/graph 존재 (graph_nodes 재귀 쿼리)
migrations/0001_koami_givc.sql            — graph_nodes(id/type/label/r/meta/provenance)
scripts/ingest/build-graph.mjs            — 18노드: MC·HS845710·국가·tier·기업
```

## §4 기술 결정

| 항목 | 결정 | 근거 |
|------|------|------|
| **API 엔드포인트** | 신규 `/api/givc/cyto-graph` | 기존 `/api/givc/graph`는 재귀 CTE 탐색 목적, 전체 그래프 반환과 분리 |
| **NodeType 매핑** | company→Company·rnd→RnDProject·metric→Product·hscode→Product·country→Country | CytoNodeType 최소 매핑 |
| **detail 필드** | `meta` JSON 문자열 그대로 (CytoNode.detail=string) | 추가 파싱 없이 서빙 |
| **hormuz fallback** | `super.getGraph(domain)` (Mock 픽스처) | D1에 hormuz 데이터 없음, Mock이 기준 |
| **에러 핸들링** | fetch 실패 시 Mock fallback | 시연 안정성 우선 |
| **edge dedup** | `src < dst` WHERE 조건으로 단방향 변환 | build-graph.mjs가 양방향 저장, 중복 제거 |

## §5 구현 파일 매핑

| 파일 | 작업 |
|------|------|
| `src/worker/index.ts` | `/api/givc/cyto-graph` GET 추가 |
| `src/data/repository/GraphRepository.ts` | `GraphRepositoryReal.getGraph()` 구현 |
| `src/data/repository/__tests__/GraphRepository.test.ts` | real 어댑터 테스트 3건 추가 |

## §6 DoD (완료 기준)

- [ ] `/api/givc/cyto-graph` → `{ domain, nodes, edges }` CytoGraph JSON 반환
- [ ] `VITE_DATA_SOURCE=real` 시 `graphRepository`가 `GraphRepositoryReal` 인스턴스
- [ ] `GraphRepositoryReal.getGraph('sobujiang')` → fetch `/api/givc/cyto-graph`
- [ ] `GraphRepositoryReal.getGraph('hormuz')` → Mock 픽스처 반환
- [ ] `pnpm typecheck` PASS (0 error)
- [ ] `pnpm test` 기존 76건 + 신규 3건 = 79건 이상 PASS
- [ ] `pnpm build` PASS

## §7 리스크

| 리스크 | 가능성 | 대응 |
|--------|--------|------|
| vitest에서 fetch Mock 설정 | 낮음 | vitest global fetch mock (vi.stubGlobal) |
| D1 edge dedup 중복 | 낮음 | `src < dst` WHERE 절로 단방향 변환 |
| Worker 타입 에러 (CytoGraph import) | 낮음 | Worker는 JS타입 불필요, 응답 JSON만 구성 |
