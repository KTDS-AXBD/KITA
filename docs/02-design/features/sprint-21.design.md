---
id: KOAMI-DESIGN-021
type: design
sprint: 21
features: [F038]
created: 2026-05-27
status: approved
---

## §1 개요

F038 S21분 — `GraphRepositoryReal` D1 real 연결. Worker에 `/api/givc/cyto-graph` 신규 엔드포인트 추가 후 브라우저 Repository가 fetch.

## §2 데이터 플로우

```
[Browser]                          [Worker]                    [D1]
GraphRepositoryReal
  .getGraph('sobujiang')
    → fetch('/api/givc/cyto-graph')
                           GET /api/givc/cyto-graph
                             → DB.prepare(...graph_nodes).all()
                             → DB.prepare(...graph_edges).all()
                             → transform → CytoGraph JSON
                           ← { domain, nodes[], edges[] }
    ← CytoGraph
  .getGraph('hormuz')
    → super.getGraph('hormuz')  [GRAPH_BY_DOMAIN Mock]
```

## §3 Worker 엔드포인트 설계

### `GET /api/givc/cyto-graph`

**Query**:
```sql
-- nodes (전체, 정렬: type rank → id)
SELECT id, type, label, meta, provenance AS source
FROM graph_nodes
ORDER BY CASE type
  WHEN 'rnd'     THEN 0
  WHEN 'hscode'  THEN 1
  WHEN 'metric'  THEN 2
  WHEN 'country' THEN 3
  WHEN 'company' THEN 4
  ELSE 5 END, id;

-- edges (단방향 dedup: src < dst)
SELECT src, dst FROM graph_edges WHERE src < dst ORDER BY src, dst;
```

**NodeType 매핑** (D1 `graph_nodes.type` → `CytoNodeType`):
| D1 type | CytoNodeType |
|---------|-------------|
| rnd | RnDProject |
| hscode | Product |
| metric | Product |
| country | Country |
| company | Company |

**Response** (CytoGraph JSON):
```json
{
  "domain": "sobujiang",
  "nodes": [
    { "id": "MC", "label": "머시닝센터", "type": "RnDProject", "detail": "{...meta...}", "source": "real" }
  ],
  "edges": [
    { "id": "e_MC_HS845710", "source": "MC", "target": "HS845710", "label": "" }
  ]
}
```

## §4 GraphRepository 구현

```typescript
// src/data/repository/GraphRepository.ts

export class GraphRepositoryReal extends GraphRepository {
  async getGraph(domain: CytoDomain): Promise<CytoGraph> {
    if (domain !== 'sobujiang') {
      return super.getGraph(domain); // hormuz → Mock
    }
    try {
      const res = await fetch('/api/givc/cyto-graph');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as CytoGraph;
    } catch {
      return super.getGraph(domain); // fallback to Mock
    }
  }
}
```

## §5 테스트 계약

추가 테스트 3건 (GraphRepository.test.ts에 describe 블록 추가):

```typescript
describe('GraphRepositoryReal', () => {
  it('sobujiang — fetch 성공 시 API 응답 반환', ...)
  it('hormuz — Mock fallback 반환', ...)
  it('sobujiang — fetch 실패 시 Mock fallback', ...)
})
```

## §6 파일별 변경 상세

### `src/worker/index.ts`

```
추가: app.get('/api/givc/cyto-graph', async (c) => { ... });
위치: /api/givc/graph 엔드포인트 이후
```

### `src/data/repository/GraphRepository.ts`

```
제거: // TODO(S21): koami-givc D1 쿼리로 교체 주석
수정: GraphRepositoryReal 클래스 본문 구현
```

### `src/data/repository/__tests__/GraphRepository.test.ts`

```
추가: describe('GraphRepositoryReal', ...) — 3건
```

## §7 DoD 체크리스트

- [ ] `GET /api/givc/cyto-graph` → status 200 + domain='sobujiang'
- [ ] nodes[].type ∈ CytoNodeType
- [ ] nodes[].source ∈ ('real'|'est'|'virt')
- [ ] edges[].id 존재 (cytoscape 엣지 식별자 필수)
- [ ] `GraphRepositoryReal` sobujiang → fetch 호출
- [ ] `GraphRepositoryReal` hormuz → Mock 반환
- [ ] `pnpm typecheck` 0 error
- [ ] `pnpm test` 79건+ PASS
