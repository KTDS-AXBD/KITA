import type { ReactNode, HTMLAttributes } from 'react';

type BadgeKind = 'default' | 'info' | 'warning' | 'error';

interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  kind?: BadgeKind;
  children: ReactNode;
}

export function Badge({ kind = 'default', children, ...rest }: BadgeProps): JSX.Element {
  return (
    <span className={`badge badge-${kind}`} {...rest}>
      {children}
    </span>
  );
}
