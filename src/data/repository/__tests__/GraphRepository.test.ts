import { describe, it, expect } from 'vitest';
import { graphRepository } from '../GraphRepository';

describe('GraphRepository', () => {
  it('소부장 그래프 30노드 이상', async () => {
    const g = await graphRepository.getGraph('sobujiang');
    expect(g.domain).toBe('sobujiang');
    expect(g.nodes.length).toBeGreaterThanOrEqual(30);
  });

  it('호르무즈 그래프 40노드 이상', async () => {
    const g = await graphRepository.getGraph('hormuz');
    expect(g.domain).toBe('hormuz');
    expect(g.nodes.length).toBeGreaterThanOrEqual(40);
  });

  it('소부장 모든 노드에 source 필드 존재', async () => {
    const { nodes } = await graphRepository.getGraph('sobujiang');
    const missing = nodes.filter((n) => !n.source);
    expect(missing).toHaveLength(0);
  });

  it('호르무즈 모든 노드에 source 필드 존재', async () => {
    const { nodes } = await graphRepository.getGraph('hormuz');
    const missing = nodes.filter((n) => !n.source);
    expect(missing).toHaveLength(0);
  });

  it('엣지 source/target이 노드 id 내에 존재', async () => {
    for (const domain of ['sobujiang', 'hormuz'] as const) {
      const { nodes, edges } = await graphRepository.getGraph(domain);
      const ids = new Set(nodes.map((n) => n.id));
      for (const e of edges) {
        expect(ids.has(e.source), `edge ${e.id}: source '${e.source}' missing`).toBe(true);
        expect(ids.has(e.target), `edge ${e.id}: target '${e.target}' missing`).toBe(true);
      }
    }
  });
});
