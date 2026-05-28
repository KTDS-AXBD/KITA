// F041: v0.2 공용 출처 메타 Badge.
// CytoSource(real/est/paid)별 ⭐/△/💳 + 라벨을 일관되게 렌더한다.
// NodeDetailPanel/ScenarioPage/ComparePage/OntologyPage 공통 소비처.
import type { CytoSource } from '@/types';

const CONFIG: Record<CytoSource, { symbol: string; label: string; color: string }> = {
  real: { symbol: '⭐', label: '실데이터', color: '#2ECC71' },
  est: { symbol: '△', label: '추정', color: '#FF9F0A' },
  paid: { symbol: '💳', label: '유료 DB', color: '#7B68EE' },
};

interface SourceBadgeProps {
  source: CytoSource;
  /** 추가 라벨(예: 'NTIS R&D과제'). 미지정 시 기본 라벨만. */
  label?: string;
  /** 'inline'(텍스트 인라인) | 'pill'(둥근 칩). 기본 inline. */
  variant?: 'inline' | 'pill';
}

export function SourceBadge({ source, label, variant = 'inline' }: SourceBadgeProps): JSX.Element {
  const c = CONFIG[source];
  const text = label ? `${c.symbol} ${label}` : `${c.symbol} ${c.label}`;
  if (variant === 'pill') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 10,
          background: `${c.color}1a`,
          color: c.color,
          fontSize: 10,
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    );
  }
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: c.color, whiteSpace: 'nowrap' }}>
      {text}
    </span>
  );
}
