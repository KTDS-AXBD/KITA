import type { TweaksValues } from '@/types';
import { navigate } from './useHashRoute';

interface AppHeaderProps {
  route: string;
  tweaks: TweaksValues;
}

const HEADER_TABS = [
  { id: '/', label: 'Overview' },
  { id: '/scenario/rnd', label: 'S4 · R&D 추천' },
  { id: '/scenario/toluene', label: 'S6 · 공작기계' },
  { id: '/about/ontology', label: '온톨로지' },
  { id: '/about/data', label: '데이터 출처' },
] as const;

export function AppHeader({ route, tweaks }: AppHeaderProps): JSX.Element {
  const isActive = (id: string): boolean => (id === '/' ? route === '/' : route === id);
  const labelText = 'GIVC × Ontology PoC';
  const subText = tweaks.langMode === 'en' ? 'KT DS · AX Consulting' : 'KT DS AX컨설팅팀';

  return (
    <header className="app-header">
      <a
        className="brand"
        href="#/"
        onClick={(e) => {
          e.preventDefault();
          navigate('/');
        }}
      >
        <span className="logo-mark">A</span>
        <span>{labelText}</span>
        <span className="brand-sub">— {subText}</span>
        <span className="version">v1</span>
      </a>
      <nav className="tabs">
        {HEADER_TABS.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            className={isActive(t.id) ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              navigate(t.id);
            }}
          >
            {t.label}
          </a>
        ))}
      </nav>
      <div className="header-right">
        <span className="header-meta">harness-kit · @ktds-axbd</span>
      </div>
    </header>
  );
}
