export interface TimelineItem {
  phase: string;
  label: string;
  date: string;
  status: 'done' | 'active' | 'upcoming';
}

const STATUS_COLORS = {
  done: '#111111',
  active: 'var(--op-accent)',
  upcoming: '#CCCCCC',
};

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, position: 'relative' }}>
          {/* 세로선 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: STATUS_COLORS[item.status],
                marginTop: 4,
                flexShrink: 0,
              }}
            />
            {i < items.length - 1 && (
              <div style={{ width: 2, flex: 1, minHeight: 24, background: '#E8ECF1', marginTop: 4 }} />
            )}
          </div>
          <div style={{ paddingBottom: i < items.length - 1 ? 20 : 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLORS[item.status] }}>
                {item.phase}
              </span>
              <span style={{ fontSize: 12, color: 'var(--op-text-tertiary)' }}>{item.date}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--op-text-primary)' }}>{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
