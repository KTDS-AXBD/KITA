import { KpiCard, Badge, DataTable, StatusDot } from '@/components/platform';
import { DATA_SOURCES } from './dataSources';

const KPI_DATA = [
  { label: '총 데이터소스', value: 27, sub: '소부장 우선 정렬' },
  { label: '실 데이터', value: 19, sub: '공개 API · DART · 관세청', accentColor: '#111111' },
  { label: '추정 데이터', value: 4, sub: '합리적 추론값' },
  { label: '유료 데이터', value: 4, sub: 'S&P · Bloomberg · etc.' },
];

const COLUMNS = [
  { key: 'status', label: '상태', width: '80px' },
  { key: 'id', label: '#', width: '32px' },
  { key: 'name', label: '데이터명', width: '160px' },
  { key: 'badge', label: '구분', width: '60px' },
  { key: 'source', label: '출처' },
  { key: 'usage', label: '활용 영역' },
  { key: 'method', label: '수집 방법' },
  { key: 'updated', label: '최종 갱신', width: '80px' },
];

const SORTED_SOURCES = [...DATA_SOURCES].sort((a, b) => {
  const order = { sobujiang: 0, both: 1, hormuz: 2 };
  return order[a.domain] - order[b.domain];
});

const TABLE_ROWS = SORTED_SOURCES.map((ds) => ({
  status: <StatusDot status={ds.status} />,
  id: <span style={{ color: 'var(--op-text-tertiary)', fontSize: 12 }}>{ds.id}</span>,
  name: <span style={{ fontWeight: 600, fontSize: 13 }}>{ds.name}</span>,
  badge: <Badge variant={ds.badge} />,
  source: <span style={{ fontSize: 12, color: 'var(--op-text-secondary)' }}>{ds.source}</span>,
  usage: <span style={{ fontSize: 12 }}>{ds.usage}</span>,
  method: <span style={{ fontSize: 12, color: 'var(--op-text-secondary)' }}>{ds.method}</span>,
  updated: <span style={{ fontSize: 12, color: 'var(--op-text-tertiary)' }}>{ds.updated}</span>,
}));

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
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--op-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--op-text-secondary)', marginRight: 4 }}>구분</span>
          <Badge variant="real" label="실" />
          <Badge variant="estimate" label="추정" />
          <Badge variant="paid" label="유료" />
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--op-text-tertiary)' }}>
            소부장(공작기계) 우선 · 호르무즈 통합
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <DataTable columns={COLUMNS} rows={TABLE_ROWS} />
        </div>
      </div>
    </div>
  );
}
