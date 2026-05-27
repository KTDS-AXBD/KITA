import type { ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

/** 버전 메타데이터 — 선택기 카드·data-version 활성화·라우팅의 단일 소스. */
export interface VersionMeta {
  /** documentElement[data-version] 값 = 디자인 테마 스코프 키. 예: 'v0.1' */
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  features: string[];
  /** 브랜드 강조색 (선택기 카드 상단 보더 등) */
  accent: string;
  mode: ThemeMode;
  /** 진입 홈 라우트. 예: '/v1' | '/platform/data' */
  home: string;
  /** CTA 라벨 (선택기) */
  cta?: string;
  /** 최신 버전 여부 — 루트(/)가 자동 표시 + 선택기에 "최신" 표시 */
  latest?: boolean;
}

/** 버전 모듈 — 메타 + 라우트 소유 판정 + 셸로 감싼 렌더. */
export interface VersionModule {
  meta: VersionMeta;
  /** 주어진 route가 이 버전 소유인지 */
  ownsRoute: (route: string) => boolean;
  /** 해당 route 화면을 이 버전의 셸로 감싸 렌더 */
  render: (route: string) => ReactNode;
}
