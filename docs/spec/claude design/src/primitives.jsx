// ============================================================
// Primitives — Card, Badge, Hints, KPIs, etc.
// ============================================================

const { useState, useEffect, useRef, useMemo } = React;
const { ChevronRight, Database, Sparkles, Info, AlertTriangle, Send, TrendingUp, TrendingDown } = window.Icons;

// -------- Card --------
const Card = ({ title, subtitle, sub, children, tight, flushBody, headRight, className = '' }) => (
  <div className={`card ${tight ? 'card-tight' : ''} ${className}`}>
    {(title || headRight) && (
      <div className="card-head">
        <h3>{title}{subtitle ? <span className="card-sub">· {subtitle}</span> : null}</h3>
        {sub ? <span className="card-sub">{sub}</span> : null}
        {headRight ? <div className="card-head-right">{headRight}</div> : null}
      </div>
    )}
    <div className={`card-body ${tight ? 'card-body-tight' : ''} ${flushBody ? 'card-body-flush' : ''}`}>
      {children}
    </div>
  </div>
);

// -------- Badge --------
const Badge = ({ kind = 'default', children, ...rest }) => (
  <span className={`badge badge-${kind}`} {...rest}>{children}</span>
);

// -------- Score bar --------
const ScoreBar = ({ value, max = 1, decimals = 2 }) => (
  <span className="score-bar">
    <span className="score-fill-wrap">
      <span className="score-fill" style={{ width: `${Math.max(0, Math.min(1, value / max)) * 100}%` }}></span>
    </span>
    <span className="score-num">{value.toFixed(decimals)}</span>
  </span>
);

// -------- Slider row --------
const SliderRow = ({ name, value, onChange, min = 0, max = 1, step = 0.05 }) => (
  <div className="slider-row">
    <span className="slider-name">{name}</span>
    <input className="slider-track" type="range"
      min={min} max={max} step={step}
      value={value} onChange={e => onChange(parseFloat(e.target.value))} />
    <span className="slider-value">{(value * 100).toFixed(0)}</span>
  </div>
);

// -------- Data Expansion Hints --------
const DataExpansionHints = ({ hints, active, onToggle, currentRows, eyebrow = 'DATA EXPANSION HINTS', title = '이 데이터가 더 있다면', sub }) => (
  <div className="hints">
    <div className="hints-head">
      <div className="hints-eyebrow">{eyebrow}</div>
      <h3>{title}</h3>
      {sub ? <p>{sub}</p> : null}
    </div>
    {currentRows && (
      <div className="hints-current">
        {currentRows.map((row, i) => (
          <div className="cur-row" key={i}>
            <span>현재:</span><strong>{row}</strong>
          </div>
        ))}
      </div>
    )}
    {hints.map(h => (
      <div className={`hint-item ${active[h.id] ? 'active' : ''}`} key={h.id}>
        <div className="hint-item-top">
          <div className="hint-item-title">
            <Sparkles size={12} /> {h.title}
            <span className="hint-item-delta">{h.delta}</span>
          </div>
          <button className={`hint-toggle ${active[h.id] ? 'on' : ''}`}
                  onClick={() => onToggle(h.id)}
                  aria-label={`toggle ${h.title}`}></button>
        </div>
        <div className="hint-item-detail">{h.detail}</div>
      </div>
    ))}
  </div>
);

// -------- KPI strip --------
const KpiStrip = ({ items }) => (
  <div className="kpi-strip">
    {items.map((k, i) => (
      <div className="kpi-cell" key={i}>
        <div className="kpi-label">{k.label}</div>
        <div className="kpi-value">{k.value}</div>
        {k.delta != null && (
          <div className={`kpi-delta ${k.deltaDir === 'down' ? 'down' : 'up'}`}>
            {k.deltaDir === 'down' ? <TrendingDown size={11} /> : <TrendingUp size={11} />} {k.delta}
          </div>
        )}
      </div>
    ))}
  </div>
);

