import { Sidebar } from './Sidebar';
import { HeaderBar } from './HeaderBar';

interface AppLayoutProps {
  route: string;
  children: React.ReactNode;
}

export function AppLayout({ route, children }: AppLayoutProps): JSX.Element {
  return (
    <div className="op-app-layout">
      <Sidebar route={route} />
      <div className="op-main-area">
        <HeaderBar route={route} />
        <div className="op-page-content">{children}</div>
      </div>
    </div>
  );
}
