interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  /** 좌측 키라인 강조색 (예: 실 데이터 = 잉크 블랙). 미지정 시 중립 */
  accentColor?: string;
}

export function KpiCard({ label, value, sub, accentColor }: KpiCardProps): JSX.Element {
  return (
    <div
      className="op-kpi"
      style={accentColor ? ({ '--op-kpi-keyline': accentColor } as React.CSSProperties) : undefined}
    >
      <div className="op-kpi-label">{label}</div>
      <div className="op-kpi-value">{value}</div>
      {sub && <div className="op-kpi-sub">{sub}</div>}
    </div>
  );
}
