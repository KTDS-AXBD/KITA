export type BadgeVariant = 'real' | 'estimate' | 'paid' | 'verified' | 'draft' | 'pending';

const BADGE_LABELS: Record<BadgeVariant, string> = {
  real: '실',
  estimate: '추정',
  paid: '유료',
  verified: 'verified',
  draft: 'draft',
  pending: 'pending',
};

const BADGE_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  real: { background: '#111111', color: '#FFFFFF' },
  estimate: { background: '#777777', color: '#FFFFFF' },
  paid: { background: '#CCCCCC', color: '#555555' },
  verified: { background: '#2ECC71', color: '#fff' },
  draft: { background: '#F9E2AF', color: '#8B6914' },
  pending: { background: '#E8ECF1', color: '#666666' },
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
}

export function Badge({ variant, label }: BadgeProps): JSX.Element {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...BADGE_STYLES[variant],
      }}
    >
      {label ?? BADGE_LABELS[variant]}
    </span>
  );
}
