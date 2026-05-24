import type { Domain, Preset } from '@/types';

export const DOMAINS: Domain[] = [
  { id: 'semi-mat', label: '반도체 소재', sub: 'C26211 (포토레지스트·세정액·CMP 슬러리 등)' },
  { id: 'auto-parts', label: '자동차 부품', sub: 'C30 (배터리·전장·서스펜션 등)' },
  { id: 'machine-metal', label: '기계금속', sub: 'C28·C25' },
  { id: 'fine-chem', label: '정밀화학', sub: 'C20299' },
  { id: 'display', label: '디스플레이 소재', sub: 'C2725·OLED 발광소재' },
  { id: 'battery', label: '이차전지 소재', sub: 'C28202 (양극재·음극재·전해질)' },
];

export const PRESETS: Preset[] = [
  {
    id: 'p1',
    label: '사례 1',
    title: 'EUV 포토레지스트 국산화',
    domain: 'semi-mat',
    budget: 5,
    period: 12,
    weights: { rnd: 0.4, sales: 0.2, patent: 0.3, risk: 0.1 },
  },
  {
    id: 'p2',
    label: '사례 2',
    title: '전고체 배터리 핵심소재',
    domain: 'battery',
    budget: 8,
    period: 18,
    weights: { rnd: 0.35, sales: 0.15, patent: 0.35, risk: 0.15 },
  },
  {
    id: 'p3',
    label: '사례 3',
    title: '차세대 OLED 청색 도펀트',
    domain: 'display',
    budget: 4,
    period: 12,
    weights: { rnd: 0.3, sales: 0.3, patent: 0.25, risk: 0.15 },
  },
];
