import { Timeline } from '@/components/platform';
import type { TimelineItem } from '@/components/platform';

const PHASES: TimelineItem[] = [
  { phase: 'Phase 0', label: '준비', date: '5/26~5/30', status: 'done' },
  { phase: 'Phase 1', label: '시나리오 확정', date: '6/2~6/6', status: 'active' },
  { phase: 'Phase 2', label: 'KG 구축', date: '6/9~6/13', status: 'upcoming' },
  { phase: 'Phase 3', label: '시연 준비', date: '6/16~6/20', status: 'upcoming' },
  { phase: 'Phase 4', label: '리뷰', date: '6/23~6/27', status: 'upcoming' },
];

const PHASE_DESCS: Record<string, string> = {
  'Phase 0': 'CQ 질의서 발송 · 데이터 수집 착수',
  'Phase 1': 'CQ 회신 분석 · 데이터 정제/스키마 확정',
  'Phase 2': 'Neo4j 구축 · CQ 검증',
  'Phase 3': 'UI 구현 · 비교 검증',
  'Phase 4': '내부 리허설 · 고객 Prototype 리뷰',
};

interface CqItem {
  id: string;
  text: string;
  tier: 1 | 2;
}

const CQ_ITEMS: CqItem[] = [
  { id: 'CQ-002', text: '소부장 자립화 R&D 적합 기업 Top 5 + 선정 근거 + 반대 추천', tier: 1 },
  { id: 'CQ-001', text: '호르무즈 봉쇄 시 영향 품목 + 인과 경로', tier: 1 },
  { id: 'CQ-003', text: '특정 HS코드 품목의 수입 의존 국가 및 대체 가능 국가', tier: 2 },
  { id: 'CQ-004', text: '특정 기업의 원자재 의존도 및 원가 영향 시뮬레이션', tier: 2 },
  { id: 'CQ-005', text: 'EWS 경보 발령 시 후방 영향 전파 경로 및 시간', tier: 2 },
  { id: 'CQ-006', text: 'R&D/특허 기반 국산화 가능 품목 식별', tier: 2 },
  { id: 'CQ-007', text: '산업 간 전파 경로 — 소부장 → 공작기계 → 수출 영향', tier: 2 },
];

const tier1 = CQ_ITEMS.filter((c) => c.tier === 1);
const tier2 = CQ_ITEMS.filter((c) => c.tier === 2);

const TIER_LABEL_STYLE = (t: 1 | 2): React.CSSProperties => ({
  display: 'inline-block',
  fontSize: 11,
  fontWeight: 700,
  padding: '3px 10px',
  borderRadius: 12,
  marginBottom: 12,
  ...(t === 1
    ? { background: 'var(--op-accent)', color: '#FFFFFF' }
    : { background: '#E8ECF1', color: '#666666' }),
});

function CqSection({ tier, items }: { tier: 1 | 2; items: CqItem[] }): JSX.Element {
  return (
    <div
      style={{
        background: 'var(--op-bg-card)',
        borderRadius: 'var(--op-radius)',
        border: '1px solid var(--op-border)',
        padding: '16px 20px',
        marginBottom: 12,
      }}
    >
      <div style={TIER_LABEL_STYLE(tier)}>
        Tier {tier} — {tier === 1 ? '시연 대상' : '고객 확인 후 추가'}
      </div>
      {items.map((cq, i) => (
        <div
          key={cq.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '10px 0',
            borderBottom: i < items.length - 1 ? '1px solid var(--op-border)' : 'none',
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              minWidth: 52,
              color: tier === 1 ? 'var(--op-accent)' : '#AAAAAA',
              flexShrink: 0,
            }}
          >
            {cq.id}
          </span>
          <span style={{ fontSize: 13, color: 'var(--op-text-primary)', lineHeight: 1.5 }}>{cq.text}</span>
        </div>
      ))}
    </div>
  );
}

export function PlanPage(): JSX.Element {
  return (
    <div className="op-page">
      <div className="op-section-header">
        <h2>추진 계획</h2>
        <p>6월 Prototype 리뷰까지</p>
      </div>

      {/* 타임라인 */}
      <div
        style={{
          background: 'var(--op-bg-card)',
          borderRadius: 'var(--op-radius)',
          border: '1px solid var(--op-border)',
          padding: '28px 32px',
          marginBottom: 28,
        }}
      >
        <Timeline items={PHASES} />
        {/* 단계 설명 — Timeline 컴포넌트 확장 없이 인라인으로 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 8,
            marginTop: 20,
            paddingTop: 20,
            borderTop: '1px solid var(--op-border)',
          }}
        >
          {PHASES.map((p) => (
            <div key={p.phase} style={{ fontSize: 11, color: 'var(--op-text-tertiary)', lineHeight: 1.6 }}>
              {PHASE_DESCS[p.phase]}
            </div>
          ))}
        </div>
      </div>

      {/* CQ 목록 */}
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--op-text-primary)' }}>
        Competency Question 목록
      </h3>
      <CqSection tier={1} items={tier1} />
      <CqSection tier={2} items={tier2} />

      {/* 푸터 */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--op-text-tertiary)',
          padding: '24px 0 16px',
          borderTop: '1px solid var(--op-border)',
          marginTop: 32,
        }}
      >
        KT DS AX컨설팅팀 &nbsp;|&nbsp; 2026
      </div>
    </div>
  );
}
