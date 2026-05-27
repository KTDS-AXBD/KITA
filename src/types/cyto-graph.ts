// Cytoscape 기반 지식그래프 타입 (F034/F038)
// src/types/graph.ts의 S4용 GraphNode/GraphEdge와 별도 네임스페이스

export type CytoNodeType =
  | 'Event' | 'Region' | 'Country'
  | 'RawMaterial' | 'IntermediateGoods' | 'Product'
  | 'Industry' | 'Company' | 'EWSAlert'
  | 'RnDProject' | 'PolicyOption' | 'TradeRecord' | 'RiskIndicator';

export type CytoSource = 'real' | 'est' | 'paid';

export interface CytoNode {
  id: string;
  label: string;
  type: CytoNodeType;
  detail: string;
  dataSource?: string;
  confidence?: string;
  lastUpdated?: string;
  scenarioRole?: string;
  source: CytoSource;
  hormuz?: boolean;
  position?: { x: number; y: number };
}

export interface CytoEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type?: 'impact' | 'normal';
}

export type CytoDomain = 'sobujiang' | 'hormuz';

export interface CytoGraph {
  domain: CytoDomain;
  nodes: CytoNode[];
  edges: CytoEdge[];
}
