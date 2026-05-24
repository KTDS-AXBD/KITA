// ============================================================
// S4 — R&D 적합 기업 추천 (메인 데모)
// ============================================================

const { useState, useMemo } = React;
const {
  KitaData, Card, Badge, ScoreBar, SliderRow,
  DataExpansionHints, KpiStrip, Callout, ProvenanceLegend, WhatIfChat, KGraph,
  DataMark
} = window;
const { Filter, Eye, Database, AlertTriangle, Beaker, ArrowRight, FileText, Sparkles } = window.Icons;

const fmtPct = (v) => `${(v * 100).toFixed(1)}%`;

const S4Page = ({ tweaks }) => {
  // ---- input state ----
  const [domain, setDomain]   = useState('semi-mat');
  const [budget, setBudget]   = useState(5);
  const [period, setPeriod]   = useState(12);
  const [weights, setWeights] = useState({ rnd: 0.40, sales: 0.20, patent: 0.30, risk: 0.10 });
  const [activeHints, setActiveHints] = useState({});
  const [hoverRowId, setHoverRowId]   = useState(null);
  const [topLayout, setTopLayout]     = useState(tweaks.top5Layout || 'table');

  // ---- preset apply ----
  const applyPreset = (p) => {
    setDomain(p.domain); setBudget(p.budget); setPeriod(p.period); setWeights(p.weights);
  };

  // ---- weight normalisation (display only — math handles raw) ----
  const wSum = weights.rnd + weights.sales + weights.patent + weights.risk;
  const setW = (k, v) => setWeights(prev => ({ ...prev, [k]: v }));

  // ---- score calculation ----
  // normalize each metric across pool, then weighted sum.
  const candidates = KitaData.S4_CANDIDATE_POOL;
  const ranked = useMemo(() => {
    const m = candidates.map(c => c);
    const maxRnd     = Math.max(...m.map(c => c.rndGrowth));
    const maxSales   = Math.max(...m.map(c => c.salesGrowth));
    const maxPatent  = Math.max(...m.map(c => c.patentCount));
    const maxRisk    = Math.max(...m.map(c => c.defaultRisk));

    // hint boost: 산기평 공고 hint on → matchAccuracy +0.23 baked into scores
    const matchBoost = activeHints['h_rndcall'] ? 1.0 : 0.85; // bare match accuracy multiplier
    const patentBoostSign = activeHints['h_patent'] ? 1.10 : 1.0;
    const riskBoostSign   = activeHints['h_finance'] ? 1.05 : 1.0;
    const signalBoost     = activeHints['h_movement'] ? 0.03 : 0; // additive

    const scored = m.map(c => {
      const rndN    = c.rndGrowth / maxRnd;
      const salesN  = c.salesGrowth / maxSales;
      const patentN = (c.patentCount / maxPatent) * patentBoostSign;
      // risk lower-is-better
      const riskN   = (1 - (c.defaultRisk / maxRisk)) * riskBoostSign;
      const raw = (weights.rnd * rndN + weights.sales * salesN + weights.patent * patentN + weights.risk * riskN) / Math.max(wSum, 0.0001);
      const score = Math.min(1, raw * matchBoost + signalBoost);
      return { ...c, _components: { rndN, salesN, patentN, riskN }, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [candidates, weights, wSum, activeHints]);

  const top5 = ranked.slice(0, 5);
  const matchAccuracy = activeHints['h_rndcall'] ? 0.88 : 0.65;

  // ---- nodes for graph: filter to top5 ----
  const top5Ids = new Set(top5.map(c => c.id));
  const graph = {
    ...KitaData.S4_GRAPH,
    nodes: KitaData.S4_GRAPH.nodes.filter(n => n.type !== 'company' || top5Ids.has(n.id)),
    edges: KitaData.S4_GRAPH.edges.filter(([a, b]) => {
      const na = KitaData.S4_GRAPH.nodes.find(n => n.id === a);
      const nb = KitaData.S4_GRAPH.nodes.find(n => n.id === b);
      if (!na || !nb) return false;
      if (na.type === 'company' && !top5Ids.has(na.id)) return false;
      if (nb.type === 'company' && !top5Ids.has(nb.id)) return false;
      return true;
    })
  };

  const toggleHint = (id) => setActiveHints(prev => ({ ...prev, [id]: !prev[id] }));

  const domainObj = KitaData.DOMAINS.find(d => d.id === domain);

  return (
    <>
      <div className="page-band">
        <div className="page-band-inner">
          <div>
            <div className="label">메인 시연 · S4</div>
            <h1>산기평 R&D 적합 기업 추천</h1>
            <div className="page-band-sub">
              산자부가 새 R&D 공고를 띄울 때, GIVC 위 온톨로지 레이어가 적합 기업 Top 5 + 선정 근거 + 반대 추천을 자동 제시합니다.
              가중치를 바꾸면 결과가 실시간으로 재계산됩니다.
            </div>
          </div>
          <div className="page-band-right">
            <Badge kind="info"><Database size={11} /> GIVC 12 tables</Badge>
            <Badge kind="default">matching: <strong style={{ marginLeft: 4 }}>{fmtPct(matchAccuracy)}</strong></Badge>
          </div>
        </div>
      </div>

      <div className="scenario-layout">
        {/* ===== LEFT: input ===== */}
        <aside className="col-left">
          <Card title="입력" sub="Sidebar · Form">
            <div className="field">
              <label className="field-label">분야 <span className="field-hint">{domainObj?.sub}</span></label>
              <select className="select" value={domain} onChange={e => setDomain(e.target.value)}>
                {KitaData.DOMAINS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">R&D 예산 <span className="field-hint">{budget} 억원</span></label>
              <input type="range" className="slider-track" min="1" max="20" step="1"
                     value={budget} onChange={e => setBudget(parseInt(e.target.value))} />
            </div>
            <div className="field">
              <label className="field-label">기간 <span className="field-hint">{period} 개월</span></label>
              <input type="range" className="slider-track" min="6" max="36" step="3"
                     value={period} onChange={e => setPeriod(parseInt(e.target.value))} />
            </div>
            <div style={{ height: 10 }}></div>
            <div className="field-label" style={{ marginBottom: 8 }}>프리셋 사례</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
              {KitaData.PRESETS.map(p => (
                <button key={p.id} className="btn" onClick={() => applyPreset(p)}
                        style={{ justifyContent: 'flex-start', height: 'auto', padding: '8px 10px', textAlign: 'left', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <span style={{ fontSize: 11, color: 'var(--axis-text-tertiary)', fontFamily: 'var(--axis-font-mono)' }}>{p.label}</span>
                  <span style={{ fontWeight: 600, fontSize: 12 }}>{p.title}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card title="가중치 (E)" sub="실시간 재계산">
            <SliderRow name="R&D 투자율" value={weights.rnd}    onChange={v => setW('rnd', v)} />
            <SliderRow name="매출 성장"  value={weights.sales}  onChange={v => setW('sales', v)} />
            <SliderRow name="특허 보유"  value={weights.patent} onChange={v => setW('patent', v)} />
            <SliderRow name="리스크"     value={weights.risk}   onChange={v => setW('risk', v)} />
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--axis-text-tertiary)', fontFamily: 'var(--axis-font-mono)', borderTop: '1px solid var(--axis-line-soft)', paddingTop: 8 }}>
              Σ = {wSum.toFixed(2)} <span style={{ color: 'var(--axis-text-secondary)' }}>(자동 정규화)</span>
            </div>
          </Card>
        </aside>

        {/* ===== MAIN ===== */}
        <main className="col-main">

          {/* KPI strip */}
          <KpiStrip items={[
            { label: '분석 후보군', value: candidates.length, delta: '6 핵심 / 2 예비', deltaDir: 'up' },
            { label: 'Top 5 매칭 정확도', value: fmtPct(matchAccuracy), delta: activeHints['h_rndcall'] ? '+23%p (산기평 공고)' : '기본 — 가상 공고', deltaDir: activeHints['h_rndcall'] ? 'up' : 'down' },
            { label: '실데이터 비중', value: '76%', delta: '⭐ 실 4 / △ 1 / ※ 1', deltaDir: 'up' },
            { label: '재계산 시간', value: '<50ms', delta: 'on-device', deltaDir: 'up' }
          ]} />

          {/* A. Top 5 후보 */}
          <Card title="A · 후보 기업 Top 5" sub="가중치 조정 시 실시간 재계산"
                headRight={
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" onClick={() => setTopLayout(topLayout === 'table' ? 'card' : 'table')}>
                      <Eye size={12} /> {topLayout === 'table' ? '카드 보기' : '표 보기'}
                    </button>
                  </div>}
                flushBody>
            {topLayout === 'table' ? (
              <table className="dtable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>회사 / 분야</th>
                    <th>유형</th>
                    <th>R&D ↑</th>
                    <th>매출 ↑</th>
                    <th>특허</th>
                    <th>부도율</th>
                    <th style={{ textAlign: 'right' }}>점수</th>
                  </tr>
                </thead>
                <tbody>
                  {top5.map((c, i) => (
                    <tr key={c.id}
                        className={hoverRowId === c.id ? 'active' : ''}
                        onMouseEnter={() => setHoverRowId(c.id)}
                        onMouseLeave={() => setHoverRowId(null)}>
                      <td className={`col-rank ${i === 0 ? 'rank-top' : ''}`}>{i + 1}</td>
                      <td className="col-name">{c.name}<span className="company-sub">{c.biz} · {c.region}</span></td>
                      <td>{c.coreType === 1 ? <Badge kind="info">핵심</Badge> : <Badge kind="default">예비</Badge>}</td>
                      <td className="col-metric">{fmtPct(c.rndGrowth)}<DataMark kind={c.sources.rndGrowth} withLabel={false} /></td>
                      <td className="col-metric">{fmtPct(c.salesGrowth)}<DataMark kind={c.sources.salesGrowth} withLabel={false} /></td>
                      <td className="col-metric">{c.patentCount}<DataMark kind={c.sources.patentCount} withLabel={false} /></td>
                      <td className="col-metric">{fmtPct(c.defaultRisk)}<DataMark kind={c.sources.defaultRisk} withLabel={false} /></td>
                      <td className="col-score"><ScoreBar value={c.score} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
                {top5.map((c, i) => (
                  <div key={c.id}
                       onMouseEnter={() => setHoverRowId(c.id)}
                       onMouseLeave={() => setHoverRowId(null)}
                       style={{ padding: 14, border: '1px solid var(--axis-border-default)', borderRadius: 10, background: hoverRowId === c.id ? 'var(--axis-color-blue-50)' : 'var(--axis-paper)', cursor: 'pointer', transition: 'background 0.12s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'var(--axis-font-mono)', fontWeight: 700, color: i === 0 ? 'var(--axis-color-blue-600)' : 'var(--axis-text-tertiary)' }}>#{i + 1}</span>
                      {c.coreType === 1 ? <Badge kind="info">핵심</Badge> : <Badge kind="default">예비</Badge>}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--axis-text-tertiary)', marginBottom: 10 }}>{c.biz} · {c.region}</div>
                    <ScoreBar value={c.score} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* B. Evidence graph */}
          <Card title="B · 선정 근거 지식 그래프" sub="노드 hover → 데이터 출처 · 행 hover → 근거 하이라이트" flushBody>
            <KGraph graph={graph} highlightFrom={hoverRowId} />
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* C. Similar cases */}
            <Card title="C · 유사 과거 R&D 사례" sub="가상 데이터 ※" flushBody>
              <div style={{ padding: 6 }}>
                {KitaData.S4_SIMILAR_CASES.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderBottom: '1px solid var(--axis-line-soft)' }}>
                    <div style={{ fontFamily: 'var(--axis-font-mono)', fontSize: 11, color: 'var(--axis-text-tertiary)', minWidth: 38 }}>{c.year}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{c.title} <DataMark kind="virt" withLabel={false} /></div>
                      <div style={{ fontSize: 11, color: 'var(--axis-text-tertiary)' }}>{c.funder} · {c.amount} · {c.outcome}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--axis-font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--axis-color-blue-700)' }}>{(c.match * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* D. Counter-recommendation */}
            <Card title="D · 반대 추천 (제외 사유)" sub="anti-recommendation" flushBody>
              <div style={{ padding: 6 }}>
                {KitaData.S4_COUNTER.map(x => (
                  <div key={x.id} style={{ padding: '12px 14px', borderBottom: '1px solid var(--axis-line-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Badge kind={x.tag === '리스크' ? 'error' : x.tag === '자격' ? 'warning' : 'default'}>{x.tag}</Badge>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{x.name}</span>
                      <DataMark kind={x.source} withLabel={false} />
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--axis-text-secondary)', lineHeight: 1.5 }}>{x.reason}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Q3 — What-If */}
          <WhatIfChat prompts={KitaData.WHATIF_PROMPTS} />

          <Callout kind="info" title="기능 설명">
            Top 5는 GIVC 위 온톨로지 레이어가 자동 추천한 결과입니다.
            특허 가중치를 <strong>0.30 → 0.15</strong>로 조정하면 순위가 실시간으로 재계산됩니다.
          </Callout>

          <ProvenanceLegend />
        </main>

        {/* ===== RIGHT: hints ===== */}
        <aside className="col-right">
          <DataExpansionHints
            hints={KitaData.HINTS_S4}
            active={activeHints}
            onToggle={toggleHint}
            currentRows={[
              <>GIVC <code style={{ fontFamily: 'var(--axis-font-mono)', background: 'var(--axis-color-gray-200)', padding: '0 4px', borderRadius: 3 }}>mart.lnk0951a</code> + <code style={{ fontFamily: 'var(--axis-font-mono)', background: 'var(--axis-color-gray-200)', padding: '0 4px', borderRadius: 3 }}>scmm_his_chart</code> 등 12개 테이블</>,
              <>매칭 정확도 <strong>{fmtPct(matchAccuracy)}</strong></>
            ]}
            sub="토글 시 결과 화면이 시뮬레이션됩니다."
          />

          <Card title="데이터 확장 예시" sub="산기평 공고">
            <div style={{ fontSize: 12, color: 'var(--axis-text-secondary)', lineHeight: 1.6 }}>
              현재는 가상의 R&D 공고 3건 기반입니다. <strong style={{ color: 'var(--axis-text-primary)' }}>산기평 공고 실데이터</strong>를 연동하면
              매칭 정확도를 <strong style={{ color: 'var(--axis-text-primary)' }}>65→88%</strong>까지 향상할 수 있습니다.
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
};

Object.assign(window, { S4Page });
