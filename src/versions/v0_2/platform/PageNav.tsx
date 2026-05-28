import { navigate } from '@/shell';
import { PAGE_ORDER } from './pageOrder';

/**
 * F042: v0.2 7페이지 시연 동선 next/prev 컴포넌트.
 * 사이드바 순회 없이 페이지 하단 버튼으로 다음/이전 단계 이동.
 *
 * 양 끝 처리: 첫 페이지 prev=null, 마지막 페이지 next=null.
 * 현 라우트가 7개 어디에도 해당하지 않으면 컴포넌트 자체를 렌더하지 않는다.
 * PAGE_ORDER 정의는 `./pageOrder.ts`(SSOT, react-refresh 경고 회피).
 */
interface PageNavProps {
  currentRoute: string;
}

export function PageNav({ currentRoute }: PageNavProps): JSX.Element | null {
  const idx = PAGE_ORDER.findIndex((p) => currentRoute === p.path);
  if (idx === -1) return null;
  const prev = idx > 0 ? PAGE_ORDER[idx - 1] : null;
  const next = idx < PAGE_ORDER.length - 1 ? PAGE_ORDER[idx + 1] : null;

  const baseBtn: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    padding: '12px 18px',
    background: 'var(--op-bg-card)',
    border: '1px solid var(--op-border)',
    borderRadius: 'var(--op-radius)',
    cursor: 'pointer',
    transition: 'background var(--op-dur-fast) var(--op-ease), border-color var(--op-dur-fast) var(--op-ease)',
    minWidth: 220,
    textAlign: 'left' as const,
  };
  const labelText: React.CSSProperties = {
    fontFamily: 'var(--op-font-mono)',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 'var(--op-tracking-label)',
    textTransform: 'uppercase' as const,
    color: 'var(--op-text-tertiary)',
  };
  const pageText: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--op-text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  return (
    <nav
      aria-label="페이지 이동"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 32,
        paddingTop: 24,
        borderTop: '1px solid var(--op-border)',
      }}
    >
      <div>
        {prev && (
          <button
            type="button"
            onClick={() => navigate(prev.path)}
            style={baseBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--op-bg-hover)';
              e.currentTarget.style.borderColor = 'var(--op-border-strong)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--op-bg-card)';
              e.currentTarget.style.borderColor = 'var(--op-border)';
            }}
            data-testid="page-nav-prev"
          >
            <span style={labelText}>← 이전</span>
            <span style={pageText}>{prev.label}</span>
          </button>
        )}
      </div>
      <div>
        {next && (
          <button
            type="button"
            onClick={() => navigate(next.path)}
            style={{ ...baseBtn, alignItems: 'flex-end', textAlign: 'right' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--op-bg-hover)';
              e.currentTarget.style.borderColor = 'var(--op-border-strong)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--op-bg-card)';
              e.currentTarget.style.borderColor = 'var(--op-border)';
            }}
            data-testid="page-nav-next"
          >
            <span style={labelText}>다음 →</span>
            <span style={pageText}>{next.label}</span>
          </button>
        )}
      </div>
    </nav>
  );
}

