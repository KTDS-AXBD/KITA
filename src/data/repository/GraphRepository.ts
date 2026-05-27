import { GRAPH_BY_DOMAIN } from '@/features/platform/graph/graphData';
import type { CytoGraph, CytoDomain } from '@/types';

export class GraphRepository {
  async getGraph(domain: CytoDomain): Promise<CytoGraph> {
    return GRAPH_BY_DOMAIN[domain]!;
  }
}

// Real adapter — Worker /api/givc/cyto-graph (D1 graph_nodes + graph_edges) 소비.
// sobujiang: fetch API → CytoGraph / hormuz: Mock fallback (D1 데이터 없음)
export class GraphRepositoryReal extends GraphRepository {
  override async getGraph(domain: CytoDomain): Promise<CytoGraph> {
    if (domain !== 'sobujiang') return super.getGraph(domain);
    try {
      const res = await fetch('/api/givc/cyto-graph');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as CytoGraph;
    } catch {
      return super.getGraph(domain);
    }
  }
}

export const graphRepository = new GraphRepository();
