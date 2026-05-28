import { navigate } from './useHashRoute';
import { dispatchTourRestart } from '@/components/platform';
import { getPageKey } from '@/data/tour';

const PAGE_LABELS: Record<string, string> = {
  '/platform/data': '데이터 현황',
  '/platform/cq': 'CQ 관리',
  '/platform/ontology': '온톨로지 정의',
  '/platform/graph': '지식그래프',
  '/platform/scenario': '시나리오 분석',
  '/platform/compare': '비교 검증',
  '/platform/plan': '추진 계획',
};

interface HeaderBarProps {
  route: string;
}

export function HeaderBar({ route }: HeaderBarProps): JSX.Element {
  const currentLabel = PAGE_LABELS[route] ?? route.split('/').pop() ?? '';
  const pageKey = getPageKey(route);

  return (
    <header className="op-header-bar">
      <div className="op-header-breadcrumb">
        <button
          className="op-bc-root"
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit' }}
        >
          GIVC Ontology
        </button>
        <span className="op-bc-sep">&gt;</span>
        <span className="op-bc-current">{currentLabel}</span>
      </div>
      <div className="op-header-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="op-scenario-badge">소부장 · 공작기계</span>
        {pageKey && (
          <button
            type="button"
            onClick={() => dispatchTourRestart(pageKey)}
            aria-label="현재 페이지 가이드 투어 다시 보기"
            title="가이드 투어 다시 보기"
            style={{
              background: 'var(--op-bg-subtle, #FAFBFC)',
              border: '1px solid var(--op-border, #E2E5EA)',
              borderRadius: 'var(--op-radius-sm, 4px)',
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--op-text-secondary, #565D66)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              lineHeight: 1,
            }}
          >
            <span aria-hidden="true">❓</span>
            <span>도움말</span>
          </button>
        )}
      </div>
    </header>
  );
}
