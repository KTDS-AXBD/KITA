import type { Provenance, SourceMap } from './provenance';

export type CandidateMetricKey = 'rndGrowth' | 'salesGrowth' | 'patentCount' | 'defaultRisk';

export interface Candidate {
  id: string;
  name: string;
  biz: string;
  region: string;
  rndGrowth: number;
  salesGrowth: number;
  patentCount: number;
  defaultRisk: number;
  coreType: 1 | 2;
  sources: SourceMap<CandidateMetricKey>;
  evidenceKeys: string[];
  note: string;
}

export interface ScoredCandidate extends Candidate {
  score: number;
  _components: Record<CandidateMetricKey, number>;
}

export interface Weights {
  rnd: number;
  sales: number;
  patent: number;
  risk: number;
}

export type HintId = 'h_rndcall' | 'h_patent' | 'h_movement' | 'h_finance';
export type ActiveHints = Partial<Record<HintId, boolean>>;

export interface Domain {
  id: string;
  label: string;
  sub: string;
}

export interface Preset {
  id: string;
  label: string;
  title: string;
  domain: string;
  budget: number;
  period: number;
  weights: Weights;
}

export interface CounterRecommendation {
  id: string;
  name: string;
  reason: string;
  tag: '리스크' | '자격' | '데이터 부족' | string;
  source: Provenance;
}

export interface SimilarCase {
  id: string;
  year: number;
  title: string;
  funder: string;
  amount: string;
  outcome: string;
  match: number;
  source: Provenance;
}

export interface HintCard {
  id: string;
  title: string;
  delta: string;
  detail: string;
  boost?: Record<string, number>;
}

export interface WhatIfPrompt {
  q: string;
  a: string;
}
