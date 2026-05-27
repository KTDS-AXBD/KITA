import { navigate } from './useHashRoute';

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
      <div className="op-header-right">
        <span className="op-scenario-badge">소부장 · 공작기계</span>
      </div>
    </header>
  );
}
