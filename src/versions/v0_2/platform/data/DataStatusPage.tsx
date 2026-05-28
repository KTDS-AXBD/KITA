import { KpiCard, Badge, DataTable, StatusDot } from '@/components/platform';
import { DATA_SOURCES } from './dataSources';

// F042: KPI 옆 최종 갱신일은 dataSources의 `updated` 최대값에서 산출(드리프트 차단).
// '2026-05' 형식 lexicographic 정렬 = 시간순 정렬과 일치(YYYY-MM).
const LATEST_UPDATED = DATA_SOURCES.map((d) => d.updated)
  .filter((u) => /^\d{4}/.test(u))
  .sort()
  .reverse()[0] ?? 'N/A';

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
        <p>
          27개 데이터소스 · 실 19 / 추정 4 / 유료 4 · 소부장(공작기계) 우선.
          출처 분류는 <strong style={{ color: 'var(--op-text-primary)' }}>⭐실</strong>(GIVC mart·DART·관세청 등 직접 조회 가능 데이터),
          <strong style={{ color: 'var(--op-text-primary)' }}> △추정</strong>(합리적 모델·전문가 판단으로 보완한 값),
          <strong style={{ color: 'var(--op-text-primary)' }}> ※유료</strong>(S&P·Bloomberg 등 상용 라이선스 필요)
          3분류로 시연 신뢰성을 강제합니다.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 10 }}>
        <span
          data-testid="data-latest-updated"
          style={{
            fontFamily: 'var(--op-font-mono)',
            fontSize: 11,
            letterSpacing: 'var(--op-tracking-label)',
            textTransform: 'uppercase',
            color: 'var(--op-text-tertiary)',
          }}
        >
          최종 갱신: {LATEST_UPDATED}
        </span>
        <span style={{ fontSize: 11, color: 'var(--op-text-tertiary)' }}>
          (D1 ingest 기준, koami-givc 파이프라인)
        </span>
      </div>

      {/* F043 G: 4컬럼 하드코딩 → op-kpi-grid(auto-fit minmax) 반응형 */}
      {/* F052: data-tour-id 부착 - KPI 첫번째(총)·두번째(실) 투어 anchor */}
      <div className="op-kpi-grid" style={{ marginBottom: 24 }}>
        {KPI_DATA.map((kpi, i) => (
          <div key={kpi.label} data-tour-id={i === 0 ? 'kpi-total' : i === 1 ? 'kpi-real' : undefined}>
            <KpiCard {...kpi} />
          </div>
        ))}
      </div>

      <div data-tour-id="source-table" style={{ background: 'var(--op-bg-card)', borderRadius: 'var(--op-radius)', border: '1px solid var(--op-border)', overflow: 'hidden', marginBottom: 20 }}>
        <div data-tour-id="status-dot" style={{ padding: '16px 20px', borderBottom: '1px solid var(--op-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--op-text-secondary)', marginRight: 4 }}>구분</span>
          <Badge variant="real" label="실" />
          <Badge variant="estimate" label="추정" />
          <Badge variant="paid" label="유료" />
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--op-text-tertiary)' }}>
            소부장(공작기계) 우선 · 호르무즈 통합
          </span>
        </div>
        {/* F042: max-height + overflow:auto 부여로 thead `position: sticky; top: 0` 효과 작동.
            이전엔 wrapper가 X축만 overflow였고 Y축은 viewport에서 흘러내려 sticky 의도가 무효였다. */}
        <div
          data-testid="data-table-scroll"
          style={{
            maxHeight: '60vh',
            overflow: 'auto',
          }}
        >
          <DataTable columns={COLUMNS} rows={TABLE_ROWS} />
        </div>
      </div>

      {/* F052: 데이터 회신 의향 안내 카드 (투어 마지막 step anchor + 영업 동선) */}
      <div
        data-tour-id="survey-cta"
        style={{
          background: 'var(--op-bg-subtle, #FAFBFC)',
          border: '1px solid var(--op-border)',
          borderRadius: 'var(--op-radius)',
          padding: '14px 18px',
          fontSize: 13,
          color: 'var(--op-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 18 }}>📩</span>
        <span style={{ flex: 1, minWidth: 240 }}>
          추가로 제공 가능한 데이터가 있으시면 시연 후 의향 설문에 회신해주세요. KOAMI 다음 단계 합의의 출발점이 돼요.
        </span>
        <a
          href="#/v1/survey"
          style={{
            color: 'var(--op-brand, #E60012)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 12,
            border: '1px solid var(--op-brand, #E60012)',
            borderRadius: 'var(--op-radius-sm, 4px)',
            padding: '6px 12px',
          }}
        >
          의견 회신 →
        </a>
      </div>
    </div>
  );
}
