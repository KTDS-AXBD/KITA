import type { CytoDomain } from '@/types';

interface GraphToolbarProps {
  domain: CytoDomain;
  nodeCount: number;
  edgeCount: number;
  focusActive: boolean;
  onDomainChange: (d: CytoDomain) => void;
  onFocusToggle: () => void;
}

const DOMAIN_LABELS: Record<CytoDomain, string> = {
  sobujiang: '소부장 R&D',
  hormuz: '호르무즈 리스크',
};

export function GraphToolbar({ domain, nodeCount, edgeCount, focusActive, onDomainChange, onFocusToggle }: GraphToolbarProps): JSX.Element {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 0',
      flexWrap: 'wrap',
    }}>
      {/* 도메인 토글 */}
      <div data-tour-id="domain-toggle" style={{
        display: 'inline-flex',
        gap: 2,
        padding: '3px 4px',
        background: 'var(--op-bg-base)',
        borderRadius: 8,
        border: '1px solid var(--op-border)',
      }}>
        {(['sobujiang', 'hormuz'] as CytoDomain[]).map((d) => {
          const active = d === domain;
          return (
            <button
              key={d}
              onClick={() => onDomainChange(d)}
              style={{
                padding: '5px 14px',
                borderRadius: 6,
                border: 'none',
                background: active ? '#fff' : 'transparent',
                color: active ? 'var(--op-text-primary)' : 'var(--op-text-tertiary)',
                fontWeight: active ? 600 : 400,
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: active ? 'var(--op-shadow)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {DOMAIN_LABELS[d]}
            </button>
          );
        })}
      </div>

      {/* 영향경로 집중 버튼 */}
      <button
        onClick={onFocusToggle}
        style={{
          padding: '6px 14px',
          borderRadius: 8,
          border: `1.5px solid ${focusActive ? 'var(--op-accent)' : 'var(--op-border)'}`,
          background: focusActive ? 'var(--op-accent-light)' : 'transparent',
          color: focusActive ? 'var(--op-accent)' : 'var(--op-text-secondary)',
          fontWeight: focusActive ? 600 : 400,
          fontSize: 12,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {focusActive ? '전체 그래프 보기' : (domain === 'hormuz' ? '호르무즈 경로 집중' : '소부장 R&D 경로')}
      </button>

      {/* 통계 */}
      <span style={{ fontSize: 12, color: 'var(--op-text-tertiary)', marginLeft: 'auto' }}>
        노드 {nodeCount} · 엣지 {edgeCount}
      </span>
    </div>
  );
}
