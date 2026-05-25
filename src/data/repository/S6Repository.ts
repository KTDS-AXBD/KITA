import type {
  S6Focus,
  S6Company,
  TradeSeries,
  WordCloudCollection,
  S6HintCard,
  S6Kpi,
  KnowledgeGraph,
  PositionedGraph,
} from '@/types';
import {
  S6_FOCUS,
  S6_TRADE,
  S6_COMPANIES,
  S6_GRAPH,
  S6_WORDCLOUD,
  S6_KPIS,
  HINTS_S6,
} from '@/data/mock';
import {
  REAL_PRODUCT,
  adaptTradeSeries,
  adaptCompanies,
  adaptGraph,
  adaptKpis,
  layoutGraph,
  FALLBACK_WORDCLOUD,
  FALLBACK_HINTS,
} from './adapters/s6Snapshot';

export interface S6Repository {
  getProduct(): S6Focus;
  getTradeSeries(): TradeSeries;
  listCompanies(): S6Company[];
  getKpis(): S6Kpi[];
  getWordcloud(): WordCloudCollection;
  listHints(): S6HintCard[];
  getGraph(): KnowledgeGraph;
  getPositionedGraph(): PositionedGraph;
}

class MockS6Repository implements S6Repository {
  getProduct(): S6Focus {
    return S6_FOCUS;
  }
  getTradeSeries(): TradeSeries {
    return S6_TRADE;
  }
  listCompanies(): S6Company[] {
    return S6_COMPANIES;
  }
  getKpis(): S6Kpi[] {
    return S6_KPIS;
  }
  getWordcloud(): WordCloudCollection {
    return S6_WORDCLOUD;
  }
  listHints(): S6HintCard[] {
    return HINTS_S6;
  }
  getGraph(): KnowledgeGraph {
    return S6_GRAPH;
  }
  getPositionedGraph(): PositionedGraph {
    // 결정적 방사형 레이아웃 (다단계 가치사슬 그래프 — stale layout JSON 미사용)
    return layoutGraph(S6_GRAPH);
  }
}

export const s6Repository: S6Repository = new MockS6Repository();

// F015/F023 — 실데이터 구현체 (스냅샷 동기 서빙 + 어댑터 gap-fill). index.ts 토글로 선택.
// F023: real 스냅샷 = 기계 다단계 가치사슬(머시닝센터 + 베어링·감속기·특수강 tier + 상장 기계사).
class SnapshotS6Repository implements S6Repository {
  getProduct(): S6Focus {
    return REAL_PRODUCT;
  }
  getTradeSeries(): TradeSeries {
    return adaptTradeSeries();
  }
  listCompanies(): S6Company[] {
    return adaptCompanies();
  }
  getKpis(): S6Kpi[] {
    return adaptKpis();
  }
  getWordcloud(): WordCloudCollection {
    return FALLBACK_WORDCLOUD; // 뉴스 P1 미적재 → Mock(※virt)
  }
  listHints(): S6HintCard[] {
    return FALLBACK_HINTS; // 시연 카드(※virt)
  }
  getGraph(): KnowledgeGraph {
    return adaptGraph();
  }
  getPositionedGraph(): PositionedGraph {
    return layoutGraph(adaptGraph()); // 결정적 레이아웃
  }
}

export const snapshotS6Repository: S6Repository = new SnapshotS6Repository();
