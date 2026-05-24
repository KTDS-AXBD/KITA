// ============================================================
// S6 — 톨루엔 단일 품목 풀 가시화
// ============================================================

const { useState, useMemo } = React;
const {
  KitaData, Card, Badge, DataExpansionHints, KpiStrip, Callout,
  ProvenanceLegend, KGraph, DataMark
} = window;
const { Search, AlertTriangle, Globe, Beaker, Database, Info } = window.Icons;

// -------- Trade trend chart --------
const TradeChart = ({ data }) => {
  const W = 720, H = 260, padL = 40, padR = 12, padT = 16, padB = 28;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const all = [...data.exports, ...data.imports];
  const yMax = Math.ceil(Math.max(...all) / 50) * 50 + 50;
  const x = (i) => padL + (i / (data.quarters.length - 1)) * innerW;
  const y = (v) => padT + innerH - (v / yMax) * innerH;
  const lineExport = data.exports.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
  const lineImport = data.imports.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
  const areaExport = `M${x(0)},${y(0)} ${data.exports.map((v, i) => `L${x(i)},${y(v)}`).join(' ')} L${x(data.exports.length - 1)},${y(0)} Z`;

  const ticks = [0, yMax / 4, yMax / 2, (3 * yMax) / 4, yMax];

  return (
    <div className="trend-chart-wrap">
      <div className="trend-chart">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          {/* grid */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line className="grid-line" x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} />
              <text className="axis-tick" x={padL - 6} y={y(t) + 3} textAnchor="end">{t}</text>
            </g>
          ))}
          {/* x ticks */}
          {data.quarters.map((q, i) => (
            (i % 2 === 0) && (
              <text key={q} className="axis-tick" x={x(i)} y={H - 10} textAnchor="middle">{q}</text>
            )
          ))}
          {/* export area + line */}
          <path className="series-area-export" d={areaExport} />
          <path className="series-export" d={lineExport} />
          <path className="series-import" d={lineImport} />
          {/* anomaly markers */}
          {data.anomalies.map((a, i) => (
            <g key={i}>
              <circle className="anomaly-marker" cx={x(a.idx)} cy={y(data.imports[a.idx])} r="5" />
              <line stroke="var(--axis-color-red-300)" strokeDasharray="2 2"
                    x1={x(a.idx)} y1={y(data.imports[a.idx])} x2={x(a.idx)} y2={H - padB + 4} />
            </g>
          ))}
        </svg>
      </div>
      <div style={{ display: 'flex', gap: 16, padding: '6px 4px 10px', fontSize: 11 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 16, height: 2, background: 'var(--axis-color-blue-500)' }}></span> 수출 (천톤)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 16, height: 0, borderTop: '2px dashed var(--axis-color-orange-500)' }}></span> 수입 (천톤)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--axis-color-red-700)' }}>
          <span style={{ width: 8, height: 8, background: 'var(--axis-color-red-500)', borderRadius: 100 }}></span> 이상 시그널
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--axis-text-tertiary)', fontFamily: 'var(--axis-font-mono)' }}>
          source: GIVC mart.lnk0951a · 22Q1–25Q4
        </span>
      </div>
    </div>
  );
};

// -------- WordCloud --------
const WordCloud = ({ words }) => (
  <div className="wordcloud">
    {words.map((w, i) => (
      <span key={i} className={`word ${w.t}`} style={{ fontSize: 12 + w.s * 0.5 }}>{w.w}</span>
    ))}
  </div>
);

