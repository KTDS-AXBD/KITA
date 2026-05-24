interface ScoreBarProps {
  value: number;
  max?: number;
  decimals?: number;
}

export function ScoreBar({ value, max = 1, decimals = 2 }: ScoreBarProps): JSX.Element {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <span className="score-bar">
      <span className="score-fill-wrap">
        <span className="score-fill" style={{ width: `${pct}%` }}></span>
      </span>
      <span className="score-num">{value.toFixed(decimals)}</span>
    </span>
  );
}
