import { Timeline } from '@/components/platform';
import type { TimelineItem } from '@/components/platform';

const PHASES: TimelineItem[] = [
  { phase: 'Phase 0', label: '데이터 수집 · 온톨로지 설계', date: '5/26~6/1', status: 'done' },
  { phase: 'Phase 1', label: 'GIVC Ontology Platform 구축', date: '6/2~6/8', status: 'active' },
  { phase: 'Phase 2', label: '지식그래프 + 시나리오 분석', date: '6/9~6/15', status: 'upcoming' },
  { phase: 'Phase 3', label: '통합 검증 + 성능 최적화', date: '6/16~6/22', status: 'upcoming' },
  { phase: 'Phase 4', label: '고객 Prototype 리뷰 시연', date: '6/23~6/27', status: 'upcoming' },
];

export function PlanPage(): JSX.Element {
  return (
    <div className="op-page">
      <div className="op-section-header">
        <h2>추진 계획</h2>
        <p>Phase 0~4 로드맵 · 6월 고객 Prototype 리뷰 마감</p>
      </div>
      <div style={{ background: 'var(--op-bg-card)', borderRadius: 'var(--op-radius)', border: '1px solid var(--op-border)', padding: '28px 32px', marginBottom: 20 }}>
        <Timeline items={PHASES} />
      </div>
      <div className="op-placeholder">
        CQ Tier1/Tier2 목록·푸터 상세 — Sprint 17(F037)에서 구현 예정
      </div>
    </div>
  );
}
