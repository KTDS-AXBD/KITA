import type { Provenance } from './provenance';

/** S6 가치사슬 anchor (공작기계 머시닝센터 등). 구 TolueneProduct. cas→ksic(기계 표준산업분류). */
export interface S6Focus {
  name: string;
  hsCode: string;
  ksic: string;
  category: string;
  description: string;
}

/** 가치사슬 단계(소재→부품→장비). 표·그래프 tier 구분용. */
export type ValueChainTier = '소재' | '부품' | '장비';

export interface S6Company {
  id: string;
  name: string;
  biz: string;
  share: string;
  sales: string;
  coreType: 1 | 2;
  role: string;
  tier: ValueChainTier;
  source: Provenance;
}

export interface TradeAnomaly {
  idx: number;
  label: string;
  source: Provenance;
}

export interface TradeSeries {
  quarters: string[];
  exports: number[];
  imports: number[];
  anomalies: TradeAnomaly[];
  source: Provenance;
}

export type WordSentiment = 'pos' | 'neg' | 'dim' | '';

export interface NewsWord {
  w: string;
  s: number;
  t: WordSentiment;
}

export interface WordCloudCollection {
  words: NewsWord[];
  source: Provenance;
}

export interface S6HintCard {
  id: string;
  title: string;
  delta: string;
  detail: string;
}
