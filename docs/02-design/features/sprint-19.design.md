---
id: KOAMI-DESIGN-019
type: design
sprint: 19
features: [F034, F038]
created: 2026-05-27
status: approved
---

## §1 개요

Sprint 19 = F034 (지식그래프 페이지 전면 구현) + F038 (데이터레이어 그래프 Repository 추가).
현재 `/platform/graph`는 PoC 10노드 스텁. 소부장(37노드) + 호르무즈(63노드) 풀그래프와 인터랙션을 구현한다.

---

## §2 데이터 구조 (F038 선행)

### 2.1 GraphNode / GraphEdge 타입 (src/types/index.ts에 추가)

```typescript
export type GraphNodeType =
  | 'Event' | 'Region' | 'Country'
  | 'RawMaterial' | 'IntermediateGoods' | 'Product'
  | 'Industry' | 'Company' | 'EWSAlert'
  | 'RnDProject' | 'PolicyOption' | 'TradeRecord' | 'RiskIndicator';

export type GraphSource = 'real' | 'est' | 'paid';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  detail: string;
  dataSource?: string;
  confidence?: string;
  lastUpdated?: string;
  scenarioRole?: string;
  source: GraphSource;        // 출처 메타 (필수)
  hormuz?: boolean;           // 호르무즈 시나리오 연관 플래그
  position?: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type?: 'impact' | 'normal';
}

export type GraphDomain = 'sobujiang' | 'hormuz';

export interface KnowledgeGraphFull {
  domain: GraphDomain;
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```

### 2.2 graphData.ts 구조 (src/features/platform/graph/graphData.ts)

프로토타입 `initSobujiangGraph` / `initHormuzGraph`를 TypeScript 상수로 변환.

```typescript
export const SOBUJIANG_GRAPH: KnowledgeGraphFull = {
  domain: 'sobujiang',
  nodes: [
    // R&D 공고 (source: 'est')
    { id: 's_rnd', label: 'R&D 공고\n(산기평)', type: 'Event',
      detail: '소부장 자립화 R&D 공고 C2922 공작기계\n예산: 50억원',
      source: 'est', position: { x: 100, y: 400 } },
    // R&D 사례 3건 (source: 'est')
    // 핵심 소부장 품목 10종 (source: 'est')
    // 산업 4종 (source: 'real')
    // 한국 기업 후보 8사 (source: 'est')
    // 의존국 5개 (source: 'real')
    // 해외 기업 5사 (source: 'real')
    // 지표 노드 4개 (source: 'est')
    // 무역 기록 2개 (source: 'real')
    // ... 총 37노드
  ],
  edges: [ /* 프로토타입 sobujiangEdges */ ],
};

export const HORMUZ_GRAPH: KnowledgeGraphFull = {
  domain: 'hormuz',
  nodes: [ /* 프로토타입 nodes — 63노드, hormuz: true/false */ ],
  edges: [ /* 프로토타입 edges */ ],
};

export const GRAPH_BY_DOMAIN: Record<GraphDomain, KnowledgeGraphFull> = {
  sobujiang: SOBUJIANG_GRAPH,
  hormuz: HORMUZ_GRAPH,
};
```

**출처 매핑 규칙**:
- `confidence: '실데이터'` → `source: 'real'`
- `confidence: '추정'` → `source: 'est'`
- `confidence: '유료'` / 외부 유료 DB → `source: 'paid'`
- 기본(없음) → `source: 'est'`

---

## §3 GraphRepository (F038)

### src/data/repository/GraphRepository.ts

```typescript
import { GRAPH_BY_DOMAIN } from '@/features/platform/graph/graphData';
import type { KnowledgeGraphFull, GraphDomain } from '@/types';

// Mock implementation — real adapter placeholder for D1 (F039/S21)
export class GraphRepository {
  async getGraph(domain: GraphDomain): Promise<KnowledgeGraphFull> {
    return GRAPH_BY_DOMAIN[domain];
  }
}

// Real adapter stub — koami-givc D1 real 연결 (S21)
export class GraphRepositoryReal extends GraphRepository {
  // TODO(S21): D1 gvc_network / gvc_products 쿼리로 교체
}

export const graphRepository = new GraphRepository();
```

### src/data/repository/index.ts 갱신

```typescript
export { GraphRepository, graphRepository } from './GraphRepository';
// 기존 exports 유지
```

### src/data/mock/graph.ts

```typescript
export { SOBUJIANG_GRAPH, HORMUZ_GRAPH, GRAPH_BY_DOMAIN } from '@/features/platform/graph/graphData';
```

---

## §4 scenarioResults Mock 스텁 (F038)

### src/data/mock/scenarioResults.ts

