import s4Layout from './s4.layout.json';
import type {
  GraphLayoutNode,
  KnowledgeGraph,
  PositionedGraph,
  PositionedNode,
} from '@/types';

// S4만 빌드타임 스냅샷 레이아웃 사용(mergeLayout). S6는 어댑터 layoutGraph 결정적 산출(F021/F023).
const S4_LAYOUT: GraphLayoutNode[] = s4Layout as GraphLayoutNode[];

/** F006 — 좌표 머지. 좌표 누락 노드는 viewBox 중앙 fallback + console.warn. */
export function mergeLayout(
  graph: KnowledgeGraph,
  layout: GraphLayoutNode[],
): PositionedGraph {
  const byId = new Map(layout.map((p) => [p.id, p]));
  const vb = graph.viewBox.split(/\s+/).map(Number);
  const cx = (vb[0] ?? 0) + (vb[2] ?? 0) / 2;
  const cy = (vb[1] ?? 0) + (vb[3] ?? 0) / 2;
  const nodes: PositionedNode[] = graph.nodes.map((n) => {
    const pos = byId.get(n.id);
    if (!pos) {
      console.warn(`[graph-layout] missing coord for node "${n.id}" — using viewBox center`);
      return { ...n, x: cx, y: cy };
    }
    return { ...n, x: pos.x, y: pos.y };
  });
  return { nodes, edges: graph.edges, viewBox: graph.viewBox };
}

export { S4_LAYOUT };