// -------- Anomaly panel --------
const AnomalyPanel = ({ anomalies }) => (
  <div style={{ padding: '4px 0' }}>
    {anomalies.map((a, i) => (
      <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--axis-line-soft)' }}>
        <AlertTriangle size={14} style={{ color: 'var(--axis-color-red-500)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>{a.label}</div>
          <div style={{ fontSize: 11, color: 'var(--axis-text-tertiary)' }}>이상치 알고리즘 — 이동평균 ±2σ 초과</div>
        </div>
        <DataMark kind="real" withLabel={false} />
      </div>
    ))}
  </div>
);

const S6Page = ({ tweaks }) => {
  const [activeHints, setActiveHints] = useState({});
  const [hoverRowId, setHoverRowId] = useState(null);
  const toggleHint = (id) => setActiveHints(p => ({ ...p, [id]: !p[id] }));

  return (
    <>
      <div className="page-band">
        <div className="page-band-inner">
          <div>
            <div className="label">서브 시연 · S6 · 안전책</div>
            <h1>톨루엔 단일 품목 풀 가시화</h1>
            <div className="page-band-sub">
              복잡한 추천 로직 없이도 GIVC가 보유한 단일 품목 정보를 한 화면 지식그래프로 합치는 것만으로
              산업부의 "창 띄웠다 끄는" 페인이 해결됩니다.
            </div>
          </div>
          <div className="page-band-right">
            <Badge kind="info"><Beaker size={11} /> {KitaData.S6_PRODUCT.hsCode}</Badge>
            <Badge kind="default">{KitaData.S6_PRODUCT.cas}</Badge>
          </div>
        </div>
      </div>

      <div className="scenario-layout">
        {/* ===== LEFT ===== */}
        <aside className="col-left">
          <Card title="품목 검색" sub="Combobox · 프리셋">
            <div className="field">
              <label className="field-label">품목명</label>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--axis-text-tertiary)' }} />
                <input className="input" value={KitaData.S6_PRODUCT.name} readOnly style={{ paddingLeft: 30 }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['톨루엔', '벤젠', '자일렌', '에틸렌'].map(p => (
                <button key={p} className="btn btn-sm" style={{ justifyContent: 'flex-start', opacity: p === '톨루엔' ? 1 : 0.55 }}>
                  {p === '톨루엔' && <span style={{ width: 4, height: 4, background: 'var(--axis-color-blue-600)', borderRadius: 100 }}></span>}
                  <span style={{ marginLeft: p === '톨루엔' ? 0 : 8 }}>{p}</span>
                  {p === '톨루엔' && <span style={{ marginLeft: 'auto', fontFamily: 'var(--axis-font-mono)', fontSize: 10, color: 'var(--axis-text-tertiary)' }}>active</span>}
                </button>
              ))}
            </div>
          </Card>

          <Card title="품목 정보">
            <div style={{ fontSize: 11.5, color: 'var(--axis-text-secondary)', lineHeight: 1.7 }}>
              <div style={{ marginBottom: 8 }}><strong style={{ color: 'var(--axis-text-primary)' }}>분류:</strong> {KitaData.S6_PRODUCT.category}</div>
              <div>{KitaData.S6_PRODUCT.description}</div>
            </div>
          </Card>

          <Card title="이상치 알림" sub="anomaly">
            <AnomalyPanel anomalies={KitaData.S6_TRADE.anomalies} />
          </Card>
        </aside>

        {/* ===== MAIN ===== */}
        <main className="col-main">

          <KpiStrip items={[
            { label: '연간 수출', value: '1,032천톤', delta: '+8.5% YoY', deltaDir: 'up' },
            { label: '연간 수입', value: '560천톤', delta: '+27% YoY', deltaDir: 'down' },
            { label: '핵심 기업', value: '3개', delta: '예비 2개', deltaDir: 'up' },
            { label: '주요 수입국', value: '일본 38%', delta: '중국 27% · 미국 14%', deltaDir: 'up' }
          ]} />

          {/* central knowledge graph */}
          <Card title="중앙 · 톨루엔 지식 그래프"
                sub="HSCode ↔ 수입국 ↔ 핵심기업 ↔ 전후방"
                flushBody>
            <KGraph graph={KitaData.S6_GRAPH} highlightFrom={hoverRowId} />
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
            <Card title="좌측 · 수출입 추이" sub="22Q1 — 25Q4" flushBody>
              <TradeChart data={KitaData.S6_TRADE} />
            </Card>

            <Card title="우측 · 핵심·예비 기업" sub="GIVC enp0111y" flushBody>
              <table className="dtable">
                <thead>
                  <tr><th>회사</th><th>유형</th><th style={{ textAlign: 'right' }}>점유</th></tr>
                </thead>
                <tbody>
                  {KitaData.S6_COMPANIES.map(c => (
                    <tr key={c.id}
                        className={hoverRowId === c.id ? 'active' : ''}
                        onMouseEnter={() => setHoverRowId(c.id)}
                        onMouseLeave={() => setHoverRowId(null)}>
                      <td className="col-name">{c.name}<span className="company-sub">{c.biz}</span></td>
                      <td>{c.coreType === 1 ? <Badge kind="info">핵심</Badge> : <Badge kind="default">예비</Badge>}</td>
                      <td className="col-metric" style={{ textAlign: 'right' }}>{c.share}<DataMark kind="real" withLabel={false} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* word cloud */}
          <Card title="하단 · 관련 뉴스 워드클라우드" sub="시연용 가상 ※" flushBody>
            <WordCloud words={KitaData.S6_WORDS} />
            <div style={{ padding: '8px 14px', fontSize: 11, color: 'var(--axis-text-tertiary)', borderTop: '1px solid var(--axis-line-soft)', display: 'flex', gap: 16 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 100, background: 'var(--axis-color-red-500)' }}></span> 부정 시그널
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 100, background: 'var(--axis-color-green-500)' }}></span> 긍정 시그널
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--axis-font-mono)' }}>품목 단위 매칭 — 실시간 뉴스 데이터 결합 시 활성화</span>
            </div>
          </Card>

          <Callout kind="info" title="기능 설명">
            현재는 톨루엔 단일 노드 중심이지만, <strong>전후방 데이터</strong>를 결합하면
            <strong>'영향 분석'</strong>까지 자동화됩니다.
            전후방 데이터셋 범위에 따라 분석 깊이가 확장됩니다.
          </Callout>

          <ProvenanceLegend />
        </main>

        {/* ===== RIGHT ===== */}
        <aside className="col-right">
          <DataExpansionHints
            hints={KitaData.HINTS_S6}
            active={activeHints}
            onToggle={toggleHint}
            currentRows={[
              <>GIVC <code style={{ fontFamily: 'var(--axis-font-mono)', background: 'var(--axis-color-gray-200)', padding: '0 4px', borderRadius: 3 }}>mart.lnk0951a</code> 무역통계 + <code style={{ fontFamily: 'var(--axis-font-mono)', background: 'var(--axis-color-gray-200)', padding: '0 4px', borderRadius: 3 }}>enp0111y</code> 기업정보</>,
              <>단일 품목 한 화면 통합</>
            ]}
            sub="단일 화면 통합이 시연 핵심. 토글 시 확장 path 시뮬레이션."
          />

          <Card title="데이터 확장 예시" sub="뉴스 매칭">
            <div style={{ fontSize: 12, color: 'var(--axis-text-secondary)', lineHeight: 1.6 }}>
              뉴스 매칭이 산업 단위에서 <strong style={{ color: 'var(--axis-text-primary)' }}>품목 단위</strong>로 내려오면 — 예를 들어
              <strong style={{ color: 'var(--axis-text-primary)' }}> '나프타'와 '경질 라프타'를 구분</strong>하는 의미 통일 — 위험 알림이 한 단계 더 깊어집니다.
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
};

Object.assign(window, { S6Page });
