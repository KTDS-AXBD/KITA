import type { FaqEntry } from '@/components/platform';
import type { PageKey } from '../tour';
import { dataFaq } from './data-faq';
import { cqFaq } from './cq-faq';
import { ontologyFaq } from './ontology-faq';
import { graphFaq } from './graph-faq';
import { scenarioFaq } from './scenario-faq';
import { compareFaq } from './compare-faq';
import { planFaq } from './plan-faq';

export const PAGE_FAQS: Record<PageKey, FaqEntry[]> = {
  data: dataFaq,
  cq: cqFaq,
  ontology: ontologyFaq,
  graph: graphFaq,
  scenario: scenarioFaq,
  compare: compareFaq,
  plan: planFaq,
};
