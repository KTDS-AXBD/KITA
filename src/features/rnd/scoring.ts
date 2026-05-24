import type {
  Candidate,
  ScoredCandidate,
  Weights,
  ActiveHints,
  HintBoostsConfig,
} from '@/types';
import boostsConfig from '../../../config/hint-boosts.json';

const CFG = boostsConfig as HintBoostsConfig;

export interface ResolvedBoosts {
  patentSign: number;
  riskSign: number;
  matchBoost: number;
  signalAdd: number;
  matchAccuracy: number;
}

/**
 * F006 — Hint 활성화 상태로부터 boost 계수를 해석한다 (config 단일 진입점).
 * 합성은 `composeScore`가 담당. 이 함수는 lookup만.
 */
export function resolveBoosts(active: ActiveHints): ResolvedBoosts {
  const matchSrc = active.h_rndcall ? CFG.h_rndcall : CFG.base;
  return {
    patentSign: active.h_patent ? CFG.h_patent.patentSign : 1.0,
    riskSign: active.h_finance ? CFG.h_finance.riskSign : 1.0,
    matchBoost: matchSrc.matchBoost,
    signalAdd: active.h_movement ? CFG.h_movement.signalAdd : 0,
    matchAccuracy: matchSrc.matchAccuracy,
  };
}

/**
 * TODO(도메인 결정): boost 합성 방식.
 * 현 프로토타입 공식 (page_rnd.jsx L37~62):
 *   raw   = Σ(wᵢ·metricNᵢ) / max(wSum, 0.0001)
 *   score = min(1, raw * matchBoost + signalAdd)
 *   patent/risk는 normalize 단계에서 *Sign이 곱해짐 (composeScore 내부)
 *
 * Sprint 1은 동작 100% 보존이므로 프로토타입 공식을 그대로 이송한다.
 * 추후 (S2+) 합성 방식 변경 검토 — h_rndcall 영향 강도, signalAdd 비중 등.
 */
export function composeScore(
  c: Candidate,
  norms: { maxRnd: number; maxSales: number; maxPatent: number; maxRisk: number },
  weights: Weights,
  wSum: number,
  boosts: ResolvedBoosts,
): ScoredCandidate {
  const rndN = c.rndGrowth / norms.maxRnd;
  const salesN = c.salesGrowth / norms.maxSales;
  const patentN = (c.patentCount / norms.maxPatent) * boosts.patentSign;
  const riskN = (1 - c.defaultRisk / norms.maxRisk) * boosts.riskSign;
  const denom = Math.max(wSum, 0.0001);
  const raw =
    (weights.rnd * rndN + weights.sales * salesN + weights.patent * patentN + weights.risk * riskN) /
    denom;
  const score = Math.min(1, raw * boosts.matchBoost + boosts.signalAdd);
  return { ...c, _components: { rndGrowth: rndN, salesGrowth: salesN, patentCount: patentN, defaultRisk: riskN }, score };
}

export function rankCandidates(
  candidates: Candidate[],
  weights: Weights,
  active: ActiveHints,
): { ranked: ScoredCandidate[]; boosts: ResolvedBoosts } {
  if (candidates.length === 0) return { ranked: [], boosts: resolveBoosts(active) };
  const norms = {
    maxRnd: Math.max(...candidates.map((c) => c.rndGrowth)),
    maxSales: Math.max(...candidates.map((c) => c.salesGrowth)),
    maxPatent: Math.max(...candidates.map((c) => c.patentCount)),
    maxRisk: Math.max(...candidates.map((c) => c.defaultRisk)),
  };
  const wSum = weights.rnd + weights.sales + weights.patent + weights.risk;
  const boosts = resolveBoosts(active);
  const scored = candidates.map((c) => composeScore(c, norms, weights, wSum, boosts));
  scored.sort((a, b) => b.score - a.score);
  return { ranked: scored, boosts };
}
