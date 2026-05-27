import type { TradeSeries } from '@/types';

interface TradeChartProps {
  data: TradeSeries;
}

export function TradeChart({ data }: TradeChartProps): JSX.Element {
  const W = 720;
  const H = 260;
  const padL = 40;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const all = [...data.exports, ...data.imports];
  const yMax = Math.ceil(Math.max(...all) / 50) * 50 + 50;
  const x = (i: number): number => padL + (i / (data.quarters.length - 1)) * innerW;
  const y = (v: number): number => padT + innerH - (v / yMax) * innerH;
  const lineExport = data.exports
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`)
    .join(' ');
  const lineImport = data.imports
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`)
    .join(' ');
  const areaExport = `M${x(0)},${y(0)} ${data.exports
    .map((v, i) => `L${x(i)},${y(v)}`)
    .join(' ')} L${x(data.exports.length - 1)},${y(0)} Z`;
  const ticks = [0, yMax / 4, yMax / 2, (3 * yMax) / 4, yMax];

  return (
    <div className="trend-chart-wrap">
      <div className="trend-chart">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          {ticks.map((t, i) => (
            <g key={i}>
              <line className="grid-line" x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} />
              <text className="axis-tick" x={padL - 6} y={y(t) + 3} textAnchor="end">
                {t}
              </text>
            </g>
          ))}
          {data.quarters.map(
            (q, i) =>
              i % 2 === 0 && (
                <text key={q} className="axis-tick" x={x(i)} y={H - 10} textAnchor="middle">
                  {q}
                </text>
              ),
          )}
          <path className="series-area-export" d={areaExport} />
          <path className="series-export" d={lineExport} />
          <path className="series-import" d={lineImport} />
          {data.anomalies.map((a, i) => {
            const v = data.imports[a.idx];
            if (v === undefined) return null;
            return (
              <g key={i}>
                <circle className="anomaly-marker" cx={x(a.idx)} cy={y(v)} r="5" />
                <line
                  stroke="var(--axis-color-red-300)"
                  strokeDasharray="2 2"
                  x1={x(a.idx)}
                  y1={y(v)}
                  x2={x(a.idx)}
                  y2={H - padB + 4}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ display: 'flex', gap: 16, padding: '6px 4px 10px', fontSize: 11 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 16, height: 2, background: 'var(--axis-color-blue-500)' }}></span>{' '}
          수출 ($M)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{ width: 16, height: 0, borderTop: '2px dashed var(--axis-color-orange-500)' }}
          ></span>{' '}
          수입 ($M)
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--axis-color-red-700)',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              background: 'var(--axis-color-red-500)',
              borderRadius: 100,
            }}
          ></span>{' '}
          이상 시그널
        </span>
        <span
          style={{
            marginLeft: 'auto',
            color: 'var(--axis-text-tertiary)',
            fontFamily: 'var(--axis-font-mono)',
          }}
        >
          source: GIVC mart.lnk0951a · 22Q1–25Q4
        </span>
      </div>
    </div>
  );
}
