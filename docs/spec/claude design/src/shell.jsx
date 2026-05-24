// ============================================================
// App Shell — header / nav / hash router
// ============================================================

const { useState, useEffect } = React;

// -------- Hash router --------
const useHashRoute = () => {
  const [hash, setHash] = useState(() => window.location.hash || '#/');
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  // strip leading #
  return hash.replace(/^#/, '') || '/';
};

const navigate = (path) => { window.location.hash = path; };

// -------- Tabs in header --------
const HEADER_TABS = [
  { id: '/',                  label: 'Overview' },
  { id: '/scenario/rnd',      label: 'S4 · R&D 추천' },
  { id: '/scenario/toluene',  label: 'S6 · 톨루엔' },
  { id: '/about/ontology',    label: '온톨로지' },
  { id: '/about/data',        label: '데이터 출처' }
];

// -------- Header --------
const AppHeader = ({ route, tweaks }) => {
  const isActive = (id) => {
    if (id === '/') return route === '/';
    return route === id;
  };
  const labelText = tweaks.langMode === 'en'
    ? 'GIVC × Ontology PoC'
    : 'GIVC × Ontology PoC';
  const subText = tweaks.langMode === 'en'
    ? 'KT DS · AX Consulting'
    : 'KT DS AX컨설팅팀';

  return (
    <header className="app-header">
      <a className="brand" href="#/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
        <span className="logo-mark">A</span>
        <span>{labelText}</span>
        <span className="brand-sub">— {subText}</span>
        <span className="version">v1</span>
      </a>
      <nav className="tabs">
        {HEADER_TABS.map(t => (
          <a key={t.id} href={`#${t.id}`}
             className={isActive(t.id) ? 'active' : ''}
             onClick={(e) => { e.preventDefault(); navigate(t.id); }}>
            {t.label}
          </a>
        ))}
      </nav>
      <div className="header-right">
        <span className="header-meta">harness-kit · @ktds-axbd</span>
      </div>
    </header>
  );
};

Object.assign(window, { AppHeader, useHashRoute, navigate });
