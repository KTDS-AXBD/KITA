interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps): JSX.Element {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          display: 'inline-block',
          width: 38,
          height: 22,
          borderRadius: 'var(--op-radius-pill)',
          background: checked ? 'var(--op-brand)' : 'var(--op-ink-300)',
          position: 'relative',
          transition: 'background var(--op-dur) var(--op-ease)',
          flexShrink: 0,
          boxShadow: checked ? '0 0 0 3px var(--op-brand-tint)' : 'none',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 18 : 2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(11,13,16,0.22)',
            transition: 'left var(--op-dur) var(--op-ease)',
          }}
        />
      </span>
      {label && (
        <span style={{ fontSize: 'var(--op-fs-body)', color: 'var(--op-text-secondary)', fontWeight: 'var(--op-fw-medium)' }}>{label}</span>
      )}
    </label>
  );
}
