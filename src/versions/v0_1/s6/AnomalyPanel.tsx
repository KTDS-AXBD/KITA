import type { TradeAnomaly } from '@/types';
import { AlertTriangle } from '@/components/icons';
import { DataMark } from '@/components/DataMark';

interface AnomalyPanelProps {
  anomalies: TradeAnomaly[];
}

export function AnomalyPanel({ anomalies }: AnomalyPanelProps): JSX.Element {
  return (
    <div style={{ padding: '4px 0' }}>
      {anomalies.map((a, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 10,
            padding: '10px 14px',
            borderBottom: '1px solid var(--axis-line-soft)',
          }}
        >
          <AlertTriangle
            size={14}
            style={{ color: 'var(--axis-color-red-500)', flexShrink: 0, marginTop: 2 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>{a.label}</div>
            <div style={{ fontSize: 11, color: 'var(--axis-text-tertiary)' }}>
              이상치 알고리즘 — 이동평균 ±2σ 초과
            </div>
          </div>
          <DataMark kind={a.source} withLabel={false} />
        </div>
      ))}
    </div>
  );
}
