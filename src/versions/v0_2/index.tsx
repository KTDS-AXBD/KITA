import { AppLayout } from '@/shell';
import { DataStatusPage } from './platform/data/DataStatusPage';
import { CqManagePage } from './platform/cq/CqManagePage';
import { OntologyPage } from './platform/ontology/OntologyPage';
import { GraphPage } from './platform/graph/GraphPage';
import { ScenarioPage } from './platform/scenario/ScenarioPage';
import { ComparePage } from './platform/compare/ComparePage';
import { PlanPage } from './platform/plan/PlanPage';
import { PageNav } from './platform/PageNav';
import type { VersionModule } from '../types';

function pageFor(route: string): JSX.Element {
  switch (route) {
    case '/platform/cq':
      return <CqManagePage />;
    case '/platform/ontology':
      return <OntologyPage />;
    case '/platform/graph':
      return <GraphPage />;
    case '/platform/scenario':
      return <ScenarioPage />;
    case '/platform/compare':
      return <ComparePage />;
    case '/platform/plan':
      return <PlanPage />;
    case '/platform/data':
    default:
      return <DataStatusPage />;
  }
}

export const v02: VersionModule = {
  meta: {
    id: 'v0.2',
    badge: 'v0.2',
    title: 'GIVC Ontology Platform',
    subtitle: '온톨로지 엔지니어링 방법론 쇼케이스',
    desc: '데이터 → CQ → 온톨로지 → 그래프 → 시나리오 → 비교 → 계획, 7페이지 대시보드.',
    features: [
      '데이터 현황 · CQ 관리 · 온톨로지 정의',
      '지식그래프 (cytoscape) · 도메인 토글',
      '시나리오 분석 (5단계 그래프 추론)',
      '비교 검증 · 추진 계획',
    ],
    accent: '#E60012',
    mode: 'light',
    home: '/platform/data',
    cta: '플랫폼 진입',
    latest: true,
  },
  ownsRoute: (route) => route.startsWith('/platform/'),
  // F042: PageNav를 AppLayout 안에서 페이지 본문 뒤에 일괄 부착.
  // 7페이지 각각이 PageNav를 import할 필요 없이, 셸 레벨에서 currentRoute 기반 자동 표시.
  render: (route) => (
    <AppLayout route={route}>
      {pageFor(route)}
      <PageNav currentRoute={route} />
    </AppLayout>
  ),
};
