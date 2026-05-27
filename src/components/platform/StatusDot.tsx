export type DotStatus = 'connected' | 'collecting' | 'unavailable';

const DOT_COLORS: Record<DotStatus, string> = {
  connected: 'var(--op-success)',
  collecting: 'var(--op-warn)',
  unavailable: 'var(--op-ink-300)',
};

const DOT_LABELS: Record<DotStatus, string> = {
  connected: '연동',
  collecting: '수집',
  unavailable: '미확보',
};

interface StatusDotProps {
  status: DotStatus;
}

export function StatusDot({ status }: StatusDotProps): JSX.Element {
  return (
    <span className="op-statusdot">
      <span
        className={`op-statusdot-mark${status === 'connected' ? ' is-live' : ''}`}
        style={{ background: DOT_COLORS[status], color: DOT_COLORS[status] }}
      />
      <span className="op-statusdot-label">{DOT_LABELS[status]}</span>
    </span>
  );
}
