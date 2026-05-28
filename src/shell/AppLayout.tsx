import { Sidebar } from './Sidebar';
import { HeaderBar } from './HeaderBar';
import { HelpChatbot, SpotlightTour, useTour } from '@/components/platform';
import { getPageKey, PAGE_LABELS, TOUR_STEPS } from '@/data/tour';
import { PAGE_FAQS } from '@/data/chatbot';

interface AppLayoutProps {
  route: string;
  children: React.ReactNode;
}

export function AppLayout({ route, children }: AppLayoutProps): JSX.Element {
  const pageKey = getPageKey(route);

  return (
    <div className="op-app-layout">
      <Sidebar route={route} />
      <div className="op-main-area">
        <HeaderBar route={route} />
        <div className="op-page-content">{children}</div>
      </div>
      {/* F052 + F053: pageKey가 매핑된 /platform/* 라우트에서만 자력 데모 UX 활성화 */}
      {pageKey && (
        <PlatformAssist
          pageKey={pageKey}
          pageLabel={PAGE_LABELS[pageKey]}
        />
      )}
    </div>
  );
}

interface PlatformAssistProps {
  pageKey: 'data' | 'cq' | 'ontology' | 'graph' | 'scenario' | 'compare' | 'plan';
  pageLabel: string;
}

/**
 * F052 SpotlightTour + F053 HelpChatbot 통합 마운트 컴포넌트.
 * pageKey가 바뀌면 새 훅 인스턴스 -> 페이지별 독립 동작.
 */
function PlatformAssist({ pageKey, pageLabel }: PlatformAssistProps): JSX.Element {
  const tour = useTour(pageKey);
  const steps = TOUR_STEPS[pageKey];
  const faqs = PAGE_FAQS[pageKey];
  return (
    <>
      <SpotlightTour steps={steps} open={tour.open} onClose={tour.onClose} />
      <HelpChatbot pageKey={pageKey} pageLabel={pageLabel} faqs={faqs} />
    </>
  );
}
