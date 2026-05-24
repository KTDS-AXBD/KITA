import type { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
  tight?: boolean;
  flushBody?: boolean;
  headRight?: ReactNode;
  className?: string;
}

export function Card({
  title,
  subtitle,
  sub,
  children,
  tight,
  flushBody,
  headRight,
  className = '',
}: CardProps): JSX.Element {
  return (
    <div className={`card ${tight ? 'card-tight' : ''} ${className}`}>
      {(title || headRight) && (
        <div className="card-head">
          <h3>
            {title}
            {subtitle ? <span className="card-sub">· {subtitle}</span> : null}
          </h3>
          {sub ? <span className="card-sub">{sub}</span> : null}
          {headRight ? <div className="card-head-right">{headRight}</div> : null}
        </div>
      )}
      <div
        className={`card-body ${tight ? 'card-body-tight' : ''} ${flushBody ? 'card-body-flush' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}
