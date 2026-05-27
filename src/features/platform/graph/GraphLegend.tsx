import type { CytoNodeType } from '@/types';

const LEGEND_ITEMS: Array<{ type: CytoNodeType; label: string; cssVar: string }> = [
  { type: 'Event', label: '이벤트', cssVar: '--op-color-event' },
  { type: 'Country', label: '국가', cssVar: '--op-color-country' },
  { type: 'RawMaterial', label: '원자재', cssVar: '--op-color-raw' },
  { type: 'IntermediateGoods', label: '중간재', cssVar: '--op-color-intermediate' },
  { type: 'Product', label: '품목', cssVar: '--op-color-product' },
  { type: 'Industry', label: '산업', cssVar: '--op-color-industry' },
  { type: 'Company', label: '기업', cssVar: '--op-color-company' },
  { type: 'RnDProject', label: 'R&D', cssVar: '--op-color-rnd' },
  { type: 'EWSAlert', label: 'EWS', cssVar: '--op-color-ews' },
  { type: 'RiskIndicator', label: '지표', cssVar: '--op-color-risk' },
  { type: 'TradeRecord', label: '무역', cssVar: '--op-color-trade' },
];

interface GraphLegendProps {
  onFilterChange?: (type: string) => void;
  activeFilter: string;
}

export function GraphLegend({ onFilterChange, activeFilter }: GraphLegendProps): JSX.Element {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px 12px',
      padding: '8px 0 0',
    }}>
      {LEGEND_ITEMS.map(({ type, label, cssVar }) => {
        const isActive = activeFilter === type;
        return (
          <button
            key={type}
            onClick={() => onFilterChange?.(isActive ? 'all' : type)}
            title={`${label} 노드만 표시`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 8px',
              borderRadius: 12,
              border: `1.5px solid ${isActive ? 'var(--op-accent)' : 'transparent'}`,
              background: isActive ? 'var(--op-accent-light)' : 'transparent',
              cursor: 'pointer',
              fontSize: 11,
              color: 'var(--op-text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            <span style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: `var(${cssVar})`,
              flexShrink: 0,
            }} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
