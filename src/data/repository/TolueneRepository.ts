import type {
  TolueneProduct,
  TolueneCompany,
  TradeSeries,
  WordCloudCollection,
  TolueneHintCard,
  KnowledgeGraph,
  PositionedGraph,
} from '@/types';
import {
  S6_PRODUCT,
  S6_TRADE,
  S6_COMPANIES,
  S6_GRAPH,
  S6_WORDCLOUD,
  HINTS_S6,
} from '@/data/mock';
import { mergeLayout, S6_LAYOUT } from '@/data/graph-layout';

export interface TolueneRepository {
  getProduct(): TolueneProduct;
  getTradeSeries(): TradeSeries;
  listCompanies(): TolueneCompany[];
  getWordcloud(): WordCloudCollection;
  listHints(): TolueneHintCard[];
  getGraph(): KnowledgeGraph;
  getPositionedGraph(): PositionedGraph;
}

class MockTolueneRepository implements TolueneRepository {
  getProduct(): TolueneProduct {
    return S6_PRODUCT;
  }
  getTradeSeries(): TradeSeries {
    return S6_TRADE;
  }
  listCompanies(): TolueneCompany[] {
    return S6_COMPANIES;
  }
  getWordcloud(): WordCloudCollection {
    return S6_WORDCLOUD;
  }
  listHints(): TolueneHintCard[] {
    return HINTS_S6;
  }
  getGraph(): KnowledgeGraph {
    return S6_GRAPH;
  }
  getPositionedGraph(): PositionedGraph {
    return mergeLayout(S6_GRAPH, S6_LAYOUT);
  }
}

export const tolueneRepository: TolueneRepository = new MockTolueneRepository();
