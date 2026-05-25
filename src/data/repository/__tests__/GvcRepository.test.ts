import { describe, it, expect } from 'vitest';
import { gvcRepository } from '../GvcRepository';

describe('GvcRepository (Mock)', () => {
  it('listDomains — mach/semi 2개', () => {
    expect(gvcRepository.listDomains()).toEqual(['mach', 'semi']);
  });

  it('listProducts(mach) — 4건, gvc_code 포맷 GVC-MACH-', () => {
    const ps = gvcRepository.listProducts('mach');
    expect(ps).toHaveLength(4);
    expect(ps.every(p => p.gvcCode.startsWith('GVC-MACH-'))).toBe(true);
    expect(ps.every(p => p.provenance === 'virt')).toBe(true);
  });

  it('listProducts(semi) — 4건, GVC-SEMI-', () => {
    const ps = gvcRepository.listProducts('semi');
    expect(ps).toHaveLength(4);
    expect(ps.every(p => p.gvcCode.startsWith('GVC-SEMI-'))).toBe(true);
  });

  it('getNetwork(mach) — 4엣지, 방향 소재→부품→장비', () => {
    const edges = gvcRepository.getNetwork('mach');
    expect(edges).toHaveLength(4);
    // SS001(소재)→GB001(부품), SS001→GR001(부품), GB001→MC001(장비), GR001→MC001
    expect(edges.some(e => e.gvcFrom === 'GVC-MACH-SS001' && e.gvcTo === 'GVC-MACH-GB001')).toBe(true);
    expect(edges.some(e => e.gvcTo === 'GVC-MACH-MC001')).toBe(true);
  });

  it('getNetwork(semi) — 3엣지', () => {
    expect(gvcRepository.getNetwork('semi')).toHaveLength(3);
  });

  it('listMetrics — 6개 metric_key 반환', () => {
    const metrics = gvcRepository.listMetrics('GVC-MACH-MC001');
    expect(metrics).toHaveLength(6);
    const keys = metrics.map(m => m.metricKey);
    expect(keys).toContain('metric_sales_growth');
    expect(keys).toContain('metric_capital_efficiency');
    expect(keys).toContain('metric_rnd_growth');
  });

  it('listMetricsByDomain(mach, metric_sales_growth) — 4건 (mach 4 products)', () => {
    const ms = gvcRepository.listMetricsByDomain('mach', 'metric_sales_growth');
    expect(ms).toHaveLength(4);
    expect(ms.every(m => m.metricKey === 'metric_sales_growth')).toBe(true);
  });

  it('provenance — products=virt, metrics=est', () => {
    const p = gvcRepository.listProducts('mach').at(0);
    expect(p?.provenance).toBe('virt');
    const m = gvcRepository.listMetrics(p?.gvcCode ?? '').at(0);
    expect(m?.provenance).toBe('est');
  });
});
