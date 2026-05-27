// F035 시나리오 분석 페이지용 Mock 스텁 (Sprint 20에서 확장)
import type { CytoSource } from '@/types';

export interface ScenarioResult {
  rank: number;
  item: string;
  impact: string;
  path: string[];
  source: CytoSource;
}

export const SOBUJIANG_TOP5: ScenarioResult[] = [
  { rank: 1, item: '정밀감속기 국산화', impact: '공급망 의존도 85%→50% 감소 · 로봇 산업 연쇄 효과', path: ['s_rnd', 's_reducer', 's_co_daehan'], source: 'est' },
  { rank: 2, item: '서보모터 자립화', impact: '로봇·공작기계 동시 영향 · R&D 30% 최고', path: ['s_rnd', 's_servo', 's_co_hanil'], source: 'est' },
  { rank: 3, item: '정밀베어링 확대', impact: '공작기계·반도체장비 이중 수혜 품목', path: ['s_rnd', 's_bearing', 's_co_seowon'], source: 'est' },
  { rank: 4, item: '볼스크류 대체', impact: '일본 의존도 75% → 40% 목표 · 대만 대안 존재', path: ['s_rnd', 's_ballscrew'], source: 'est' },
  { rank: 5, item: 'CNC 제어기 개발', impact: '스마트 공장 확산 핵심 · FANUC 의존 해소', path: ['s_rnd', 's_cnc', 's_co_hwacheon'], source: 'est' },
];
