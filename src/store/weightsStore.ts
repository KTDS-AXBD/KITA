import { create } from 'zustand';
import type { Weights, Preset } from '@/types';

export interface WeightsState {
  domain: string;
  budget: number;
  period: number;
  weights: Weights;

  setDomain: (d: string) => void;
  setBudget: (n: number) => void;
  setPeriod: (n: number) => void;
  setWeight: (k: keyof Weights, v: number) => void;
  applyPreset: (p: Preset) => void;
}

const DEFAULTS: Pick<WeightsState, 'domain' | 'budget' | 'period' | 'weights'> = {
  domain: 'semi-mat',
  budget: 5,
  period: 12,
  weights: { rnd: 0.4, sales: 0.2, patent: 0.3, risk: 0.1 },
};

export const useWeightsStore = create<WeightsState>((set) => ({
  ...DEFAULTS,
  setDomain: (d) => set({ domain: d }),
  setBudget: (n) => set({ budget: n }),
  setPeriod: (n) => set({ period: n }),
  setWeight: (k, v) =>
    set((s) => ({ weights: { ...s.weights, [k]: v } })),
  applyPreset: (p) =>
    set({ domain: p.domain, budget: p.budget, period: p.period, weights: p.weights }),
}));
