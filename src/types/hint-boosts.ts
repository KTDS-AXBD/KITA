/**
 * F006 — boost 계수 외부화 스키마.
 * config/hint-boosts.json의 모양을 타입으로 고정.
 */
export interface HintBoostsConfig {
  h_rndcall: { matchBoost: number; matchAccuracy: number };
  base: { matchBoost: number; matchAccuracy: number };
  h_patent: { patentSign: number };
  h_finance: { riskSign: number };
  h_movement: { signalAdd: number };
}
