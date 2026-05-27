export type BadgeVariant = 'real' | 'estimate' | 'paid' | 'verified' | 'draft' | 'pending';

const BADGE_LABELS: Record<BadgeVariant, string> = {
  real: '실',
  estimate: '추정',
  paid: '유료',
  verified: 'verified',
  draft: 'draft',
  pending: 'pending',
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
}

/**
 * 출처/상태 배지. 색·라운드·타이포는 디자인 시스템 토큰(theme.css)에서,
 * variant별 색 매핑은 app.css `.op-badge[data-variant=…]`에서 중앙 관리.
 * 출처(real/estimate/paid)는 신뢰성 톤의 잉크 기반(흑백) 배지.
 */
export function Badge({ variant, label }: BadgeProps): JSX.Element {
  return (
    <span className="op-badge" data-variant={variant}>
      {label ?? BADGE_LABELS[variant]}
    </span>
  );
}
