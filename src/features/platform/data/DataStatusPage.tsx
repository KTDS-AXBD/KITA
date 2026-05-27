import { KpiCard, Badge } from '@/components/platform';

const KPI_DATA = [
  { label: '총 데이터소스', value: 27, sub: '소부장 우선 정렬' },
  { label: '실 데이터', value: 19, sub: '공개 API · DART · 관세청', accentColor: '#111111' },
  { label: '추정 데이터', value: 4, sub: '합리적 추론값' },
  { label: '유료 데이터', value: 4, sub: 'S&P · Bloomberg · etc.' },
];

export function DataStatusPage(): JSX.Element {
  return (
    <div className="op-page">
      <div className="op-section-header">
        <h2>데이터 현황</h2>
        <p>27개 데이터소스 · 실 19 / 추정 4 / 유료 4 · 소부장(공작기계) 우선</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {KPI_DATA.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div style={{ background: 'var(--op-bg-card)', borderRadius: 'var(--op-radius)', border: '1px solid var(--op-border)', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--op-border)', display: 'flex', gap: 8 }}>
          <Badge variant="real" />
          <Badge variant="estimate" />
          <Badge variant="paid" />
        </div>
        <div className="op-placeholder" style={{ border: 'none', borderRadius: 0 }}>
          데이터소스 현황표 — Sprint 17(F031)에서 구현 예정
        </div>
      </div>
    </div>
  );
}
