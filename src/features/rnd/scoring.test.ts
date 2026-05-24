import { describe, it, expect } from 'vitest';
import { rankCandidates, resolveBoosts } from './scoring';
import { S4_CANDIDATE_POOL } from '@/data/mock';
import type { Weights } from '@/types';

const DEFAULT_WEIGHTS: Weights = { rnd: 0.4, sales: 0.2, patent: 0.3, risk: 0.1 };

describe('resolveBoosts', () => {
  it('base (hint OFF) — matchBoost=0.85, matchAccuracy=0.65, no signs', () => {
    const b = resolveBoosts({});
    expect(b.matchBoost).toBe(0.85);
    expect(b.matchAccuracy).toBe(0.65);
    expect(b.patentSign).toBe(1.0);
    expect(b.riskSign).toBe(1.0);
    expect(b.signalAdd).toBe(0);
  });

  it('h_rndcall ON — matchBoost=1.0, matchAccuracy=0.88', () => {
    const b = resolveBoosts({ h_rndcall: true });
    expect(b.matchBoost).toBe(1.0);
    expect(b.matchAccuracy).toBe(0.88);
  });

  it('h_patent / h_finance / h_movement on independently', () => {
    expect(resolveBoosts({ h_patent: true }).patentSign).toBeCloseTo(1.1);
    expect(resolveBoosts({ h_finance: true }).riskSign).toBeCloseTo(1.05);
    expect(resolveBoosts({ h_movement: true }).signalAdd).toBeCloseTo(0.03);
  });
});

describe('rankCandidates (default weights, hints OFF)', () => {
  it('produces 8 ranked entries', () => {
    const { ranked } = rankCandidates(S4_CANDIDATE_POOL, DEFAULT_WEIGHTS, {});
    expect(ranked).toHaveLength(8);
  });

  it('orders by descending score', () => {
    const { ranked } = rankCandidates(S4_CANDIDATE_POOL, DEFAULT_WEIGHTS, {});
    for (let i = 1; i < ranked.length; i++) {
      const prev = ranked[i - 1];
      const cur = ranked[i];
      if (!prev || !cur) throw new Error('expected entries');
      expect(prev.score).toBeGreaterThanOrEqual(cur.score);
    }
  });

  it('top 1 is one of the strong R&D investors (C001/C003/C005)', () => {
    const { ranked } = rankCandidates(S4_CANDIDATE_POOL, DEFAULT_WEIGHTS, {});
    expect(['C001', 'C003', 'C005']).toContain(ranked[0]?.id);
  });

  it('hint OFF → all scores clamped to [0,1]', () => {
    const { ranked } = rankCandidates(S4_CANDIDATE_POOL, DEFAULT_WEIGHTS, {});
    for (const c of ranked) {
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(1);
    }
  });

  it('h_rndcall ON → top1 score increases vs OFF (matchBoost 0.85 → 1.0)', () => {
    const off = rankCandidates(S4_CANDIDATE_POOL, DEFAULT_WEIGHTS, {});
    const on = rankCandidates(S4_CANDIDATE_POOL, DEFAULT_WEIGHTS, { h_rndcall: true });
    const offTop = off.ranked[0]?.score ?? 0;
    const onTop = on.ranked[0]?.score ?? 0;
    expect(onTop).toBeGreaterThan(offTop);
  });

  it('Σ=0 방어 — 모든 가중치 0이어도 NaN/Infinity 없음', () => {
    const zero: Weights = { rnd: 0, sales: 0, patent: 0, risk: 0 };
    const { ranked } = rankCandidates(S4_CANDIDATE_POOL, zero, {});
    for (const c of ranked) {
      expect(Number.isFinite(c.score)).toBe(true);
    }
  });
});
