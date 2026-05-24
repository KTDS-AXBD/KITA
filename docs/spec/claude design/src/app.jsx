// ============================================================
// App entry — wires routing, tweaks, theme
// ============================================================

const { useState, useEffect, useMemo } = React;
const { AppHeader, useHashRoute, navigate,
        LandingPage, S4Page, S6Page, AboutOntologyPage, AboutDataPage,
        TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle, TweakSelect } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "flavor": "classic",
  "theme": "light",
  "hintsPosition": "right",
  "top5Layout": "table",
  "langMode": "ko"
}/*EDITMODE-END*/;

const App = () => {
  const route = useHashRoute();
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // apply theme + flavor on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-style', t.flavor || 'classic');
    if (t.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [t.flavor, t.theme]);

  // ---- route resolution ----
  let page;
  if (route === '/' || route === '') page = <LandingPage tweaks={t} />;
  else if (route === '/scenario/rnd')     page = <S4Page tweaks={t} key="s4" />;
  else if (route === '/scenario/toluene') page = <S6Page tweaks={t} key="s6" />;
  else if (route === '/about/ontology')   page = <AboutOntologyPage />;
  else if (route === '/about/data')       page = <AboutDataPage />;
  else page = (
    <div style={{ padding: 80, textAlign: 'center', color: 'var(--axis-text-tertiary)' }}>
      <div style={{ fontSize: 14, marginBottom: 12 }}>존재하지 않는 라우트: <code>{route}</code></div>
      <a href="#/" className="btn">홈으로</a>
    </div>
  );

  return (
    <div className="app">
      <AppHeader route={route} tweaks={t} />
      <main className="app-main">{page}</main>

      <TweaksPanel title="Tweaks · 디자인 변형">
        <TweakSection label="플레이버">
          <TweakRadio label="AXIS Flavor"
                      value={t.flavor || 'classic'}
                      options={[{ value: 'classic', label: 'Classic 블루' }, { value: 'foundry', label: 'Foundry 옐로' }]}
                      onChange={(v) => setTweak('flavor', v)} />
        </TweakSection>

        <TweakSection label="테마">
          <TweakRadio label="Theme"
                      value={t.theme || 'light'}
                      options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
                      onChange={(v) => setTweak('theme', v)} />
        </TweakSection>

        <TweakSection label="레이아웃">
          <TweakSelect label="Data Expansion Hints 위치"
                       value={t.hintsPosition || 'right'}
                       options={[
                         { value: 'right',  label: '우측 영구 (기획서)' },
                         { value: 'bottom', label: '하단 띠' },
                         { value: 'modal',  label: '모달 (Hint 버튼)' }
                       ]}
                       onChange={(v) => setTweak('hintsPosition', v)} />
          <TweakRadio label="Top 5"
                      value={t.top5Layout || 'table'}
                      options={[{ value: 'table', label: '표' }, { value: 'card', label: '카드' }]}
                      onChange={(v) => setTweak('top5Layout', v)} />
        </TweakSection>

        <TweakSection label="언어">
          <TweakRadio label="Header 라벨"
                      value={t.langMode || 'ko'}
                      options={[{ value: 'ko', label: '한국어' }, { value: 'en', label: 'EN' }]}
                      onChange={(v) => setTweak('langMode', v)} />
          <div style={{ fontSize: 11, color: 'var(--axis-text-tertiary)', lineHeight: 1.5, marginTop: 4 }}>
            시연 대상이 일본 등일 가능성 대비. 본 시연은 한국어가 기본.
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
