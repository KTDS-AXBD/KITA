import type { GvcDomain } from '@/types';
import { gvcRepository } from '@/data/repository';
import { ANCHOR_CODE } from './chatgivc-catalog';
import type { QueryId } from './chatgivc-catalog';

export interface QueryResult {
  columns: string[];
  rows: (string | number)[][];
}

/** live 쿼리(L1~L5)를 GvcRepository에 위임하여 실행 */
export function executeQuery(id: QueryId, domain: GvcDomain): QueryResult | null {
  const code = ANCHOR_CODE[domain];

  switch (id) {
    case 'L1': {
      const rows = gvcRepository
        .listMetrics(code)
        .filter((m) => m.metricKey === 'metric_sales_growth')
        .map((m): (string | number)[] => [m.period ?? '—', m.value ?? '—', m.unit ?? '—']);
      return { columns: ['period', 'value', 'unit'], rows };
    }
    case 'L2': {
      const rows = gvcRepository
        .listMetrics(code)
        .filter((m) => m.metricKey === 'metric_capital_efficiency')
        .map((m): (string | number)[] => [m.period ?? '—', m.value ?? '—', m.unit ?? '—']);
      return { columns: ['period', 'value', 'unit'], rows };
    }
    case 'L3': {
      const rows = gvcRepository
        .listMetrics(code)
        .filter((m) => m.metricKey === 'metric_employment_change')
        .map((m): (string | number)[] => [m.period ?? '—', m.value ?? '—', m.unit ?? '—']);
      return { columns: ['period', 'value', 'unit'], rows };
    }
    case 'L4': {
      const rows = gvcRepository
        .getNetwork(domain)
        .filter((e) => e.gvcFrom === code || e.gvcTo === code)
        .map((e): (string | number)[] => [e.gvcFrom, e.gvcTo, e.tierLabel ?? '—']);
      return { columns: ['gvc_from', 'gvc_to', 'tier_label'], rows };
    }
    case 'L5': {
      const avg = (domain: GvcDomain) => {
        const ms = gvcRepository.listMetricsByDomain(domain, 'metric_sales_growth');
        return ms.length ? ms.reduce((s, m) => s + (m.value ?? 0), 0) / ms.length : 0;
      };
      return {
        columns: ['domain', 'avg_sales_growth'],
        rows: [
          ['기계 (GVC-MACH)', `${avg('mach').toFixed(1)}%`],
          ['반도체 (GVC-SEMI)', `${avg('semi').toFixed(1)}%`],
        ],
      };
    }
    default:
      return null;
  }
}
