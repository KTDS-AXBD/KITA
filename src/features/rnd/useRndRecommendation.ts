import { useMemo } from 'react';
import { rankCandidates, type ResolvedBoosts } from './scoring';
import { rndRepository } from '@/data/repository';
import type {
  Candidate,
  ScoredCandidate,
  Weights,
  ActiveHints,
  PositionedGraph,
} from '@/types';

export interface RndRecommendation {
  candidates: Candidate[];
  ranked: ScoredCandidate[];
  top5: ScoredCandidate[];
  boosts: ResolvedBoosts;
  matchAccuracy: number;
  graph: PositionedGraph;
}

/**
 * S4 R&D 추천 hook.
 * Repository 경유로 후보·그래프를 읽어 가중치·hint에 따라 즉시 재계산.
 */
export function useRndRecommendation(
  weights: Weights,
  activeHints: ActiveHints,
): RndRecommendation {
  const candidates = rndRepository.listCandidates();
  const baseGraph = rndRepository.getPositionedEvidenceGraph();

  const { ranked, boosts } = useMemo(
    () => rankCandidates(candidates, weights, activeHints),
    [candidates, weights, activeHints],
  );
  const top5 = useMemo(() => ranked.slice(0, 5), [ranked]);
  const matchAccuracy = boosts.matchAccuracy;

  const graph = useMemo<PositionedGraph>(() => {
    const top5Ids = new Set(top5.map((c) => c.id));
    const allCompanyIds = new Set(
      baseGraph.nodes.filter((n) => n.type === 'company').map((n) => n.id),
    );
    const nodes = baseGraph.nodes.filter(
      (n) => n.type !== 'company' || top5Ids.has(n.id),
    );
    const edges = baseGraph.edges.filter(([a, b]) => {
      const aCo = allCompanyIds.has(a);
      const bCo = allCompanyIds.has(b);
      if (aCo && !top5Ids.has(a)) return false;
      if (bCo && !top5Ids.has(b)) return false;
      return true;
    });
    return { nodes, edges, viewBox: baseGraph.viewBox };
  }, [baseGraph, top5]);

  return { candidates, ranked, top5, boosts, matchAccuracy, graph };
}
