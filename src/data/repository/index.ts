export { rndRepository } from './RndRepository';
export type { RndRepository } from './RndRepository';
export type { TolueneRepository } from './TolueneRepository';

import type { TolueneRepository } from './TolueneRepository';
import { tolueneRepository as mockToluene, snapshotTolueneRepository } from './TolueneRepository';

// F015 — 데이터소스 토글. 기본 Mock(데모 안전), VITE_DATA_SOURCE=real 시 실데이터 스냅샷.
//   화면 코드(features/)는 이 `tolueneRepository`만 소비 → Repository 교체만으로 Mock↔실 전환.
const useReal = import.meta.env?.VITE_DATA_SOURCE === 'real';
export const tolueneRepository: TolueneRepository = useReal ? snapshotTolueneRepository : mockToluene;
