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
  background: '#1a1a1a',
  color: '#fff',
  padding: '8px 12px',
  borderRadius: 6,
  fontSize: 12,
  lineHeight: 1.5,
  whiteSpace: 'normal',
  width: 240,
  zIndex: 9999,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  pointerEvents: 'none',
};

export function Tooltip({ type = 'info', label, content }: TooltipProps): JSX.Element {
  const [visible, setVisible] = useState(false);

  if (type === 'attr') {
    return (
      <span
        style={{ position: 'relative', cursor: 'help', display: 'inline-flex', alignItems: 'center', gap: 2, padding: '2px 7px', borderRadius: 3, background: 'var(--op-bg-base)', fontSize: 11, color: 'var(--op-text-secondary)' }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {label}
        <i style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: '#E8ECF1', color: '#999', fontSize: 9, marginLeft: 3, fontWeight: 700, fontStyle: 'normal' }}>i</i>
        {visible && <span style={{ ...TIP_STYLES, left: 0, transform: 'none' }}>{content}</span>}
      </span>
    );
  }

  if (type === 'rel') {
    return (
      <span
        style={{ position: 'relative', cursor: 'help', borderBottom: '1px dotted #ccc', display: 'inline-flex', alignItems: 'center', gap: 2 }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {label}
        <i style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 13, height: 13, borderRadius: '50%', background: '#E8ECF1', color: '#999', fontSize: 8, marginLeft: 2, fontWeight: 700, fontStyle: 'normal' }}>i</i>
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
      <i style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: '#E8ECF1', color: '#999', fontSize: 9, marginLeft: 4, fontWeight: 700, fontStyle: 'normal' }}>i</i>
      {visible && <span style={TIP_STYLES}>{content || label}</span>}
    </span>
  );
}
