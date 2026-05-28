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
  COMPARE_TOP3_FROM_CQ2,
} from '@/data/mock/scenarioResults';
import { CQ_ITEMS as CQ_SSOT } from '@/versions/v0_2/platform/cq/cqData';

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

describe('F041 v0.2 정합성 폴리시', () => {
  it('CQ2 기업 후보 4종 source 필드 존재', () => {
    CQ2_TOP5_COMPANIES.forEach((co) => {
      expect(co.source).toBeDefined();
      expect(['real', 'est', 'paid']).toContain(co.source);
      expect(co.sourceLabel.length).toBeGreaterThan(0);
    });
  });

  it('CQ1 영향 품목 source 필드 존재', () => {
    CQ1_TOP5_ITEMS.forEach((item) => {
      expect(item.source).toBeDefined();
      expect(['real', 'est', 'paid']).toContain(item.source);
    });
  });

  it('DEPENDENCY_ITEMS source 필드 존재 (관세청 UNIPASS real)', () => {
    DEPENDENCY_ITEMS.forEach((item) => {
      expect(item.source).toBe('real');
      expect(item.sourceLabel).toMatch(/UNIPASS|관세청/);
    });
  });

  it('RND_CASES source 필드 존재 (NTIS real)', () => {
    RND_CASES.forEach((c) => {
      expect(c.source).toBe('real');
      expect(c.sourceLabel).toMatch(/NTIS/);
    });
  });

  it('COMPARE_TOP3_FROM_CQ2는 CQ2_TOP5_COMPANIES[0..2] 파생 (회사명·점수 자동 매핑)', () => {
    expect(COMPARE_TOP3_FROM_CQ2).toHaveLength(3);
    COMPARE_TOP3_FROM_CQ2.forEach((c, i) => {
      const src = CQ2_TOP5_COMPANIES[i]!;
      expect(c.name).toBe(src.name);
      // score 0.69 -> pct 69.0 (×100 정규화)
      expect(c.pct).toBeCloseTo(src.score * 100, 1);
    });
  });

  it('COMPARE_TOP3에 "에스피지" 없음 (이전 호르무즈 잔향 제거)', () => {
    const names = COMPARE_TOP3_FROM_CQ2.map((c) => c.name);
    expect(names).not.toContain('에스피지');
    // ComparePage가 SSOT 1위 = 대한정밀감속기 표시하는 게 정상
    expect(names[0]).toBe('대한정밀감속기');
  });

  it('COMPARE_TOP3 점수가 호르무즈 잔향(94.2/87.6/72.3)이 아님', () => {
    const pcts = COMPARE_TOP3_FROM_CQ2.map((c) => c.pct);
    // CQ1 호르무즈 잔향 점수와 일치하면 SSOT 드리프트 재발
    expect(pcts).not.toEqual([94.2, 87.6, 72.3]);
    // SSOT 실값 = 69 / 67 / 52 (소수점 1자리 근사)
    expect(pcts[0]).toBeCloseTo(69.0, 1);
    expect(pcts[1]).toBeCloseTo(67.0, 1);
    expect(pcts[2]).toBeCloseTo(52.0, 1);
  });

  it('ScenarioPage가 사용할 CQ-001/CQ-002가 cqData SSOT에 존재 (CQ_CONFIG 파생 가능)', () => {
    expect(CQ_SSOT.find((c) => c.id === 'CQ-001')).toBeDefined();
    expect(CQ_SSOT.find((c) => c.id === 'CQ-002')).toBeDefined();
  });

  it('cqData SSOT의 CQ-002 question에 "공작기계"가 포함 (F040 갱신 반영)', () => {
    const cq002 = CQ_SSOT.find((c) => c.id === 'CQ-002')!;
    expect(cq002.question).toMatch(/공작기계/);
  });
});
