import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

export type TourStep = {
  /** CSS selector. 예: '[data-tour-id="kpi-total"]' */
  target: string;
  title: string;
  /** 1~2문장 영업 톤 (사용자 검토 콘텐츠) */
  body: string;
  /** tooltip 위치. auto = 화면 가용 공간 자동 선택 */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
};

interface SpotlightTourProps {
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
}

/**
 * F052: v0.2 7페이지 Spotlight 투어.
 * - target 영역만 투명 + 주변 4분할 dim 오버레이
 * - tooltip 카드 (제목·본문·진행 인디케이터·이전/건너뛰기/다음/X)
 * - F046 Modal 답습: role="dialog" + focus trap + Esc 닫기 + body scroll lock
 * - reduce-motion 존중 (스포트라이트 transition duration 0)
 * - target 미존재 시 step skip (다음 step으로 자동 이동)
 */
const PADDING = 6; // spotlight 영역 padding (target 주변 여유)
const TOOLTIP_GAP = 12; // tooltip과 target 간격
const TOOLTIP_W = 320;
const FALLBACK_RECT = { top: 0, left: 0, width: 0, height: 0 };

function getRect(selector: string): { top: number; left: number; width: number; height: number } | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function pickPlacement(
  target: { top: number; left: number; width: number; height: number },
  preferred: TourStep['placement'],
): 'top' | 'bottom' | 'left' | 'right' {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceTop = target.top;
  const spaceBottom = vh - (target.top + target.height);
  const spaceLeft = target.left;
  const spaceRight = vw - (target.left + target.width);
  const minH = 180; // tooltip 최소 높이 추정
  if (preferred && preferred !== 'auto') return preferred;
  // auto: 큰 공간 우선 (bottom > top > right > left)
  if (spaceBottom >= minH) return 'bottom';
  if (spaceTop >= minH) return 'top';
  if (spaceRight >= TOOLTIP_W + TOOLTIP_GAP) return 'right';
  if (spaceLeft >= TOOLTIP_W + TOOLTIP_GAP) return 'left';
  return 'bottom'; // 마지막 fallback
}

// tooltip 추정 높이 (실측: 16+18(title) + 8+14*2(body 2줄) + 14+30(footer) ~= 160~220, 최대 240)
const TOOLTIP_H_EST = 220;

function getTooltipPos(
  target: { top: number; left: number; width: number; height: number },
  placement: 'top' | 'bottom' | 'left' | 'right',
): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // 모든 placement에 공통 적용: viewport 내 강제 clamp (top·bottom 둘 다)
  const clampLeft = (x: number) => Math.min(vw - TOOLTIP_W - 8, Math.max(8, x));
  const clampTop = (y: number) => Math.min(vh - TOOLTIP_H_EST - 8, Math.max(8, y));
  switch (placement) {
    case 'top':
      return {
        top: clampTop(target.top - TOOLTIP_GAP - TOOLTIP_H_EST),
        left: clampLeft(target.left + target.width / 2 - TOOLTIP_W / 2),
      };
    case 'bottom':
      return {
        top: clampTop(target.top + target.height + TOOLTIP_GAP),
        left: clampLeft(target.left + target.width / 2 - TOOLTIP_W / 2),
      };
    case 'left':
      return {
        top: clampTop(target.top + target.height / 2 - TOOLTIP_H_EST / 2),
        left: Math.max(8, target.left - TOOLTIP_W - TOOLTIP_GAP),
      };
    case 'right':
      return {
        top: clampTop(target.top + target.height / 2 - TOOLTIP_H_EST / 2),
        left: clampLeft(target.left + target.width + TOOLTIP_GAP),
      };
  }
}

/**
 * target element를 viewport 중앙으로 스크롤. body scroll lock 우회 (element.scrollIntoView는 영향 받음 →
 * body overflow:hidden 잠시 해제 후 scroll → 복원).
 */
