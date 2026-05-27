import { v01 } from './v0_1';
import { v02 } from './v0_2';
import type { VersionModule } from './types';

/**
 * 버전 레지스트리 — 단일 진실 소스(SSOT).
 *
 * 새 버전 추가 절차 (예: v0.3):
 *   1. src/versions/v0_3/ 디렉터리 생성 (features + theme.css `[data-version="v0.3"]`)
 *   2. src/versions/v0_3/index.tsx 에서 VersionModule 구현 (meta + ownsRoute + render)
 *   3. src/main.tsx 에 theme.css import 1줄
 *   4. 아래 배열에 모듈 1줄 추가 (+ 최신이면 meta.latest = true, 기존 latest 해제)
 *   → 라우터 · 선택기 · data-version 활성화 · "최신 자동 표시" 전부 자동 반영.
 *
 * 배열 순서 = 선택기 표시 순서.
 */
export const VERSIONS: VersionModule[] = [v01, v02];

/** "최신" 버전 (meta.latest, 없으면 마지막). 루트(/)가 이 버전을 자동 표시. */
export function getLatestVersion(): VersionModule {
  const flagged = VERSIONS.find((v) => v.meta.latest);
  if (flagged) return flagged;
  const last = VERSIONS[VERSIONS.length - 1];
  if (!last) throw new Error('VERSIONS registry is empty');
  return last;
}

/** route를 소유한 버전 (없으면 undefined). */
export function findVersionByRoute(route: string): VersionModule | undefined {
  return VERSIONS.find((v) => v.ownsRoute(route));
}
