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
      className="op-card"
      style={{ padding: 16, position: 'relative', borderRadius: 'var(--op-radius-sm)' }}
    >
      {count !== undefined && (
        <div
          style={{
            position: 'absolute',
            top: 13,
            right: 15,
            fontSize: 20,
            fontWeight: 'var(--op-fw-bold)',
            fontFamily: 'var(--op-font-mono)',
            color: 'var(--op-text-tertiary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: colorBlock,
            flexShrink: 0,
            boxShadow: `0 0 0 3px ${colorBlock}1f`,
          }}
        />
        <div style={{ fontSize: 'var(--op-fs-heading)', fontWeight: 'var(--op-fw-bold)', color: 'var(--op-text-primary)', letterSpacing: '-0.01em' }}>
          {title}
        </div>
      </div>
      {subtitle && (
        <div style={{ fontSize: 'var(--op-fs-label)', color: 'var(--op-text-tertiary)', marginBottom: 11, fontFamily: 'var(--op-font-mono)' }}>
          {subtitle}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {attrs.map((attr) => (
          <span
            key={attr}
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--op-radius-pill)',
              background: 'var(--op-bg-inset)',
              border: '1px solid var(--op-hairline)',
              fontSize: 'var(--op-fs-label)',
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