function ensureTargetVisible(selector: string): void {
  const el = document.querySelector(selector);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  // 이미 viewport 내 (PADDING + TOOLTIP_H_EST 여유) 있으면 skip
  if (rect.top >= 8 && rect.bottom + TOOLTIP_H_EST <= vh) return;
  // body scroll lock 잠시 해제 → scroll → 복원 (raf 다음 tick에 복원)
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = '';
  el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' as ScrollBehavior });
  // 다음 frame에 다시 lock (사용자가 페이지 스크롤 못 함 유지)
  requestAnimationFrame(() => { document.body.style.overflow = prevOverflow || 'hidden'; });
}

export function SpotlightTour({ steps, open, onClose }: SpotlightTourProps): JSX.Element | null {
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // target 미존재 시 한 번 wait + retry → 그래도 없으면 다음 step 시도 (자동 skip)
  // race condition 방어 (결함 5): SPA 라우팅 직후 DOM 렌더 안 됐을 가능성에 대비해 200ms retry 1회
  useLayoutEffect(() => {
    if (!open) return;
    const step = steps[stepIdx];
    if (!step) return;
    // 1차 즉시 시도
    const r0 = getRect(step.target);
    if (r0) {
      ensureTargetVisible(step.target);
      // scrollIntoView 후 rect 재측정 (스크롤로 변경됐을 수 있음)
      setRect(getRect(step.target) ?? r0);
      return;
    }
    // 1차 실패 → 200ms 후 재시도 (DOM 렌더 race 방어)
    let cancelled = false;
    const retryTimer = window.setTimeout(() => {
      if (cancelled) return;
      const r1 = getRect(step.target);
      if (r1) {
        ensureTargetVisible(step.target);
        setRect(getRect(step.target) ?? r1);
        return;
      }
      // 2차도 실패 → 자동 skip 시도 (다음 step target 찾기)
      let skip = 0;
      let rNext: ReturnType<typeof getRect> = null;
      while (stepIdx + skip < steps.length - 1) {
        skip++;
        const next = steps[stepIdx + skip];
        if (!next) break;
        rNext = getRect(next.target);
        if (rNext) {
          setStepIdx(stepIdx + skip);
          return;
        }
      }
      // 마지막 step도 target 없으면 fallback dim 만 표시
      setRect(null);
    }, 200);
    return () => { cancelled = true; window.clearTimeout(retryTimer); };
  }, [open, stepIdx, steps]);

  // resize/scroll 시 rect 재계산
  useEffect(() => {
    if (!open) return;
    const step = steps[stepIdx];
    if (!step) return;
    const update = () => setRect(getRect(step.target));
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, stepIdx, steps]);

  // body scroll lock + 이전 focus 저장 + 자동 focus
  useEffect(() => {
    if (!open) {
      setStepIdx(0);
      return;
    }
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => {
      const btn = tooltipRef.current?.querySelector<HTMLElement>('[data-autofocus]');
      btn?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      const prev = previousFocusRef.current;
      if (prev && document.contains(prev)) prev.focus();
    };
  }, [open]);

  // Esc + focus trap
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setStepIdx((s) => Math.min(s + 1, steps.length - 1));
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setStepIdx((s) => Math.max(s - 1, 0));
        return;
      }
      if (e.key !== 'Tab') return;
      const root = tooltipRef.current;
      if (!root) return;
      const focusable = Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled])'));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
        return;
      }
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose, steps.length]);

  if (!open) return null;
  const step = steps[stepIdx];
  if (!step) return null;
  const total = steps.length;
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === total - 1;

  const targetRect = rect ?? FALLBACK_RECT;
  const hasTarget = !!rect && rect.width > 0;
  const placement = hasTarget ? pickPlacement(targetRect, step.placement) : 'bottom';
  const tooltipPos = hasTarget
    ? getTooltipPos(targetRect, placement)
    : { top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - TOOLTIP_W / 2 };

  const transition = reduceMotion ? 'none' : 'top 200ms ease, left 200ms ease, width 200ms ease, height 200ms ease';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1500 }} role="presentation">
      {/* 4분할 dim 오버레이 - target 영역만 투명 */}
      {hasTarget && (
        <>
          {/* top */}
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: Math.max(0, targetRect.top - PADDING), background: 'rgba(11,13,16,0.55)', transition }} />
          {/* bottom */}
          <div style={{ position: 'fixed', top: targetRect.top + targetRect.height + PADDING, left: 0, width: '100vw', height: `calc(100vh - ${targetRect.top + targetRect.height + PADDING}px)`, background: 'rgba(11,13,16,0.55)', transition }} />
          {/* left */}
          <div style={{ position: 'fixed', top: Math.max(0, targetRect.top - PADDING), left: 0, width: Math.max(0, targetRect.left - PADDING), height: targetRect.height + PADDING * 2, background: 'rgba(11,13,16,0.55)', transition }} />
          {/* right */}
          <div style={{ position: 'fixed', top: Math.max(0, targetRect.top - PADDING), left: targetRect.left + targetRect.width + PADDING, width: `calc(100vw - ${targetRect.left + targetRect.width + PADDING}px)`, height: targetRect.height + PADDING * 2, background: 'rgba(11,13,16,0.55)', transition }} />
          {/* target outline */}
          <div
            style={{
              position: 'fixed',
              top: targetRect.top - PADDING,
              left: targetRect.left - PADDING,
              width: targetRect.width + PADDING * 2,
              height: targetRect.height + PADDING * 2,
              border: '2px solid var(--op-brand, #E60012)',
              borderRadius: 'var(--op-radius, 6px)',
              pointerEvents: 'none',
              transition,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.4), 0 8px 24px rgba(0,0,0,0.3)',
            }}
          />
        </>
      )}

      {/* target 없을 때 전체 dim */}
      {!hasTarget && <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,13,16,0.55)' }} />}

      {/* tooltip 카드 */}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          position: 'fixed',
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: TOOLTIP_W,
          background: 'var(--op-bg-card, #fff)',
          borderRadius: 'var(--op-radius, 8px)',
          boxShadow: 'var(--op-shadow-lg, 0 8px 32px rgba(0,0,0,0.16))',
          border: '1px solid var(--op-border, #E2E5EA)',
          padding: '16px 18px',
          transition,
          outline: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <h3 id={titleId} style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--op-text-primary, #0B0D10)', letterSpacing: '-0.01em' }}>
            {step.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="투어 닫기"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--op-text-tertiary, #9AA0A7)', lineHeight: 1, padding: 0, marginLeft: 8 }}
          >
            &times;
          </button>
        </div>
        <p style={{ margin: '0 0 14px 0', fontSize: 13.5, lineHeight: 1.55, color: 'var(--op-text-secondary, #565D66)' }}>
          {step.body}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--op-text-tertiary, #9AA0A7)', fontVariantNumeric: 'tabular-nums' }}>
            {stepIdx + 1} / {total}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: 'var(--op-text-tertiary, #9AA0A7)', padding: '6px 8px',
              }}
            >
              건너뛰기
            </button>
            <button
              type="button"
              disabled={isFirst}
              onClick={() => setStepIdx((s) => Math.max(s - 1, 0))}
              style={{
                background: 'var(--op-bg-subtle, #FAFBFC)', border: '1px solid var(--op-border, #E2E5EA)',
                cursor: isFirst ? 'not-allowed' : 'pointer', opacity: isFirst ? 0.5 : 1,
                fontSize: 13, color: 'var(--op-text-primary, #0B0D10)', padding: '6px 12px',
                borderRadius: 'var(--op-radius-sm, 4px)',
              }}
            >
              이전
            </button>
            <button
              type="button"
              data-autofocus
              onClick={() => (isLast ? onClose() : setStepIdx((s) => Math.min(s + 1, total - 1)))}
              style={{
                background: 'var(--op-brand, #E60012)', border: '1px solid var(--op-brand, #E60012)',
                cursor: 'pointer',
                fontSize: 13, color: '#fff', padding: '6px 14px', fontWeight: 600,
                borderRadius: 'var(--op-radius-sm, 4px)',
              }}
            >
              {isLast ? '완료' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
