import { useState } from 'react';

type TooltipType = 'attr' | 'info' | 'rel';

interface TooltipProps {
  type?: TooltipType;
  label: string;
  content: string;
}

const TIP_STYLES: React.CSSProperties = {
  position: 'absolute',
  bottom: 'calc(100% + 8px)',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'var(--op-ink-900)',
  color: '#fff',
  padding: '9px 12px',
  borderRadius: 'var(--op-radius-sm)',
  fontSize: 'var(--op-fs-sm)',
  lineHeight: 1.5,
  whiteSpace: 'normal',
  width: 240,
  zIndex: 9999,
  boxShadow: 'var(--op-shadow-lg)',
  pointerEvents: 'none',
};

export function Tooltip({ type = 'info', label, content }: TooltipProps): JSX.Element {
  const [visible, setVisible] = useState(false);

  if (type === 'attr') {
    return (
      <span
        style={{ position: 'relative', cursor: 'help', display: 'inline-flex', alignItems: 'center', gap: 2, padding: '2px 7px', borderRadius: 3, background: 'var(--op-bg-inset)', fontSize: 11, color: 'var(--op-text-secondary)' }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {label}
        <i style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: 'var(--op-ink-100)', color: 'var(--op-text-tertiary)', fontSize: 9, marginLeft: 3, fontWeight: 700, fontStyle: 'normal' }}>i</i>
        {visible && <span style={{ ...TIP_STYLES, left: 0, transform: 'none' }}>{content}</span>}
      </span>
    );
  }

  if (type === 'rel') {
    return (
      <span
        style={{ position: 'relative', cursor: 'help', borderBottom: '1px dotted var(--op-ink-300)', display: 'inline-flex', alignItems: 'center', gap: 2 }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {label}
        <i style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 13, height: 13, borderRadius: '50%', background: 'var(--op-ink-100)', color: 'var(--op-text-tertiary)', fontSize: 8, marginLeft: 2, fontWeight: 700, fontStyle: 'normal' }}>i</i>
        {visible && <span style={TIP_STYLES}>{content}</span>}
      </span>
    );
  }

  /* type === 'info' (default) */
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <i style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: 'var(--op-ink-100)', color: 'var(--op-text-tertiary)', fontSize: 9, marginLeft: 4, fontWeight: 700, fontStyle: 'normal' }}>i</i>
      {visible && <span style={TIP_STYLES}>{content || label}</span>}
    </span>
  );
}
