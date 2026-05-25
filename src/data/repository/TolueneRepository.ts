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
import {
  REAL_PRODUCT,
  adaptTradeSeries,
  adaptCompanies,
  adaptGraph,
  layoutGraph,
  FALLBACK_WORDCLOUD,
  FALLBACK_HINTS,
} from './adapters/tolueneSnapshot';

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

// F015 — 실데이터 구현체 (스냅샷 동기 서빙 + 어댑터 gap-fill). index.ts 토글로 선택.
class SnapshotTolueneRepository implements TolueneRepository {
  getProduct(): TolueneProduct {
    return REAL_PRODUCT;
  }
  getTradeSeries(): TradeSeries {
    return adaptTradeSeries();
  }
  listCompanies(): TolueneCompany[] {
    return adaptCompanies();
  }
  getWordcloud(): WordCloudCollection {
    return FALLBACK_WORDCLOUD; // 뉴스 P1 미적재 → Mock(※virt)
  }
  listHints(): TolueneHintCard[] {
    return FALLBACK_HINTS; // 시연 카드(※virt)
  }
  getGraph(): KnowledgeGraph {
    return adaptGraph();
  }
  getPositionedGraph(): PositionedGraph {
    return layoutGraph(adaptGraph()); // 결정적 레이아웃(stale s6.layout.json 미사용)
  }
}

export const snapshotTolueneRepository: TolueneRepository = new SnapshotTolueneRepository();
