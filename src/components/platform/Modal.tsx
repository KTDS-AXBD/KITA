import { useEffect, useRef, useId } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
}

/**
 * F046: a11y-grade Modal.
 * - role="dialog" + aria-modal + aria-labelledby(title id)
 * - 열릴 때 첫 focusable 요소로 자동 focus + 이전 focus 저장
 * - Tab/Shift+Tab focus trap(첫/마지막 사이 wrap)
 * - Esc 닫기 + 배경 클릭 닫기
 * - 닫힐 때 이전 focus 요소로 복귀
 * - 열린 동안 body scroll lock
 *
 * SSR/portal 사용 안 함(현 v0.2 SPA는 hash router라 단순 inline 렌더 충분).
 */
const FOCUSABLE_SELECTOR =
  'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';

export function Modal({ open, onClose, title, children, width = 480 }: ModalProps): JSX.Element | null {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // 1) 열릴 때: 이전 focus 저장 + 첫 focusable 자동 focus + body scroll lock
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 다음 tick에 focus (Modal DOM이 마운트된 후)
    // 우선순위: data-autofocus > 첫 input/textarea/select(폼 UX) > 첫 button > content root.
    // 닫기 버튼이 DOM 첫 위치라도 입력 폼이 있으면 입력 요소를 먼저 focus
    // (우발적 Enter로 모달 닫힘 + 입력 손실 방지).
    const focusFirst = () => {
      const root = contentRef.current;
      if (!root) return;
      const autofocus = root.querySelector<HTMLElement>('[data-autofocus]');
      if (autofocus) { autofocus.focus(); return; }
      const firstInput = root.querySelector<HTMLElement>('input:not([disabled]), textarea:not([disabled]), select:not([disabled])');
      if (firstInput) { firstInput.focus(); return; }
      const firstFocusable = root.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (firstFocusable) { firstFocusable.focus(); return; }
      root.focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      // 닫힐 때 이전 focus 복귀
      const prev = previousFocusRef.current;
      if (prev && document.contains(prev)) {
        prev.focus();
      }
    };
  }, [open]);

  // 2) Keydown: Esc + Tab/Shift+Tab focus trap
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const root = contentRef.current;
      if (!root) return;
      const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute('aria-hidden')
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      // Shift+Tab: 첫 요소에서 마지막으로 wrap
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
        return;
      }
      // Tab: 마지막 요소에서 첫번째로 wrap
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(11,13,16,0.45)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : '모달 대화상자'}
        tabIndex={-1}
        style={{
          background: 'var(--op-bg-card)',
          borderRadius: 'var(--op-radius)',
          boxShadow: 'var(--op-shadow-lg)',
          width,
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '24px 28px',
          border: '1px solid var(--op-border)',
          outline: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 id={titleId} style={{ fontSize: 'var(--op-fs-heading)', fontWeight: 'var(--op-fw-bold)', color: 'var(--op-text-primary)', margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--op-text-tertiary)', lineHeight: 1 }}
              aria-label="닫기"
            >
              &times;
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
