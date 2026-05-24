import type { Provenance } from './provenance';

export type NodeType = 'company' | 'rnd' | 'metric' | 'hscode' | 'country';

/** 좌표를 제외한 도메인 노드 — 좌표는 graph-layout JSON에서 머지 */
export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  r: number;
  meta?: Record<string, string>;
  source: Provenance;
}

/** 빌드타임 좌표 스냅샷 (F006) */
export interface GraphLayoutNode {
  id: string;
  x: number;
  y: number;
}

export type GraphEdge = readonly [string, string];

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  viewBox: string;
}

/** 런타임 머지 결과 — 좌표 포함 */
export interface PositionedNode extends GraphNode {
  x: number;
  y: number;
}

export interface PositionedGraph {
  nodes: PositionedNode[];
  edges: GraphEdge[];
  viewBox: string;
}
