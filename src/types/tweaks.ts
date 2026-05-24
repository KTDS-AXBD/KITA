export type Flavor = 'classic' | 'foundry';
export type Theme = 'light' | 'dark';
export type HintsPosition = 'right' | 'bottom' | 'modal';
export type Top5Layout = 'table' | 'card';
export type LangMode = 'ko' | 'en';

export interface TweaksValues {
  flavor: Flavor;
  theme: Theme;
  hintsPosition: HintsPosition;
  top5Layout: Top5Layout;
  langMode: LangMode;
}
