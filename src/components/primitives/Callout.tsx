import type { ComponentType, ReactNode } from 'react';
import { Info, AlertTriangle } from '../icons';

interface IconLikeProps {
  size?: number;
  className?: string;
}

type CalloutKind = 'info' | 'warn' | 'error';

interface CalloutProps {
  kind?: CalloutKind;
  icon?: ComponentType<IconLikeProps>;
  title?: ReactNode;
  children?: ReactNode;
}

export function Callout({ kind = 'info', icon, title, children }: CalloutProps): JSX.Element {
  const Icon = icon ?? (kind === 'warn' || kind === 'error' ? AlertTriangle : Info);
  return (
    <div className={`callout callout-${kind}`}>
      <Icon size={16} className="callout-icon" />
      <div>
        {title ? <strong>{title} · </strong> : null}
        {children}
      </div>
    </div>
  );
}
