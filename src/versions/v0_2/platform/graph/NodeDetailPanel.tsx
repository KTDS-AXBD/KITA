import type { CytoNode, CytoNodeType, CytoDomain } from '@/types';
import { Badge, SourceBadge } from '@/components/platform';

interface NodeDetailPanelProps {
  node: CytoNode | null;
  connectedCount: number;
  /** F043 E: 빈 상태에서 어느 도메인 그래프인지 안내. */
  domain?: CytoDomain;
  totalNodes?: number;
}

const TYPE_LABEL: Record<CytoNodeType, string> = {
  Event: '이벤트',
  Region: '지역',
  Country: '국가',
  RawMaterial: '원자재',
  IntermediateGoods: '중간재',
  Product: '품목',
  Industry: '산업',
  Company: '기업',
  EWSAlert: 'EWS 경보',
  RnDProject: 'R&D 과제',
  PolicyOption: '대응 옵션',
  TradeRecord: '무역 기록',
  RiskIndicator: '리스크 지표',
};


// F043 E: 도메인별 빈 상태 카피.
const DOMAIN_LABEL: Record<CytoDomain, { title: string; subtitle: string }> = {
  sobujiang: { title: '소부장 공작기계', subtitle: '소재 -> 부품(감속기/베어링/CNC) -> 장비 가치사슬' },
  hormuz: { title: '호르무즈 석유화학', subtitle: '나프타/원유 -> 중간재 -> 완제품 의존 경로' },
};

export function NodeDetailPanel({ node, connectedCount, domain, totalNodes }: NodeDetailPanelProps): JSX.Element {
  if (!node) {
    const meta = domain ? DOMAIN_LABEL[domain] : null;
    return (
      <div
        role="status"
        aria-label="노드 미선택 상태"
        style={{
          width: 260,
          flexShrink: 0,
          padding: '24px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          gap: 14,
          color: 'var(--op-text-tertiary)',
          fontSize: 13,
          textAlign: 'left',
          borderLeft: '1px solid var(--op-border)',
        }}
      >
        {/* 도메인 배지 + 노드 수 */}
        {meta && (
          <div>
            <div
              style={{
                fontFamily: 'var(--op-font-mono)',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 'var(--op-tracking-label)',
                textTransform: 'uppercase',
                color: 'var(--op-text-tertiary)',
                marginBottom: 4,
              }}
            >
              현재 도메인
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--op-text-primary)' }}>
              {meta.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--op-text-tertiary)', marginTop: 4, lineHeight: 1.5 }}>
              {meta.subtitle}
            </div>
            {typeof totalNodes === 'number' && totalNodes > 0 && (
              <div style={{ fontSize: 11, color: 'var(--op-text-tertiary)', marginTop: 8 }}>
                노드 {totalNodes}개 적재 중
              </div>
            )}
          </div>
        )}

        {/* 빈 상태 안내 + 사용 팁 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: '14px 0',
            borderTop: '1px solid var(--op-border)',
            borderBottom: '1px solid var(--op-border)',
            color: 'var(--op-text-tertiary)',
          }}
        >
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
          <span style={{ fontSize: 12, textAlign: 'center', lineHeight: 1.5 }}>
            노드를 클릭하면 상세가 표시됩니다
          </span>
        </div>

        {/* 사용 팁 */}
        <div>
          <div
            style={{
              fontFamily: 'var(--op-font-mono)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 'var(--op-tracking-label)',
              textTransform: 'uppercase',
              color: 'var(--op-text-tertiary)',
              marginBottom: 6,
            }}
          >
            사용 팁
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 11, lineHeight: 1.6, color: 'var(--op-text-secondary)' }}>
            <li>상단 토글로 도메인 전환</li>
            <li>하단 범례 필터로 노드 타입 좁히기</li>
            <li>노드 선택 후 영향 경로 토글</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: 260,
      flexShrink: 0,
      padding: '20px 16px',
      overflowY: 'auto',
      borderLeft: '1px solid var(--op-border)',
      background: 'var(--op-bg-card)',
    }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <Badge variant="draft" label={TYPE_LABEL[node.type] ?? node.type} />
        </div>
        <h3 style={{
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--op-text-primary)',
          whiteSpace: 'pre-line',
          lineHeight: 1.4,
          margin: 0,
        }}>
          {node.label}
        </h3>
      </div>

      <div style={{ borderTop: '1px solid var(--op-border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <DetailRow label="상세">
          <span style={{ whiteSpace: 'pre-line', fontSize: 12, lineHeight: 1.5 }}>{node.detail}</span>
        </DetailRow>

        <DetailRow label="출처">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <SourceBadge source={node.source} />
            {node.dataSource && <span style={{ color: 'var(--op-text-tertiary)' }}>· {node.dataSource}</span>}
          </span>
        </DetailRow>

        {node.lastUpdated && (
          <DetailRow label="갱신일">
            <span style={{ fontSize: 12 }}>{node.lastUpdated}</span>
          </DetailRow>
        )}

        {node.scenarioRole && (
          <DetailRow label="시나리오 역할">
            <span style={{ fontSize: 12, color: 'var(--op-accent)', fontWeight: 600 }}>{node.scenarioRole}</span>
          </DetailRow>
        )}

        <DetailRow label="연결 노드">
          <span style={{ fontSize: 12 }}>{connectedCount}건</span>
        </DetailRow>
      </div>
    </div>
  );
}

// F041: 기존 local SourceBadge는 @/components/platform 공유 컴포넌트로 통합.

function DetailRow({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-accent)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ color: 'var(--op-text-primary)' }}>{children}</div>
    </div>
  );
}
