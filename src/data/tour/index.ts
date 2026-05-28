import type { TourStep } from '@/components/platform';
import { dataTourSteps } from './data-tour';
import { cqTourSteps } from './cq-tour';
import { ontologyTourSteps } from './ontology-tour';
import { graphTourSteps } from './graph-tour';
import { scenarioTourSteps } from './scenario-tour';
import { compareTourSteps } from './compare-tour';
import { planTourSteps } from './plan-tour';

export type PageKey = 'data' | 'cq' | 'ontology' | 'graph' | 'scenario' | 'compare' | 'plan';

/**
 * 라우트 -> PageKey 매핑. AppLayout/HeaderBar/HelpChatbot 공용.
 * /platform/* 만 매핑 (v0.1 라우트는 본 트랙 범위 밖, F052/F053).
 */
export const ROUTE_TO_PAGE_KEY: Record<string, PageKey> = {
  '/platform/data': 'data',
  '/platform/cq': 'cq',
  '/platform/ontology': 'ontology',
  '/platform/graph': 'graph',
  '/platform/scenario': 'scenario',
  '/platform/compare': 'compare',
  '/platform/plan': 'plan',
};

export const PAGE_LABELS: Record<PageKey, string> = {
  data: '데이터 현황',
  cq: 'CQ 관리',
  ontology: '온톨로지 정의',
  graph: '지식그래프',
  scenario: '시나리오 분석',
  compare: '비교 검증',
  plan: '추진 계획',
};

export const TOUR_STEPS: Record<PageKey, TourStep[]> = {
  data: dataTourSteps,
  cq: cqTourSteps,
  ontology: ontologyTourSteps,
  graph: graphTourSteps,
  scenario: scenarioTourSteps,
  compare: compareTourSteps,
  plan: planTourSteps,
};

export function getPageKey(route: string): PageKey | null {
  return ROUTE_TO_PAGE_KEY[route] ?? null;
}
