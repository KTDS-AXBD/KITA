import { navigate } from './useHashRoute';

interface SidebarItem {
  id: string;
  label: string;
  icon: JSX.Element;
}

const MAIN_ITEMS: SidebarItem[] = [
  {
    id: '/platform/data',
    label: '데이터 현황',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="9" cy="4.5" rx="6" ry="2.5" />
        <path d="M3 4.5v9c0 1.38 2.69 2.5 6 2.5s6-1.12 6-2.5v-9" />
        <path d="M3 9c0 1.38 2.69 2.5 6 2.5s6-1.12 6-2.5" />
      </svg>
    ),
  },
  {
    id: '/platform/cq',
    label: 'CQ 관리',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="2" width="12" height="14" rx="1.5" />
        <path d="M6.5 1.5h5v2h-5z" />
        <path d="M6.5 7.5h5M6.5 10.5h5M6.5 13.5h3" />
      </svg>
    ),
  },
  {
    id: '/platform/ontology',
    label: '온톨로지 정의',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="4" r="1.5" />
        <circle cx="5" cy="14" r="1.5" />
        <circle cx="13" cy="8" r="1.5" />
        <path d="M5 5.5v7M5 8c0-1.5 1-3 3.5-3h3" />
      </svg>
    ),
  },
  {
    id: '/platform/graph',
    label: '지식그래프',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13" cy="4" r="2" />
        <circle cx="4" cy="9" r="2" />
        <circle cx="13" cy="14" r="2" />
        <path d="M5.8 7.8l6.4-2.6M5.8 10.2l6.4 2.6" />
      </svg>
    ),
  },
  {
    id: '/platform/scenario',
    label: '시나리오 분석',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="7.5" r="5" />
        <path d="M16 16l-4-4" />
      </svg>
    ),
  },
];

const REFERENCE_ITEMS: SidebarItem[] = [
  {
    id: '/platform/compare',
    label: '비교 검증',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="5.5" height="12" rx="1" />
        <rect x="10.5" y="3" width="5.5" height="12" rx="1" />
      </svg>
    ),
  },
  {
    id: '/platform/plan',
    label: '추진 계획',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3.5" width="14" height="12" rx="1.5" />
        <path d="M2 7.5h14M6 1.5v4M12 1.5v4" />
      </svg>
    ),
  },
];

interface SidebarProps {
  route: string;
}

export function Sidebar({ route }: SidebarProps): JSX.Element {
  const isActive = (id: string): boolean => route === id || route.startsWith(id + '/');

  const renderItem = (item: SidebarItem): JSX.Element => (
    <button
      key={item.id}
      className={`op-menu-item${isActive(item.id) ? ' active' : ''}`}
      onClick={() => navigate(item.id)}
    >
      <span className="op-menu-icon">{item.icon}</span>
      {item.label}
    </button>
  );

  return (
    <nav className="op-sidebar">
      <button
        type="button"
        className="op-sidebar-logo"
        title="버전 선택으로"
        onClick={() => navigate('/select')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit' }}
      >
        <div className="op-sidebar-logo-fallback">G</div>
        <div>
          <div className="op-sidebar-logo-title">GIVC Ontology</div>
          <div className="op-sidebar-logo-sub">Platform</div>
        </div>
      </button>
      <div className="op-sidebar-subtitle">KT DS AX컨설팅팀</div>

      <div className="op-sidebar-section-label">MAIN MENU</div>
      {MAIN_ITEMS.map(renderItem)}

      <div className="op-sidebar-section-label">REFERENCE</div>
      {REFERENCE_ITEMS.map(renderItem)}

      <div className="op-sidebar-footer">
        <span className="op-sidebar-footer-ver">v0.32</span>
        <br />
        KT DS AX컨설팅팀
      </div>
    </nav>
  );
}
