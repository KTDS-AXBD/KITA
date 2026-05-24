import type { ReactNode } from 'react';
import { Sparkles } from '../icons';

export interface ExpansionHint {
  id: string;
  title: string;
  delta: string;
  detail: string;
}

interface DataExpansionHintsProps {
  hints: ExpansionHint[];
  active: Record<string, boolean | undefined>;
  onToggle: (id: string) => void;
  currentRows?: ReactNode[];
  eyebrow?: string;
  title?: string;
  sub?: string;
}

export function DataExpansionHints({
  hints,
  active,
  onToggle,
  currentRows,
  eyebrow = 'DATA EXPANSION HINTS',
  title = '이 데이터가 더 있다면',
  sub,
}: DataExpansionHintsProps): JSX.Element {
  return (
    <div className="hints">
      <div className="hints-head">
        <div className="hints-eyebrow">{eyebrow}</div>
        <h3>{title}</h3>
        {sub ? <p>{sub}</p> : null}
      </div>
      {currentRows && (
        <div className="hints-current">
          {currentRows.map((row, i) => (
            <div className="cur-row" key={i}>
              <span>현재:</span>
              <strong>{row}</strong>
            </div>
          ))}
        </div>
      )}
      {hints.map((h) => (
        <div className={`hint-item ${active[h.id] ? 'active' : ''}`} key={h.id}>
          <div className="hint-item-top">
            <div className="hint-item-title">
              <Sparkles size={12} /> {h.title}
              <span className="hint-item-delta">{h.delta}</span>
            </div>
            <button
              className={`hint-toggle ${active[h.id] ? 'on' : ''}`}
              onClick={() => onToggle(h.id)}
              aria-label={`toggle ${h.title}`}
            ></button>
          </div>
          <div className="hint-item-detail">{h.detail}</div>
        </div>
      ))}
    </div>
  );
}
