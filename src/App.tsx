import { useEffect } from 'react';
import { useTweaksStore } from '@/store';
import { useHashRoute, AppHeader } from '@/shell';
import { LandingPage } from '@/features/landing/LandingPage';
import { S4Page } from '@/features/rnd/S4Page';
import { S6Page } from '@/features/s6/S6Page';
import { AboutOntologyPage, AboutDataPage } from '@/features/about';
import { SurveyPage } from '@/features/survey';
import { TweaksPanel } from '@/components/tweaks/TweaksPanel';
import { navigate } from '@/shell';

export default function App(): JSX.Element {
  const route = useHashRoute();
  const flavor = useTweaksStore((s) => s.flavor);
  const theme = useTweaksStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-style', flavor);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [flavor, theme]);

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
