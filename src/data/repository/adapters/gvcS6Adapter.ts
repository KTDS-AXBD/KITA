import type {
  GvcDomain,
  GvcMetric,
  GvcNetworkEdge,
  GvcProduct,
} from '@/types';
import type {
  GraphEdge,
  GraphNode,
  KnowledgeGraph,
  NodeType,
  PositionedGraph,
  S6Kpi,
} from '@/types';
import { layoutGraph } from './s6Snapshot';

function tierToNodeType(tier: GvcProduct['tier']): NodeType {
  if (tier === '장비') return 'rnd';
  if (tier === '부품') return 'metric';
  return 'hscode';
}

/** GvcProduct[] + GvcNetworkEdge[] → KnowledgeGraph (좌표 없음) */
export function adaptGvcGraph(
  products: GvcProduct[],
  edges: GvcNetworkEdge[],
): KnowledgeGraph {
  const nodes: GraphNode[] = products.map((p) => ({
    id: p.gvcCode,
    type: tierToNodeType(p.tier),
    label: p.label,
    r: p.tier === '장비' ? 26 : p.tier === '부품' ? 17 : 13,
    source: p.provenance,
  }));
  const graphEdges: GraphEdge[] = edges.map((e) => [e.gvcFrom, e.gvcTo] as GraphEdge);
  return { nodes, edges: graphEdges, viewBox: '0 0 800 460' };
}

/** KnowledgeGraph → PositionedGraph (layoutGraph 재사용) */
export function adaptGvcLayout(graph: KnowledgeGraph): PositionedGraph {
  return layoutGraph(graph);
}

const METRIC_LABEL: Record<string, string> = {
  metric_sales_growth: '매출 성장률',
  metric_capital_efficiency: '자본 효율',
  metric_inventory_turnover: '재고 회전',
  metric_rnd_growth: 'R&D 성장',
};

const KPI_KEYS = [
  'metric_sales_growth',
  'metric_capital_efficiency',
  'metric_inventory_turnover',
  'metric_rnd_growth',
] as const;

/** 도메인 앵커(장비tier) 제품의 GvcMetric[] → S6Kpi[4] */
export function adaptGvcKpis(
  anchorCode: string,
  metrics: GvcMetric[],
): S6Kpi[] {
  const byKey = new Map(metrics.filter((m) => m.gvcCode === anchorCode).map((m) => [m.metricKey, m]));
  return KPI_KEYS.map((key) => {
    const m = byKey.get(key);
    const val = m?.value ?? null;
    return {
      label: METRIC_LABEL[key] ?? key,
      value: val !== null ? `${val}${m?.unit ?? ''}` : '—',
      delta: m ? `${anchorCode} · ${m.period ?? '—'}` : '—',
      deltaDir: (val !== null && val >= 0 ? 'up' : 'down') as 'up' | 'down',
    };
  });
}

/** 도메인에서 앵커 제품(tier='장비') gvcCode 반환. 없으면 첫 번째. */
export function anchorCode(products: GvcProduct[]): string {
  return (products.find((p) => p.tier === '장비') ?? products[0])?.gvcCode ?? '';
}

/** 공통 tier 교차 비교용 — 두 도메인 제품에서 tier 집합 추출 */
export function tierSummary(
  products: GvcProduct[],
): Record<'소재' | '부품' | '장비', GvcProduct[]> {
  const out: Record<'소재' | '부품' | '장비', GvcProduct[]> = { 소재: [], 부품: [], 장비: [] };
  for (const p of products) {
    if (p.tier === '소재' || p.tier === '부품' || p.tier === '장비') {
      out[p.tier].push(p);
    }
  }
  return out;
}

/** 도메인 레이블 */
export const DOMAIN_LABEL: Record<GvcDomain, string> = {
  mach: '공작기계 GVC',
  semi: '반도체 소부장 GVC',
};
