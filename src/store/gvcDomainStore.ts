import { create } from 'zustand';
import type { GvcDomain } from '@/types';

interface GvcDomainState {
  activeDomain: GvcDomain;
  setDomain: (d: GvcDomain) => void;
}

export const useGvcDomainStore = create<GvcDomainState>((set) => ({
  activeDomain: 'mach',
  setDomain: (d) => set({ activeDomain: d }),
}));
