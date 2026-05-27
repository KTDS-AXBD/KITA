import { useEffect } from 'react';
import { useTweaksStore } from '@/store';
import { useHashRoute, AppHeader, AppLayout, navigate } from '@/shell';
import { LandingPage } from '@/features/landing/LandingPage';
import { S4Page } from '@/features/rnd/S4Page';
import { S6Page } from '@/features/s6/S6Page';
import { AboutOntologyPage, AboutDataPage } from '@/features/about';
import { SurveyPage } from '@/features/survey';
import { TweaksPanel } from '@/components/tweaks/TweaksPanel';
import { DataStatusPage } from '@/features/platform/data/DataStatusPage';
import { CqManagePage } from '@/features/platform/cq/CqManagePage';
import { OntologyPage } from '@/features/platform/ontology/OntologyPage';
import { GraphPage } from '@/features/platform/graph/GraphPage';
import { ScenarioPage } from '@/features/platform/scenario/ScenarioPage';
import { ComparePage } from '@/features/platform/compare/ComparePage';
import { PlanPage } from '@/features/platform/plan/PlanPage';

export default function App(): JSX.Element {
  const route = useHashRoute();
  const flavor = useTweaksStore((s) => s.flavor);
  const theme = useTweaksStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-style', flavor);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [flavor, theme]);

  // v0.32 Platform 대시보드 라우트 (사이드바 셸)
  if (route.startsWith('/platform/')) {
    let platformPage: JSX.Element;
    if (route === '/platform/data') platformPage = <DataStatusPage />;
    else if (route === '/platform/cq') platformPage = <CqManagePage />;
    else if (route === '/platform/ontology') platformPage = <OntologyPage />;
    else if (route === '/platform/graph') platformPage = <GraphPage />;
    else if (route === '/platform/scenario') platformPage = <ScenarioPage />;
    else if (route === '/platform/compare') platformPage = <ComparePage />;
    else if (route === '/platform/plan') platformPage = <PlanPage />;
    else platformPage = <DataStatusPage />;
    return <AppLayout route={route}>{platformPage}</AppLayout>;
  }

  // 기존 라우트 (상단 탭 셸 유지)
  const tweaks = useTweaksStore.getState();

  let page: JSX.Element;
  if (route === '/' || route === '') page = <LandingPage />;
  else if (route === '/scenario/rnd') page = <S4Page key="s4" />;
  else if (route === '/scenario/s6' || route === '/scenario/toluene') page = <S6Page key="s6" />;
  else if (route === '/about/ontology') page = <AboutOntologyPage />;
  else if (route === '/about/data') page = <AboutDataPage />;
  else if (route === '/survey') page = <SurveyPage />;
  else
    page = (
      <div style={{ padding: 80, textAlign: 'center', color: 'var(--axis-text-tertiary)' }}>
        <div style={{ fontSize: 14, marginBottom: 12 }}>
          존재하지 않는 라우트: <code>{route}</code>
        </div>
        <a
          href="#/"
          className="btn"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          홈으로
        </a>
      </div>
    );

  return (
    <div className="app">
      <AppHeader route={route} tweaks={tweaks} />
      <main className="app-main">{page}</main>
      <TweaksPanel />
    </div>
  );
}
