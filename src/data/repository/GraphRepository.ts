import { GRAPH_BY_DOMAIN } from '@/features/platform/graph/graphData';
import type { CytoGraph, CytoDomain } from '@/types';

export class GraphRepository {
  async getGraph(domain: CytoDomain): Promise<CytoGraph> {
    return GRAPH_BY_DOMAIN[domain]!;
  }
}

// Real adapter stub — D1 gvc_network / gvc_products 연결 (S21)
export class GraphRepositoryReal extends GraphRepository {
  // TODO(S21): koami-givc D1 쿼리로 교체
}

export const graphRepository = new GraphRepository();
