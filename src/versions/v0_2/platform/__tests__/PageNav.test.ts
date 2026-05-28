import { describe, it, expect } from 'vitest';
import { PAGE_ORDER } from '../pageOrder';

describe('PageNav PAGE_ORDER', () => {
  it('7페이지 정확히', () => {
    expect(PAGE_ORDER).toHaveLength(7);
  });

  it('시연 흐름 순서: data → cq → ontology → graph → scenario → compare → plan', () => {
    expect(PAGE_ORDER.map((p) => p.path)).toEqual([
      '/platform/data',
      '/platform/cq',
      '/platform/ontology',
      '/platform/graph',
      '/platform/scenario',
      '/platform/compare',
      '/platform/plan',
    ]);
  });

  it('모든 경로가 /platform/ 으로 시작', () => {
    PAGE_ORDER.forEach((p) => expect(p.path.startsWith('/platform/')).toBe(true));
  });

  it('한국어 라벨 부착', () => {
    PAGE_ORDER.forEach((p) => expect(p.label.length).toBeGreaterThan(0));
  });
});
