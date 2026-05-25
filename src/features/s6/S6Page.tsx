import { useState } from 'react';
import { useHintsStore, useGvcDomainStore } from '@/store';
import { ChatGivcQueryPane } from './ChatGivcQueryPane';
import { s6Repository } from '@/data/repository';
import {
  Card,
  Badge,
  KpiStrip,
  Callout,
  ProvenanceLegend,
  DataExpansionHints,
} from '@/components/primitives';
import { DataMark } from '@/components/DataMark';
import { KGraph } from '@/components/KGraph';
import { Search, Settings } from '@/components/icons';
import { TradeChart } from './TradeChart';
import { WordCloud } from './WordCloud';
import { AnomalyPanel } from './AnomalyPanel';
import { DomainToggle } from './DomainToggle';
import { GvcPane } from './GvcPane';
import { GvcIntegration } from './GvcIntegration';

const PRODUCT_OPTIONS = ['머시닝센터', 'NC선반', '정밀 감속기', '정밀 베어링'];
const ACTIVE_OPTION = '머시닝센터';

export function S6Page(): JSX.Element {
  const activeHints = useHintsStore((s) => s.s6);
  const toggleHint = useHintsStore((s) => s.toggleS6);
  const [hoverRowId, setHoverRowId] = useState<string | null>(null);
  const activeDomain = useGvcDomainStore((s) => s.activeDomain);
  const [givcTab, setGivcTab] = useState<'analysis' | 'query'>('analysis');

  const product = s6Repository.getProduct();
  const trade = s6Repository.getTradeSeries();
  const companies = s6Repository.listCompanies();
  const kpis = s6Repository.getKpis();
  const wordcloud = s6Repository.getWordcloud();
  const hints = s6Repository.listHints();
  const graph = s6Repository.getPositionedGraph();

  return (
    <>
      <div className="page-band">
        <div className="page-band-inner">
          <div>
            <div className="label">서브 시연 · S6 · 가치사슬</div>
            <h1>공작기계 핵심 품목 가치사슬 가시화</h1>
            <div className="page-band-sub">
              복잡한 추천 로직 없이도 GIVC가 보유한 핵심 품목 정보를 소재→부품→장비 가치사슬 지식그래프로 합치는 것만으로
              KOAMI 소부장 가치사슬 분석의 "창 띄웠다 끄는" 페인이 해결됩니다.
            </div>
          </div>
          <div className="page-band-right">
            <Badge kind="info">
              <Settings size={11} /> {product.hsCode}
            </Badge>
            <Badge kind="default">{product.ksic}</Badge>
          </div>
        </div>
      </div>

      <div className="scenario-layout">
        <aside className="col-left">
          <Card title="품목 검색" sub="Combobox · 프리셋">
            <div className="field">
              <label className="field-label">품목명</label>
              <div style={{ position: 'relative' }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: 11,
                    color: 'var(--axis-text-tertiary)',
                  }}
                />
                <input
                  className="input"
                  value={product.name}
                  readOnly
                  style={{ paddingLeft: 30 }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {PRODUCT_OPTIONS.map((p) => (
                <button
                  key={p}
                  className="btn btn-sm"
                  style={{ justifyContent: 'flex-start', opacity: p === ACTIVE_OPTION ? 1 : 0.55 }}
                >
                  {p === ACTIVE_OPTION && (
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        background: 'var(--axis-color-blue-600)',
                        borderRadius: 100,
                      }}
                    ></span>
                  )}
                  <span style={{ marginLeft: p === ACTIVE_OPTION ? 0 : 8 }}>{p}</span>
                  {p === ACTIVE_OPTION && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontFamily: 'var(--axis-font-mono)',
                        fontSize: 10,
                        color: 'var(--axis-text-tertiary)',
                      }}
                    >
                      active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Card>

          <Card title="품목 정보">
            <div style={{ fontSize: 11.5, color: 'var(--axis-text-secondary)', lineHeight: 1.7 }}>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: 'var(--axis-text-primary)' }}>분류:</strong>{' '}
                {product.category}
              </div>
              <div>{product.description}</div>
            </div>
          </Card>

          <Card title="이상치 알림" sub="anomaly">
            <AnomalyPanel anomalies={trade.anomalies} />
          </Card>
        </aside>

        <main className="col-main">
          {/* KPI — repository 산출(Mock=큐레이션, real=스냅샷 실데이터). F023: 하드코딩 제거 */}
          <KpiStrip items={kpis} />

          <Card
            title="중앙 · 공작기계 가치사슬 지식 그래프"
            sub="장비 ↔ 부품(베어링·감속기) ↔ 소재 ↔ 수입국"
            flushBody
          >
            <KGraph graph={graph} highlightFrom={hoverRowId} />
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
            <Card
              title="좌측 · 수출입 추이"
              sub={trade.quarters.length ? `${trade.quarters[0]} — ${trade.quarters[trade.quarters.length - 1]}` : '—'}
              flushBody
            >
              <TradeChart data={trade} />
            </Card>

            <Card title="우측 · 핵심·예비 기업" sub="GIVC enp0111y" flushBody>
              <table className="dtable">
                <thead>
                  <tr>
                    <th>회사</th>
                    <th>유형</th>
                    <th style={{ textAlign: 'right' }}>점유</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr
                      key={c.id}
                      className={hoverRowId === c.id ? 'active' : ''}
                      onMouseEnter={() => setHoverRowId(c.id)}
                      onMouseLeave={() => setHoverRowId(null)}
                    >
                      <td className="col-name">
                        {c.name}
                        <span className="company-sub">{c.tier} · {c.biz}</span>
                      </td>
                      <td>
                        {c.coreType === 1 ? (
                          <Badge kind="info">핵심</Badge>
                        ) : (
                          <Badge kind="default">예비</Badge>
                        )}
                      </td>
                      <td className="col-metric" style={{ textAlign: 'right' }}>
                        {c.share}
                        <DataMark kind={c.source} withLabel={false} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          <Card title="하단 · 관련 뉴스 워드클라우드" sub="시연용 가상 ※" flushBody>
            <WordCloud words={wordcloud.words} />
            <div
              style={{
                padding: '8px 14px',
                fontSize: 11,
                color: 'var(--axis-text-tertiary)',
                borderTop: '1px solid var(--axis-line-soft)',
                display: 'flex',
                gap: 16,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 100,
                    background: 'var(--axis-color-red-500)',
                  }}
                ></span>{' '}
                부정 시그널
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 100,
                    background: 'var(--axis-color-green-500)',
                  }}
                ></span>{' '}
                긍정 시그널
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--axis-font-mono)' }}>
                품목 단위 매칭 — 실시간 뉴스 데이터 결합 시 활성화
              </span>
            </div>
          </Card>

          {/* ─── F026+F027: GVC 재정렬 + ChatGIVC 질의 (additive) ─── */}
          <div style={{ marginTop: 8 }}>
            {/* 헤더 + 도메인 토글 (F026 원형 유지) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
                paddingBottom: 10,
                borderBottom: '1px solid var(--axis-line-soft)',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--axis-text-primary)' }}>
                  GIVC 가치사슬 분석
                </div>
                <div style={{ fontSize: 11, color: 'var(--axis-text-tertiary)', marginTop: 2 }}>
                  기계 · 반도체 소부장 GVC 구조 비교
                </div>
              </div>
              <DomainToggle />
            </div>

            {/* ─── F027: 탭 switcher ─── */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                marginBottom: 14,
                borderBottom: '1px solid var(--axis-line-soft)',
                paddingBottom: 0,
              }}
            >
              {(
                [
                  { id: 'analysis', label: '📊 분석' },
                  { id: 'query', label: '💬 ChatGIVC 질의' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  className="btn btn-ghost btn-sm"
                  style={{
                    borderRadius: '4px 4px 0 0',
                    borderBottom: givcTab === tab.id
                      ? '2px solid var(--axis-color-blue-600)'
                      : '2px solid transparent',
                    color: givcTab === tab.id
                      ? 'var(--axis-color-blue-600)'
                      : undefined,
                    fontWeight: givcTab === tab.id ? 600 : undefined,
                  }}
                  onClick={() => setGivcTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 📊 분석 탭 — F026 원형 (무변경) */}
            {givcTab === 'analysis' && (
              <>
                <GvcPane domain={activeDomain} />
                <div style={{ marginTop: 14 }}>
                  <GvcIntegration />
                </div>
              </>
            )}

            {/* 💬 ChatGIVC 질의 탭 — F027 신규 */}
            {givcTab === 'query' && <ChatGivcQueryPane domain={activeDomain} />}
          </div>
          {/* ─── /F026+F027 ─── */}

          <Callout kind="info" title="기능 설명">
            현재는 머시닝센터(장비) 중심 가치사슬이지만, <strong>전후방 데이터</strong>를 결합하면{' '}
            <strong>'자립화 영향 분석'</strong>까지 자동화됩니다. 소재→부품→장비 단계별 데이터셋 범위에 따라
            분석 깊이가 확장됩니다.
          </Callout>

          <ProvenanceLegend />
        </main>

        <aside className="col-right">
          <DataExpansionHints
            hints={hints}
            active={activeHints}
            onToggle={toggleHint}
            currentRows={[
              <>
                GIVC{' '}
                <code
                  style={{
                    fontFamily: 'var(--axis-font-mono)',
                    background: 'var(--axis-color-gray-200)',
                    padding: '0 4px',
                    borderRadius: 3,
                  }}
                >
                  mart.lnk0951a
                </code>{' '}
                무역통계 +{' '}
                <code
                  style={{
                    fontFamily: 'var(--axis-font-mono)',
                    background: 'var(--axis-color-gray-200)',
                    padding: '0 4px',
                    borderRadius: 3,
                  }}
                >
                  enp0111y
                </code>{' '}
                기업정보
              </>,
              <>단일 품목 한 화면 통합</>,
            ]}
            sub="단일 화면 통합이 시연 핵심. 토글 시 확장 path 시뮬레이션."
          />

          <Card title="데이터 확장 예시" sub="뉴스 매칭">
            <div style={{ fontSize: 12, color: 'var(--axis-text-secondary)', lineHeight: 1.6 }}>
              뉴스 매칭이 산업 단위에서{' '}
              <strong style={{ color: 'var(--axis-text-primary)' }}>품목 단위</strong>로 내려오면 —
              예를 들어{' '}
              <strong style={{ color: 'var(--axis-text-primary)' }}>'정밀 베어링'과 '정밀 감속기'를 구분</strong>
              하는 의미 통일 — 수입의존 부품의 위험 알림이 한 단계 더 깊어집니다.
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
