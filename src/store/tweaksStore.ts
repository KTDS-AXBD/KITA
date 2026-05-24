import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TweaksValues } from '@/types';

const DEFAULTS: TweaksValues = {
  flavor: 'classic',
  theme: 'light',
  hintsPosition: 'right',
  top5Layout: 'table',
  langMode: 'ko',
};

interface TweaksState extends TweaksValues {
  panelOpen: boolean;
  set: <K extends keyof TweaksValues>(k: K, v: TweaksValues[K]) => void;
  togglePanel: () => void;
  reset: () => void;
}

export const useTweaksStore = create<TweaksState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      panelOpen: false,
      set: (k, v) => set({ [k]: v } as Partial<TweaksState>),
      togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'kita-tweaks',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        flavor: s.flavor,
        theme: s.theme,
        hintsPosition: s.hintsPosition,
        top5Layout: s.top5Layout,
        langMode: s.langMode,
      }),
    },
  ),
);
