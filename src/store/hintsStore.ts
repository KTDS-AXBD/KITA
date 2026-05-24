import { create } from 'zustand';
import type { ActiveHints, HintId } from '@/types';

export interface HintsState {
  s4: ActiveHints;
  s6: Record<string, boolean>;
  toggleS4: (id: HintId) => void;
  toggleS6: (id: string) => void;
}

export const useHintsStore = create<HintsState>((set) => ({
  s4: {},
  s6: {},
  toggleS4: (id) =>
    set((s) => ({ s4: { ...s.s4, [id]: !s.s4[id] } })),
  toggleS6: (id) =>
    set((s) => ({ s6: { ...s.s6, [id]: !s.s6[id] } })),
}));
