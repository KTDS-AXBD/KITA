import { describe, it, expect } from 'vitest';
import { gvcRepository } from '../GvcRepository';
import {
  adaptGvcGraph,
  adaptGvcLayout,
  adaptGvcKpis,
  anchorCode,
  tierSummary,
  DOMAIN_LABEL,
} from '../adapters/gvcS6Adapter';

describe('adaptGvcGraph', () => {
  it('mach — 4노드 4엣지', () => {
    const products = gvcRepository.listProducts('mach');
    const edges = gvcRepository.getNetwork('mach');
    const graph = adaptGvcGraph(products, edges);
    expect(graph.nodes).toHaveLength(4);
    expect(graph.edges).toHaveLength(4);
  });

  it('semi — 4노드 3엣지', () => {
    const products = gvcRepository.listProducts('semi');
    const edges = gvcRepository.getNetwork('semi');
    const graph = adaptGvcGraph(products, edges);
    expect(graph.nodes).toHaveLength(4);
    expect(graph.edges).toHaveLength(3);
  });

  it('장비 tier 노드는 type="rnd"', () => {
    const products = gvcRepository.listProducts('mach');
    const graph = adaptGvcGraph(products, gvcRepository.getNetwork('mach'));
    const machineNode = graph.nodes.find((n) => n.label === '머시닝센터');
    expect(machineNode?.type).toBe('rnd');
  });

  it('부품 tier 노드는 type="metric"', () => {
    const products = gvcRepository.listProducts('mach');
    const graph = adaptGvcGraph(products, gvcRepository.getNetwork('mach'));
    const partNode = graph.nodes.find((n) => n.label === '볼베어링');
    expect(partNode?.type).toBe('metric');
  });

  it('소재 tier 노드는 type="hscode"', () => {
    const products = gvcRepository.listProducts('mach');
    const graph = adaptGvcGraph(products, gvcRepository.getNetwork('mach'));
    const matNode = graph.nodes.find((n) => n.label === '특수강');
    expect(matNode?.type).toBe('hscode');
  });

  it('엣지는 [gvcFrom, gvcTo] 형식', () => {
    const products = gvcRepository.listProducts('mach');
    const edges = gvcRepository.getNetwork('mach');
    const graph = adaptGvcGraph(products, edges);
    expect(graph.edges[0]).toHaveLength(2);
  });
});

describe('adaptGvcLayout', () => {
  it('mach — PositionedGraph 반환, 노드 4개 x/y 보유', () => {
    const products = gvcRepository.listProducts('mach');
    const edges = gvcRepository.getNetwork('mach');
    const graph = adaptGvcGraph(products, edges);
    const positioned = adaptGvcLayout(graph);
    expect(positioned.nodes).toHaveLength(4);
    expect(typeof positioned.nodes[0]?.x).toBe('number');
    expect(typeof positioned.nodes[0]?.y).toBe('number');
  });
});

describe('adaptGvcKpis', () => {
  it('mach 앵커 기준 4개 KPI 반환', () => {
    const products = gvcRepository.listProducts('mach');
    const anchor = anchorCode(products);
    const metrics = gvcRepository.listMetrics(anchor);
    const kpis = adaptGvcKpis(anchor, metrics);
    expect(kpis).toHaveLength(4);
  });

  it('KPI label 포함', () => {
    const products = gvcRepository.listProducts('mach');
    const anchor = anchorCode(products);
    const kpis = adaptGvcKpis(anchor, gvcRepository.listMetrics(anchor));
    const labels = kpis.map((k) => k.label);
    expect(labels).toContain('매출 성장률');
    expect(labels).toContain('R&D 성장');
  });

  it('deltaDir은 up|down', () => {
    const products = gvcRepository.listProducts('mach');
    const anchor = anchorCode(products);
    const kpis = adaptGvcKpis(anchor, gvcRepository.listMetrics(anchor));
    for (const k of kpis) {
      expect(['up', 'down']).toContain(k.deltaDir);
    }
  });
});

describe('anchorCode', () => {
  it('mach — 장비tier 제품(머시닝센터) gvcCode 반환', () => {
    const products = gvcRepository.listProducts('mach');
    const code = anchorCode(products);
    expect(code).toBe('GVC-MACH-MC001');
  });

  it('semi — 장비tier 없으면 첫 번째 반환', () => {
    const products = gvcRepository.listProducts('semi');
    // semi에는 장비 tier 없음 → 첫 번째 제품
    const code = anchorCode(products);
    expect(typeof code).toBe('string');
    expect(code.startsWith('GVC-SEMI-')).toBe(true);
  });
});

describe('tierSummary', () => {
  it('mach — 소재1 부품2 장비1', () => {
    const products = gvcRepository.listProducts('mach');
    const summary = tierSummary(products);
    expect(summary['소재']).toHaveLength(1);
    expect(summary['부품']).toHaveLength(2);
    expect(summary['장비']).toHaveLength(1);
  });
});

describe('DOMAIN_LABEL', () => {
  it('mach/semi 레이블 존재', () => {
    expect(typeof DOMAIN_LABEL['mach']).toBe('string');
    expect(typeof DOMAIN_LABEL['semi']).toBe('string');
  });
});
