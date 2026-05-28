import type { CytoNode, CytoNodeType } from '@/types';
import { Badge, SourceBadge } from '@/components/platform';

interface NodeDetailPanelProps {
  node: CytoNode | null;
  connectedCount: number;
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


export function NodeDetailPanel({ node, connectedCount }: NodeDetailPanelProps): JSX.Element {
  if (!node) {
    return (
      <div style={{
        width: 260,
        flexShrink: 0,
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: 'var(--op-text-tertiary)',
        fontSize: 13,
        textAlign: 'center',
        borderLeft: '1px solid var(--op-border)',
      }}>
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
        </svg>
        <span>노드를 클릭하면<br />상세 정보가 표시됩니다</span>
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
