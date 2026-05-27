import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, width = 480 }: ModalProps): JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--op-bg-card)',
          borderRadius: 'var(--op-radius)',
          boxShadow: 'var(--op-shadow-lg)',
          width,
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '24px 28px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--op-text-primary)', margin: 0 }}>{title}</h3>
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