```typescript
export interface ScenarioResult {
  rank: number;
  item: string;
  impact: string;
  path: string[];
  source: 'real' | 'est' | 'paid';
}

// CQ-002 소부장 R&D 추천 Top5 (F035 시연용 스텁)
export const SOBUJIANG_TOP5: ScenarioResult[] = [
  { rank: 1, item: '정밀감속기 국산화', impact: '공급망 의존도 85%→50% 감소', path: ['s_rnd', 's_reducer', 's_co_daehan'], source: 'est' },
  { rank: 2, item: '서보모터 자립화', impact: '로봇 산업 연쇄 효과 高', path: ['s_rnd', 's_servo', 's_co_hanil'], source: 'est' },
  { rank: 3, item: '정밀베어링 확대', impact: '공작기계·반도체장비 동시 영향', path: ['s_rnd', 's_bearing', 's_co_seowon'], source: 'est' },
  { rank: 4, item: '볼스크류 대체', impact: '일본 의존도 75% → 40% 목표', path: ['s_rnd', 's_ballscrew'], source: 'est' },
  { rank: 5, item: 'CNC 제어기 개발', impact: '스마트 공장 확산 핵심', path: ['s_rnd', 's_cnc', 's_co_hwacheon'], source: 'est' },
];
```

---

## §5 컴포넌트 설계 (F034)

### 5.1 GraphPage 레이아웃

```
┌──────────────────────────────────────────────────────────────┐
│  HeaderBar (브레드크럼: 지식그래프)                           │
├──────────────────────────────────────────────────────────────┤
│  GraphToolbar                                                 │
│  [소부장 | 호르무즈]  [노드필터: 전체▼]  [영향경로 집중]     │
│  노드 N · 엣지 M                                              │
├───────────────────────────────────────┬──────────────────────┤
│                                       │  NodeDetailPanel     │
│  GraphCanvas (cytoscape, flex-1)      │  (노드 클릭 시 표시) │
│                                       │  - 노드 타입 배지    │
│                                       │  - 상세 설명         │
│                                       │  - 출처 표기         │
│                                       │  - 연결 노드 목록    │
├───────────────────────────────────────┤  (미선택 시 플레이홀더│
│  GraphLegend (하단, 1줄 배지 목록)    │  "노드를 클릭하세요")│
└───────────────────────────────────────┴──────────────────────┘
```

### 5.2 GraphPage.tsx 인터페이스

```typescript
type GraphDomain = 'sobujiang' | 'hormuz';

export function GraphPage(): JSX.Element {
  const [domain, setDomain] = useState<GraphDomain>('sobujiang');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeFilter, setNodeFilter] = useState<string>('all');
  const [focusActive, setFocusActive] = useState(false);
  // selectedNode 계산: graphData[domain].nodes.find(n => n.id === selectedNodeId)
}
```

### 5.3 GraphCanvas.tsx (lazy-loaded)

```typescript
// dynamic import for bundle splitting
const GraphCanvas = React.lazy(() =>
  import('./GraphCanvas').then(m => ({ default: m.GraphCanvas }))
);

// GraphCanvas props
interface GraphCanvasProps {
  graph: KnowledgeGraphFull;
  nodeFilter: string;
  focusActive: boolean;
  onNodeSelect: (nodeId: string | null) => void;
}
```

**cytoscape 스타일**: CSS 변수 `--op-color-*`를 `getComputedStyle(document.documentElement)` 로 읽어 `NODE_COLORS` 딕셔너리로 변환.

```typescript
function resolveNodeColors(): Record<string, string> {
  const s = getComputedStyle(document.documentElement);
  return {
    Event: s.getPropertyValue('--op-color-event').trim(),
    Region: s.getPropertyValue('--op-color-region').trim(),
    Country: s.getPropertyValue('--op-color-country').trim(),
    RawMaterial: s.getPropertyValue('--op-color-raw').trim(),
    IntermediateGoods: s.getPropertyValue('--op-color-intermediate').trim(),
    Product: s.getPropertyValue('--op-color-product').trim(),
    Industry: s.getPropertyValue('--op-color-industry').trim(),
    Company: s.getPropertyValue('--op-color-company').trim(),
    EWSAlert: s.getPropertyValue('--op-color-ews').trim(),
    RnDProject: s.getPropertyValue('--op-color-rnd').trim(),
    PolicyOption: s.getPropertyValue('--op-color-policy').trim(),
    TradeRecord: s.getPropertyValue('--op-color-trade').trim(),
    RiskIndicator: s.getPropertyValue('--op-color-risk').trim(),
  };
}
```

**필터 + 영향경로 cytoscape 로직** (useEffect deps: [graph, nodeFilter, focusActive]):

```typescript
// 노드 필터
if (nodeFilter === 'all') {
  cy.elements().removeClass('dimmed');
} else {
  cy.elements().addClass('dimmed');
  cy.nodes(`[type="${nodeFilter}"]`).removeClass('dimmed');
  cy.nodes(`[type="${nodeFilter}"]`).connectedEdges().removeClass('dimmed');
  cy.nodes(`[type="${nodeFilter}"]`).neighborhood('node').removeClass('dimmed');
}

// 영향경로 집중 (소부장: RnDProject/RiskIndicator 강조 / 호르무즈: hormuz:true 플래그)
if (focusActive) {
  const flag = graph.domain === 'hormuz' ? '[hormuz]' : '[type="RnDProject"],[type="RiskIndicator"]';
  cy.elements().addClass('dimmed');
  cy.nodes(flag).removeClass('dimmed');
  cy.nodes(flag).connectedEdges().removeClass('dimmed');
}
```

