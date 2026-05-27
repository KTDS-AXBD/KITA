export type DotStatus = 'connected' | 'collecting' | 'unavailable';

const DOT_COLORS: Record<DotStatus, string> = {
  connected: '#2ECC71',
  collecting: '#F39C12',
  unavailable: '#CCCCCC',
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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: DOT_COLORS[status],
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
      <span style={{ fontSize: 12, color: 'var(--op-text-secondary)' }}>{DOT_LABELS[status]}</span>
    </span>
  );
}
