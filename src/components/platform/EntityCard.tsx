interface EntityCardProps {
  title: string;
  subtitle?: string;
  colorBlock: string;
  attrs: string[];
  count?: number;
}

export function EntityCard({ title, subtitle, colorBlock, attrs, count }: EntityCardProps): JSX.Element {
  return (
    <div
      style={{
        background: 'var(--op-bg-card)',
        borderRadius: 'var(--op-radius-sm)',
        boxShadow: 'var(--op-shadow)',
        border: '1px solid var(--op-border)',
        padding: 16,
        position: 'relative',
      }}
    >
      {count !== undefined && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--op-text-tertiary)',
          }}
        >
          {count}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            background: colorBlock,
            flexShrink: 0,
          }}
        />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--op-text-primary)' }}>{title}</div>
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: 'var(--op-text-tertiary)', marginBottom: 10 }}>{subtitle}</div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {attrs.map((attr) => (
          <span
            key={attr}
            style={{
              padding: '2px 7px',
              borderRadius: 3,
              background: 'var(--op-bg-base)',
              fontSize: 11,
              color: 'var(--op-text-secondary)',
            }}
          >
            {attr}
          </span>
        ))}
      </div>
    </div>
  );
}
