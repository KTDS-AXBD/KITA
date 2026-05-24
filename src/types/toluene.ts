import type { Provenance } from './provenance';

export interface TolueneProduct {
  name: string;
  hsCode: string;
  cas: string;
  category: string;
  description: string;
}

export interface TolueneCompany {
  id: string;
  name: string;
  biz: string;
  share: string;
  sales: string;
  coreType: 1 | 2;
  role: string;
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

export interface TolueneHintCard {
  id: string;
  title: string;
  delta: string;
  detail: string;
}
