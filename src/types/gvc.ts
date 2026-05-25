import type { Provenance } from './provenance';

export type GvcDomain = 'mach' | 'semi';

export interface GvcProduct {
  gvcCode: string;
  domain: GvcDomain;
  label: string;
  hsCodes: string[];
  tier: '소재' | '부품' | '장비' | null;
  sort: number;
  provenance: Provenance;
}

export interface GvcNetworkEdge {
  gvcFrom: string;
  gvcTo: string;
  tierLabel: string | null;
  sort: number;
  provenance: Provenance;
}

export type GvcMetricKey =
  | 'metric_sales_growth'
  | 'metric_capital_efficiency'
  | 'metric_financial_cost_ratio'
  | 'metric_inventory_turnover'
  | 'metric_employment_change'
  | 'metric_rnd_growth';

export interface GvcMetric {
  gvcCode: string;
  metricKey: GvcMetricKey;
  value: number | null;
  unit: string | null;
  period: string | null;
  provenance: Provenance;
}
