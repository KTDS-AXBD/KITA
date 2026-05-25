import { ProvenanceLegend } from '@/components/primitives';

interface CatalogRow {
  ns: string;
  type: '⭐ 실' | '△ 추정' | '※ 가상';
  use: string;
  usage: string;
}

const CATALOG: CatalogRow[] = [
  { ns: 'mart.lnk0951a', type: '⭐ 실', use: '품목·HS코드 연결, S6 공작기계 가치사슬 그래프', usage: 'S6 중앙 그래프, KPI 수출입' },
  { ns: 'mart.lnk0951a.itemcode', type: '⭐ 실', use: 'HS코드 분류', usage: 'S6 HS노드' },
  { ns: 'scmm_his_chart', type: '⭐ 실', use: 'R&D 투자·부도율 시계열', usage: 'S4 지표 노드 (R&D, 리스크)' },
  { ns: '  └ itmrnd0001010', type: '⭐ 실', use: 'R&D 투자 증가율', usage: 'S4 가중치 슬라이더 [R&D]' },
  { ns: '  └ itm_flt_implpd', type: '⭐ 실', use: '부도율', usage: 'S4 반대 추천 D 패널' },
  { ns: 'enp0111y', type: '⭐ 실', use: '기업 매출·고용·산업 분류', usage: 'S4·S6 기업표' },
  { ns: '  └ salesGrowth', type: '⭐ 실', use: '매출 성장률', usage: 'S4 가중치 [매출]' },
  { ns: '특허청 API', type: '※ 가상', use: '특허 출원수 (가상값)', usage: 'S4 가중치 [특허]' },
  {
    ns: '산기평 공고 API',
    type: '※ 가상',
    use: 'R&D 공고 텍스트',
    usage: 'S4 매칭 정확도 (Hint h_rndcall 활성화 시 +23%p)',
  },
  { ns: '전후방 매핑', type: '※ 가상', use: '품목별 전후방 1단계 매핑', usage: 'S6 전후방 노드 (Hint h_supply)' },
  { ns: '실시간 뉴스', type: '※ 가상', use: '품목 단위 매칭 뉴스', usage: 'S6 워드클라우드, 위험 알림' },
  { ns: '인력 이동', type: '※ 가상', use: '핵심 연구인력 이동·재직', usage: 'S4 Hint h_movement' },
];

const RATIO = [
  { mark: '⭐ 실데이터', count: '7', pct: '58%', color: 'var(--axis-color-green-50)', stroke: 'var(--axis-color-green-300)' },
  { mark: '△ 추정', count: '1', pct: '8%', color: 'var(--axis-color-yellow-50)', stroke: 'var(--axis-color-yellow-300)' },
  { mark: '※ 가상', count: '4', pct: '34%', color: 'var(--axis-color-gray-100)', stroke: 'var(--axis-color-gray-300)' },
];

function typeColor(type: CatalogRow['type']): string {
  if (type.includes('실')) return 'var(--axis-color-green-700)';
  if (type.includes('추정')) return 'var(--axis-color-yellow-700)';
  return 'var(--axis-color-gray-600)';
}

export function AboutDataPage(): JSX.Element {
  return (
    <div className="article-wrap">
      <div className="article-eyebrow">About · Data Sources</div>
      <h1>사용 데이터 출처 — 실 / 추정 / 가상 구분</h1>
      <p className="article-lead">
        모든 노드·셀·차트에 ⭐ (실데이터) / △ (추정) / ※ (가상) 표기가 부착되어 있습니다. 본
        페이지는 데이터 표기 규칙 (2026-05-21 합의) 의 전체 카탈로그입니다.
      </p>

      <ProvenanceLegend />

      <h2>1 · 데이터 카탈로그</h2>
      <table className="article-table">
        <thead>
          <tr>
            <th style={{ width: 240 }}>테이블 · 컬럼</th>
            <th style={{ width: 90 }}>구분</th>
            <th>설명</th>
            <th>사용처</th>
          </tr>
        </thead>
        <tbody>
          {CATALOG.map((t, i) => (
            <tr key={i}>
              <td style={{ fontFamily: 'var(--axis-font-mono)', fontSize: 12 }}>{t.ns}</td>
              <td>
                <span
                  style={{
                    fontFamily: 'var(--axis-font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: typeColor(t.type),
                  }}
                >
                  {t.type}
                </span>
              </td>
              <td style={{ fontSize: 13 }}>{t.use}</td>
              <td style={{ fontSize: 12.5, color: 'var(--axis-text-secondary)' }}>{t.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>2 · 시연 시 가상 데이터 처리 원칙</h2>
      <ul>
        <li>
          <strong>모든 가상값에 ※ 점선 박스 표기</strong> — 시연 청중이 한눈에 구분 가능
        </li>
        <li>
          <strong>tooltip에 출처·테이블·컬럼 명시</strong> — 노드 hover 시 즉시 노출
        </li>
        <li>
          <strong>가상 → 실 전환 시뮬레이션</strong> — 우측 Hints 토글 시 결과가 변하는 모습으로
          "실데이터 추가 효과" 직접 체감
        </li>
        <li>
          <strong>실값과 가상값을 섞지 않음</strong> — 한 차트 내 혼합 시 항상 표기로 구분
        </li>
      </ul>

      <h2>3 · 본 데모의 데이터 혼합 비율</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, margin: '14px 0' }}>
        {RATIO.map((b, i) => (
          <div
            key={i}
            style={{
              padding: 18,
              background: b.color,
              border: `1px solid ${b.stroke}`,
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>{b.mark}</div>
            <div
              style={{
                fontFamily: 'var(--axis-font-mono)',
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              {b.count}
            </div>
            <div style={{ fontSize: 11, color: 'var(--axis-text-secondary)' }}>
              총 12 데이터 소스 중 · {b.pct}
            </div>
          </div>
        ))}
      </div>

      <h2>4 · 데이터 확장 path</h2>
      <p>
        본 사업화 시 가상 데이터(※)는 우선순위에 따라 실 또는 추정 데이터로 전환됩니다. Sprint
        2~3에서 GIVC 일부 테이블의 정적 export를 사이트 임베드 → 본 사업화 v1에서 API/ETL 연동.
      </p>
    </div>
  );
}
