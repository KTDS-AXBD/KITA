import { Timeline } from '@/components/platform';
import { CQ_ITEMS as CQ_SSOT } from '../cq/cqData';
import { withComputedStatus, type PhaseDef } from './phaseStatus';

// F042: status는 today 기준 자동 계산(stale 차단).
// 이전 하드코딩(Phase 0=done·Phase 1=active)이 5/28 시점에서 잘못 표시됨.
// 일정만 PhaseDef로 정의하고 status는 phaseStatus.withComputedStatus가 산출.
const PHASE_DEFS: PhaseDef[] = [
  { phase: 'Phase 0', label: '준비', date: '5/26~5/30' },
  { phase: 'Phase 1', label: '시나리오 확정', date: '6/2~6/6' },
  { phase: 'Phase 2', label: 'KG 구축', date: '6/9~6/13' },
  { phase: 'Phase 3', label: '시연 준비', date: '6/16~6/20' },
  { phase: 'Phase 4', label: '리뷰', date: '6/23~6/27' },
];

const PLAN_YEAR = 2026;
const PHASES = withComputedStatus(PHASE_DEFS, new Date(), PLAN_YEAR);

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
  sid?: string;
}

// SSOT 일원화: CQ 정의는 cq/cqData.ts(CQ_SSOT)에서 파생한다.
// (이전엔 PlanPage가 자체 CQ 배열을 들고 있어 CQ-003~007 문구가 cqData와 어긋났다. F040에서 폐기.)
const CQ_ITEMS: CqItem[] = CQ_SSOT.map((c) => ({
  id: c.id,
  text: c.question,
  tier: c.tier,
  sid: c.scenarioSid,
}));

// Tier 1(시연 대상) 우선 노출. Tier 1 안에서는 MAIN(CQ-002)을 앞세운다.
const tier1 = CQ_ITEMS.filter((c) => c.tier === 1).sort((a) => (a.id === 'CQ-002' ? -1 : 0));
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
        Tier {tier} · {tier === 1 ? '시연 대상' : '고객 확인 후 추가'}
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
          {cq.sid && (
            <span
              style={{
                fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 3,
                background: '#E8ECF1', color: '#666', flexShrink: 0, marginTop: 1,
              }}
            >
              {cq.sid}
            </span>
          )}
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
        data-tour-id="phase-timeline"
        style={{
          background: 'var(--op-bg-card)',
          borderRadius: 'var(--op-radius)',
          border: '1px solid var(--op-border)',
          padding: '28px 32px',
          marginBottom: 28,
        }}
      >
        <Timeline items={PHASES} />
        {/* 단계 설명 - Timeline 컴포넌트 확장 없이 인라인으로
            F045: 5컬럼 -> auto-fit minmax(120, 1fr) 반응형. Phase 5 설명 좁은 폭에서 자동 wrap. */}
        <div
          data-tour-id="plan-phases"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
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
      <div data-tour-id="cq-tier-list">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--op-text-primary)' }}>
          Competency Question 목록
        </h3>
        <CqSection tier={1} items={tier1} />
        <CqSection tier={2} items={tier2} />
      </div>

      {/* 푸터 */}
      <div
        data-tour-id="footer-contact"
        style={{
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--op-text-tertiary)',
          padding: '24px 0 16px',
          borderTop: '1px solid var(--op-border)',
          marginTop: 32,
        }}
      >
        KT DS Enterprise사업본부 AX컨설팅팀 &nbsp;|&nbsp; 2026
      </div>
    </div>
  );
}
