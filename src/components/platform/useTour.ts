import { useCallback, useEffect, useState } from 'react';

/**
 * F052: 페이지별 SpotlightTour 자동 시작 + 헤더 도움말 버튼 재시작 훅.
 *
 * 동작:
 * - 마운트 시 localStorage 'koami:tour:{pageKey}:seen'을 확인 -> 없으면 200ms 후 자동 open
 * - 'koami:tour:restart' window 이벤트 listener -> 강제 open (이미 본 페이지 포함)
 * - onClose 시 localStorage seen=true 마킹 (자동 재진입 0)
 *
 * 사용:
 *   const { open, onClose } = useTour('data');
 *   <SpotlightTour steps={dataTourSteps} open={open} onClose={onClose} />
 *
 * 헤더 ❓ 버튼:
 *   window.dispatchEvent(new CustomEvent('koami:tour:restart', { detail: { pageKey: 'data' } }))
 */
const STORAGE_PREFIX = 'koami:tour:';
const STORAGE_SUFFIX = ':seen';
const RESTART_EVENT = 'koami:tour:restart';

function storageKey(pageKey: string): string {
  return `${STORAGE_PREFIX}${pageKey}${STORAGE_SUFFIX}`;
}

function hasSeen(pageKey: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(storageKey(pageKey)) === '1';
  } catch {
    return true; // localStorage 비활성 환경(예: incognito + 차단)에선 자동 안 띄움
  }
}

function markSeen(pageKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(pageKey), '1');
  } catch {
    /* noop */
  }
}

export function useTour(pageKey: string): { open: boolean; onClose: () => void; restart: () => void } {
  const [open, setOpen] = useState(false);

  // 마운트 시 1회 자동 시작 판정
  // delay 500ms = SPA 라우팅 직후 DOM 안정 대기 (200ms는 race condition 가능, 결함 5)
  useEffect(() => {
    if (hasSeen(pageKey)) return;
    const timer = window.setTimeout(() => setOpen(true), 500);
    return () => window.clearTimeout(timer);
  }, [pageKey]);

  // 'koami:tour:restart' 이벤트 listener (헤더 ❓ 버튼)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ pageKey?: string }>).detail;
      // pageKey 없거나 일치하면 open
      if (!detail?.pageKey || detail.pageKey === pageKey) {
        setOpen(true);
      }
    };
    window.addEventListener(RESTART_EVENT, handler);
    return () => window.removeEventListener(RESTART_EVENT, handler);
  }, [pageKey]);

  const onClose = useCallback(() => {
    setOpen(false);
    markSeen(pageKey);
  }, [pageKey]);

  const restart = useCallback(() => {
    setOpen(true);
  }, []);

  return { open, onClose, restart };
}

/** 헤더 도움말 버튼이 호출 - 현재 페이지 투어 강제 재시작 */
export function dispatchTourRestart(pageKey?: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(RESTART_EVENT, { detail: { pageKey } }));
}

/** 테스트/디버깅: 모든 페이지 seen 마킹 초기화 */
export function resetAllTourSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX) && k.endsWith(STORAGE_SUFFIX)) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* noop */
  }
}
