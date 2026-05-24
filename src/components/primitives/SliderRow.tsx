interface SliderRowProps {
  name: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function SliderRow({
  name,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.05,
}: SliderRowProps): JSX.Element {
  return (
    <div className="slider-row">
      <span className="slider-name">{name}</span>
      <input
        className="slider-track"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span className="slider-value">{(value * 100).toFixed(0)}</span>
    </div>
  );
}
