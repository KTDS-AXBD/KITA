import { describe, it, expect } from 'vitest';
import {
  CQ2_TOP5_COMPANIES,
  CQ1_TOP5_ITEMS,
  CQ2_STEPS,
  CQ1_STEPS,
  DEPENDENCY_ITEMS,
  RND_CASES,
  MINI_IMPACT_NODES,
  MINI_IMPACT_EDGES,
} from '@/data/mock/scenarioResults';

describe('scenarioResults mock data', () => {
  it('CQ-002 기업 후보 5건', () => {
    expect(CQ2_TOP5_COMPANIES).toHaveLength(5);
  });

  it('CQ-002 모든 기업 score 필드 존재', () => {
    CQ2_TOP5_COMPANIES.forEach(co => {
      expect(co.score).toBeGreaterThan(0);
    });
  });

  it('CQ-001 영향 품목 5건', () => {
    expect(CQ1_TOP5_ITEMS).toHaveLength(5);
  });

  it('CQ-001 모든 품목 path 필드 존재', () => {
    CQ1_TOP5_ITEMS.forEach(item => {
      expect(item.path.length).toBeGreaterThan(0);
    });
  });

  it('추론 단계 각 5건', () => {
    expect(CQ2_STEPS).toHaveLength(5);
    expect(CQ1_STEPS).toHaveLength(5);
  });

  it('의존 구조 5개 품목', () => {
    expect(DEPENDENCY_ITEMS).toHaveLength(5);
  });

  it('R&D 사례 3건', () => {
    expect(RND_CASES).toHaveLength(3);
  });

  it('미니 그래프 노드·엣지 존재', () => {
    expect(MINI_IMPACT_NODES.length).toBeGreaterThan(10);
    expect(MINI_IMPACT_EDGES.length).toBeGreaterThan(5);
  });
});
