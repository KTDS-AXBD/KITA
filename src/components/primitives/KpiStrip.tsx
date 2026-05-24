import { TrendingUp, TrendingDown } from '../icons';

export interface KpiItem {
  label: string;
  value: string | number;
  delta?: string;
  deltaDir?: 'up' | 'down';
}

interface KpiStripProps {
  items: KpiItem[];
}

export function KpiStrip({ items }: KpiStripProps): JSX.Element {
  return (
    <div className="kpi-strip">
      {items.map((k, i) => (
        <div className="kpi-cell" key={i}>
          <div className="kpi-label">{k.label}</div>
          <div className="kpi-value">{k.value}</div>
          {k.delta != null && (
            <div className={`kpi-delta ${k.deltaDir === 'down' ? 'down' : 'up'}`}>
              {k.deltaDir === 'down' ? <TrendingDown size={11} /> : <TrendingUp size={11} />} {k.delta}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