// -------- Callout --------
const Callout = ({ kind = 'info', icon, title, children }) => {
  const Icon = icon || (kind === 'warn' ? AlertTriangle : kind === 'error' ? AlertTriangle : Info);
  return (
    <div className={`callout callout-${kind}`}>
      <Icon size={16} className="callout-icon" />
      <div>{title ? <strong>{title} · </strong> : null}{children}</div>
    </div>
  );
};

// -------- Legend bar for ⭐△※ --------
const ProvenanceLegend = () => (
  <div className="legend-bar">
    <span>표기:</span>
    <span><window.DataMark kind="real" /> GIVC 또는 외부 출처 실데이터</span>
    <span><window.DataMark kind="est" /> 우리가 합리적으로 추론한 값</span>
    <span><window.DataMark kind="virt" /> 시연용 가상 데이터</span>
  </div>
);

// -------- What-If chat --------
const WhatIfChat = ({ prompts }) => {
  const [query, setQuery] = useState('');
  const [thinking, setThinking] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [askedQ, setAskedQ] = useState(null);

  const ask = (q) => {
    setQuery(q);
    setAskedQ(q);
    setThinking(true);
    setAnswer(null);
    setTimeout(() => {
      // try matching prompt; else generic
      const match = prompts.find(p => q.includes(p.q.slice(0, 8))) || prompts.find(p => p.q === q);
      const ans = match ? match.a :
        `질문을 받았습니다. 본 시연 환경은 LLM 가짜 응답 모드입니다 — Sprint 2에서 사내 LLM(또는 OpenAI) 연결 후, GIVC 컨텍스트와 함께 실제 응답을 생성합니다. (`/api/chat` 엔드포인트)`;
      setAnswer(ans);
      setThinking(false);
    }, 900);
  };

  return (
    <div className="whatif">
      <div className="whatif-head">
        <Sparkles size={14} />
        <span className="whatif-title">What-If · 자연어 질의</span>
        <span className="whatif-tag">LLM Mock</span>
      </div>
      <div className="whatif-input">
        <input type="text" placeholder="예: 예산이 10억으로 늘면 추천이 어떻게 바뀌나요?"
               value={query} onChange={e => setQuery(e.target.value)}
               onKeyDown={e => { if (e.key === 'Enter' && query.trim()) ask(query); }} />
        <button onClick={() => query.trim() && ask(query)} disabled={!query.trim() || thinking}>
          <Send size={12} /> 물어보기
        </button>
      </div>
      <div className="whatif-suggested">
        {prompts.map((p, i) => (
          <button key={i} onClick={() => ask(p.q)}>{p.q}</button>
        ))}
      </div>
      {(askedQ || thinking || answer) && (
        <div className="whatif-answer">
          {askedQ && <div style={{ marginBottom: 6, color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Q: {askedQ}</div>}
          {thinking ? (
            <span className="ans-thinking">분석 중 <span className="dot-pulse"><span></span><span></span><span></span></span></span>
          ) : (
            <span dangerouslySetInnerHTML={{ __html: (answer || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code style="font-family:var(--axis-font-mono);background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:3px">$1</code>') }} />
          )}
        </div>
      )}
    </div>
  );
};

// -------- Tabs --------
const Tabs = ({ items, active, onChange }) => (
  <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--axis-color-gray-100)', borderRadius: 8, alignSelf: 'flex-start' }}>
    {items.map(it => (
      <button key={it.id}
              onClick={() => onChange(it.id)}
              style={{
                border: 0, cursor: 'pointer',
                background: active === it.id ? 'var(--axis-paper)' : 'transparent',
                color: active === it.id ? 'var(--axis-text-primary)' : 'var(--axis-text-secondary)',
                fontWeight: active === it.id ? 600 : 500,
                fontSize: 12,
                padding: '5px 12px',
                borderRadius: 6,
                boxShadow: active === it.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                fontFamily: 'inherit'
              }}>
        {it.label}
      </button>
    ))}
  </div>
);

Object.assign(window, {
  Card, Badge, ScoreBar, SliderRow,
  DataExpansionHints, KpiStrip, Callout, ProvenanceLegend, WhatIfChat, Tabs
});