**노드 클릭 이벤트**:
```typescript
cy.on('tap', 'node', (evt) => {
  onNodeSelect(evt.target.id());
});
cy.on('tap', (evt) => {
  if (evt.target === cy) onNodeSelect(null);
});
```

### 5.4 NodeDetailPanel.tsx 인터페이스

```typescript
interface NodeDetailPanelProps {
  node: GraphNode | null;
  connectedNodeIds: string[];
}

export function NodeDetailPanel({ node, connectedNodeIds }: NodeDetailPanelProps): JSX.Element
```

**표시 항목** (node 선택 시):
- 노드 타입 `<Badge>` (type별 색상)
- `node.label` (h3)
- `node.detail` (whitespace-pre-line)
- 출처: `<DataMark source={node.source} />` + `node.dataSource`
- 갱신일: `node.lastUpdated`
- 시나리오 역할: `node.scenarioRole` (있을 때만)
- 연결 노드 수: `connectedNodeIds.length`건

**미선택 시**: 아이콘 + "노드를 클릭하면 상세 정보가 표시됩니다"

### 5.5 GraphLegend.tsx

```typescript
const LEGEND_TYPES: Array<{ type: string; label: string; cssVar: string }> = [
  { type: 'Event', label: '이벤트', cssVar: '--op-color-event' },
  { type: 'Country', label: '국가', cssVar: '--op-color-country' },
  { type: 'Product', label: '품목', cssVar: '--op-color-product' },
  { type: 'Industry', label: '산업', cssVar: '--op-color-industry' },
  { type: 'Company', label: '기업', cssVar: '--op-color-company' },
  { type: 'RnDProject', label: 'R&D', cssVar: '--op-color-rnd' },
  { type: 'RiskIndicator', label: '지표', cssVar: '--op-color-risk' },
  { type: 'TradeRecord', label: '무역', cssVar: '--op-color-trade' },
  { type: 'EWSAlert', label: 'EWS 경보', cssVar: '--op-color-ews' },
];
// 색상 원 + 라벨 배지, 클릭 시 해당 타입 필터 적용
```

### 5.6 GraphToolbar.tsx

```typescript
interface GraphToolbarProps {
  domain: GraphDomain;
  nodeCount: number;
  edgeCount: number;
  nodeFilter: string;
  focusActive: boolean;
  onDomainChange: (d: GraphDomain) => void;
  onNodeFilterChange: (t: string) => void;
  onFocusToggle: () => void;
}
```

**노드 필터 options**: `all` + `GraphNodeType` 목록 (실제 그래프에 있는 타입만)

---

## §6 cytoscape 타입 처리

`cytoscape`의 style 함수 타입이 엄격 — `as unknown as string` 캐스트 패턴 재사용 (CytoscapePoC 선례):

```typescript
style: [
  {
    selector: 'node',
    style: {
      label: 'data(label)' as unknown as string,
      'background-color': (ele: cytoscape.NodeSingular) =>
        nodeColors[ele.data('type') as GraphNodeType] ?? '#999',
      // ...
    } as cytoscape.Css.Node,
  },
]
```

---

## §7 번들 최적화

```typescript
// GraphPage.tsx 내 lazy import
const GraphCanvas = React.lazy(() =>
  import('./GraphCanvas').then(m => ({ default: m.GraphCanvas }))
);

// Suspense wrapping
<Suspense fallback={<div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--op-text-tertiary)' }}>그래프 로딩 중...</div>}>
  <GraphCanvas ... />
</Suspense>
```

**목표**: 현 745KB gz226 → ≤550KB gz180

---

## §8 구현 순서

1. **F038 먼저**: `src/types/index.ts`에 GraphNode/GraphEdge 타입 추가
2. `graphData.ts` — 프로토타입에서 소부장/호르무즈 픽스처 추출 + `source` 메타 부여
3. `GraphRepository.ts` + `src/data/repository/index.ts` 갱신
4. `src/data/mock/graph.ts` re-export
5. `scenarioResults.ts` 스텁
6. **F034**: `GraphCanvas.tsx` (cytoscape, lazy)
7. `NodeDetailPanel.tsx`
8. `GraphLegend.tsx`
9. `GraphToolbar.tsx`
10. `GraphPage.tsx` — 조합 + state 연결
11. `CytoscapePoC.tsx` **삭제**
12. `pnpm typecheck && pnpm test && pnpm build`

---

## §9 테스트 계약

- `GraphRepository.test.ts`: `getGraph('sobujiang')` → node 수 ≥ 30, 모든 노드에 `source` 필드
- `GraphRepository.test.ts`: `getGraph('hormuz')` → node 수 ≥ 50
- 기존 71건 PASS 유지 (GraphRepository 추가 시 73건+)
