import { useEffect } from 'react';
import { useTweaksStore } from '@/store';
import { useHashRoute, navigate } from '@/shell';
import { getLatestVersion, findVersionByRoute } from '@/versions/registry';
import { VersionSelectPage } from '@/versions/select/VersionSelectPage';

export default function App(): JSX.Element {
  const route = useHashRoute();
  const flavor = useTweaksStore((s) => s.flavor);
  const theme = useTweaksStore((s) => s.theme);

  const isSelect = route === '/select';
  // 루트(/·'')는 최신 버전을 자동 표시 (선택기는 /select)
  const targetRoute = route === '/' || route === '' ? getLatestVersion().meta.home : route;
  const version = isSelect ? undefined : findVersionByRoute(targetRoute);
  const versionId = version?.meta.id ?? 'select';

  // 활성 버전에 따라 디자인 테마 스코프 활성화 ([data-version])
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute('data-version', versionId);
    el.setAttribute('data-style', flavor);
    el.classList.toggle('dark', theme === 'dark');
  }, [versionId, flavor, theme]);

  if (isSelect) return <VersionSelectPage />;
  if (version) return <>{version.render(targetRoute)}</>;

  // 알 수 없는 라우트
  return (
    <div style={{ padding: 80, textAlign: 'center', color: '#767b85' }}>
      <div style={{ fontSize: 14, marginBottom: 12 }}>
        존재하지 않는 라우트: <code>{route}</code>
      </div>
      <a
        href="#/select"
        className="btn"
        onClick={(e) => {
          e.preventDefault();
          navigate('/select');
        }}
      >
        버전 선택으로
      </a>
    </div>
  );
}
