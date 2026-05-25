import type { GvcDomain, GvcMetric, GvcMetricKey, GvcNetworkEdge, GvcProduct } from '@/types';

export interface GvcRepository {
  listDomains(): GvcDomain[];
  listProducts(domain: GvcDomain): GvcProduct[];
  getNetwork(domain: GvcDomain): GvcNetworkEdge[];
  listMetrics(gvcCode: string): GvcMetric[];
  listMetricsByDomain(domain: GvcDomain, metricKey: GvcMetricKey): GvcMetric[];
}

// virt 시드 — 기계 도메인 (GVC-MACH-*, ※virt)
const MACH_PRODUCTS: GvcProduct[] = [
  { gvcCode: 'GVC-MACH-MC001', domain: 'mach', label: '머시닝센터', hsCodes: ['845710'], tier: '장비', sort: 3, provenance: 'virt' },
  { gvcCode: 'GVC-MACH-GB001', domain: 'mach', label: '볼베어링', hsCodes: ['848210'], tier: '부품', sort: 2, provenance: 'virt' },
  { gvcCode: 'GVC-MACH-GR001', domain: 'mach', label: '기어감속기', hsCodes: ['848340'], tier: '부품', sort: 2, provenance: 'virt' },
  { gvcCode: 'GVC-MACH-SS001', domain: 'mach', label: '특수강', hsCodes: ['722840'], tier: '소재', sort: 1, provenance: 'virt' },
];

// virt 시드 — 반도체 도메인 (GVC-SEMI-*, ※virt)
const SEMI_PRODUCTS: GvcProduct[] = [
  { gvcCode: 'GVC-SEMI-WF001', domain: 'semi', label: '실리콘웨이퍼', hsCodes: ['381800'], tier: '소재', sort: 1, provenance: 'virt' },
  { gvcCode: 'GVC-SEMI-SL001', domain: 'semi', label: 'CMP슬러리', hsCodes: ['382490'], tier: '소재', sort: 1, provenance: 'virt' },
  { gvcCode: 'GVC-SEMI-PG001', domain: 'semi', label: '포토마스크', hsCodes: ['903190'], tier: '부품', sort: 2, provenance: 'virt' },
  { gvcCode: 'GVC-SEMI-RI001', domain: 'semi', label: '포토레지스트', hsCodes: ['370130'], tier: '소재', sort: 1, provenance: 'virt' },
];

// product_network 형 엣지 — 기계 (소재→부품→장비)
const MACH_NETWORK: GvcNetworkEdge[] = [
  { gvcFrom: 'GVC-MACH-SS001', gvcTo: 'GVC-MACH-GB001', tierLabel: '소재→부품', sort: 1, provenance: 'virt' },
  { gvcFrom: 'GVC-MACH-SS001', gvcTo: 'GVC-MACH-GR001', tierLabel: '소재→부품', sort: 2, provenance: 'virt' },
  { gvcFrom: 'GVC-MACH-GB001', gvcTo: 'GVC-MACH-MC001', tierLabel: '부품→장비', sort: 3, provenance: 'virt' },
  { gvcFrom: 'GVC-MACH-GR001', gvcTo: 'GVC-MACH-MC001', tierLabel: '부품→장비', sort: 4, provenance: 'virt' },
];

// product_network 형 엣지 — 반도체
const SEMI_NETWORK: GvcNetworkEdge[] = [
  { gvcFrom: 'GVC-SEMI-SL001', gvcTo: 'GVC-SEMI-WF001', tierLabel: '소재→소재(폴리싱)', sort: 1, provenance: 'virt' },
  { gvcFrom: 'GVC-SEMI-WF001', gvcTo: 'GVC-SEMI-PG001', tierLabel: '소재→부품', sort: 2, provenance: 'virt' },
  { gvcFrom: 'GVC-SEMI-RI001', gvcTo: 'GVC-SEMI-PG001', tierLabel: '소재→부품', sort: 3, provenance: 'virt' },
];

// scmm 지표 — 산업 평균 추정 (provenance='est', 공개 산업보고서 기반)
function makeMetrics(gvcCode: string): GvcMetric[] {
  const base: { key: GvcMetricKey; value: number; unit: string }[] = [
    { key: 'metric_sales_growth', value: 4.2, unit: '%' },
    { key: 'metric_capital_efficiency', value: 112.5, unit: '%' },
    { key: 'metric_financial_cost_ratio', value: 2.1, unit: '%' },
    { key: 'metric_inventory_turnover', value: 5.8, unit: '회' },
    { key: 'metric_employment_change', value: 1.3, unit: '%' },
    { key: 'metric_rnd_growth', value: 6.7, unit: '%' },
  ];
  return base.map(({ key, value, unit }) => ({
    gvcCode,
    metricKey: key,
    value,
    unit,
    period: '2023',
    provenance: 'est' as const,
  }));
}

const MOCK_METRICS: GvcMetric[] = [
  ...MACH_PRODUCTS.flatMap((p) => makeMetrics(p.gvcCode)),
  ...SEMI_PRODUCTS.flatMap((p) => makeMetrics(p.gvcCode)),
];

const PRODUCTS_BY_DOMAIN: Record<GvcDomain, GvcProduct[]> = {
  mach: MACH_PRODUCTS,
  semi: SEMI_PRODUCTS,
};

const NETWORK_BY_DOMAIN: Record<GvcDomain, GvcNetworkEdge[]> = {
  mach: MACH_NETWORK,
  semi: SEMI_NETWORK,
};

class MockGvcRepository implements GvcRepository {
  listDomains(): GvcDomain[] {
    return ['mach', 'semi'];
  }
  listProducts(domain: GvcDomain): GvcProduct[] {
    return PRODUCTS_BY_DOMAIN[domain] ?? [];
  }
  getNetwork(domain: GvcDomain): GvcNetworkEdge[] {
    return NETWORK_BY_DOMAIN[domain] ?? [];
  }
  listMetrics(gvcCode: string): GvcMetric[] {
    return MOCK_METRICS.filter((m) => m.gvcCode === gvcCode);
  }
  listMetricsByDomain(domain: GvcDomain, metricKey: GvcMetricKey): GvcMetric[] {
    const codes = new Set(PRODUCTS_BY_DOMAIN[domain].map((p) => p.gvcCode));
    return MOCK_METRICS.filter((m) => codes.has(m.gvcCode) && m.metricKey === metricKey);
  }
}

export const gvcRepository: GvcRepository = new MockGvcRepository();
