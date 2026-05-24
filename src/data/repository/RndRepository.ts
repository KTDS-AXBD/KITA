import type {
  Candidate,
  CounterRecommendation,
  SimilarCase,
  HintCard,
  WhatIfPrompt,
  Domain,
  Preset,
  KnowledgeGraph,
  PositionedGraph,
} from '@/types';
import {
  DOMAINS,
  PRESETS,
  S4_CANDIDATE_POOL,
  S4_COUNTER,
  S4_SIMILAR_CASES,
  S4_GRAPH,
  HINTS_S4,
  WHATIF_PROMPTS,
} from '@/data/mock';
import { mergeLayout, S4_LAYOUT } from '@/data/graph-layout';

/** S4 R&D 도메인 데이터 인터페이스. 향후 GIVC 연동 시 구현체 교체. */
export interface RndRepository {
  listDomains(): Domain[];
  listPresets(): Preset[];
  listCandidates(): Candidate[];
  listCounterRecommendations(): CounterRecommendation[];
  listSimilarCases(): SimilarCase[];
  listHints(): HintCard[];
  listWhatIfPrompts(): WhatIfPrompt[];
  getEvidenceGraph(): KnowledgeGraph;
  getPositionedEvidenceGraph(): PositionedGraph;
}

class MockRndRepository implements RndRepository {
  listDomains(): Domain[] {
    return DOMAINS;
  }
  listPresets(): Preset[] {
    return PRESETS;
  }
  listCandidates(): Candidate[] {
    return S4_CANDIDATE_POOL;
  }
  listCounterRecommendations(): CounterRecommendation[] {
    return S4_COUNTER;
  }
  listSimilarCases(): SimilarCase[] {
    return S4_SIMILAR_CASES;
  }
  listHints(): HintCard[] {
    return HINTS_S4;
  }
  listWhatIfPrompts(): WhatIfPrompt[] {
    return WHATIF_PROMPTS;
  }
  getEvidenceGraph(): KnowledgeGraph {
    return S4_GRAPH;
  }
  getPositionedEvidenceGraph(): PositionedGraph {
    return mergeLayout(S4_GRAPH, S4_LAYOUT);
  }
}

export const rndRepository: RndRepository = new MockRndRepository();
