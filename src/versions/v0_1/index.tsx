import { useTweaksStore } from '@/store';
import { AppHeader } from '@/shell';
import { TweaksPanel } from '@/components/tweaks/TweaksPanel';
import { LandingPage } from './landing/LandingPage';
import { S4Page } from './rnd/S4Page';
import { S6Page } from './s6/S6Page';
import { AboutOntologyPage, AboutDataPage } from './about';
import { SurveyPage } from './survey';
import type { VersionModule } from '../types';

const OWNED_ROUTES = [
  '/v1',
  '/scenario/rnd',
  '/scenario/s6',
  '/scenario/toluene',
  '/about/ontology',
  '/about/data',
  '/survey',
];

function pageFor(route: string): JSX.Element {
  switch (route) {
    case '/scenario/rnd':
      return <S4Page key="s4" />;
    case '/scenario/s6':
    case '/scenario/toluene':
      return <S6Page key="s6" />;
    case '/about/ontology':
      return <AboutOntologyPage />;
    case '/about/data':
      return <AboutDataPage />;
    case '/survey':
      return <SurveyPage />;
    case '/v1':
    default:
      return <LandingPage />;
  }
}

export const v01: VersionModule = {
  meta: {
    id: 'v0.1',
    badge: 'v0.1',
    title: '기존 PoC 데모',
    subtitle: 'GIVC × Ontology PoC',
    desc: '가중치 슬라이더 실시간 재계산 중심의 초기 시연 버전.',
    features: [
      'S4 · 소부장 자립화 R&D 적합 기업 추천 (가중치 슬라이더)',
      'S6 · 공작기계 핵심 품목 가치사슬 가시화',
      '온톨로지 개념 · 데이터 출처',
      '의견 회신 설문',
    ],
    accent: '#3B82F6',
    mode: 'light',
    home: '/v1',
    cta: '기존 데모 열기',
  },
  ownsRoute: (route) => OWNED_ROUTES.includes(route),
  // v0.1 셸 = 상단 탭(AppHeader) + Tweaks 패널 (AXIS 디자인)
  render: (route) => {
    const tweaks = useTweaksStore.getState();
    return (
      <div className="app">
        <AppHeader route={route} tweaks={tweaks} />
        <main className="app-main">{pageFor(route)}</main>
        <TweaksPanel />
      </div>
    );
  },
};
