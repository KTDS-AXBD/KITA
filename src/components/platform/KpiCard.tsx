interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accentColor?: string;
}

export function KpiCard({ label, value, sub, accentColor }: KpiCardProps): JSX.Element {
  return (
    <div
      style={{
        background: 'var(--op-bg-card)',
        borderRadius: 'var(--op-radius)',
        padding: 18,
        boxShadow: 'var(--op-shadow)',
        border: '1px solid var(--op-border)',
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--op-text-secondary)', fontWeight: 500, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accentColor ?? 'var(--op-text-primary)' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--op-text-tertiary)', marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}
