// ============================================================
// Knowledge Graph — SVG static layout + hover halo / highlight
// ============================================================

const { useState, useRef } = React;

const KGraph = ({ graph, highlightFrom, onNodeHover }) => {
  const [hoverId, setHoverId] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const wrapRef = useRef(null);

  // Determine highlight set: when a row in the table is hovered, lit = node + edges adjacent
  // When a node is hovered, lit = that node + immediate neighbors
  const activeId = hoverId || highlightFrom || null;
  const nodeById = Object.fromEntries(graph.nodes.map(n => [n.id, n]));

  let litNodes = new Set();
  let litEdges = new Set();
  if (activeId) {
    litNodes.add(activeId);
    graph.edges.forEach(([a, b], i) => {
      if (a === activeId || b === activeId) {
        litEdges.add(i);
        litNodes.add(a); litNodes.add(b);
      }
    });
  }

  const handleEnter = (n, e) => {
    setHoverId(n.id);
    onNodeHover && onNodeHover(n.id);
    const rect = wrapRef.current.getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top + 12,
      node: n
    });
  };
  const handleMove = (e) => {
    if (!hoverId) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setTooltip(t => t ? { ...t, x: e.clientX - rect.left + 12, y: e.clientY - rect.top + 12 } : null);
  };
  const handleLeave = () => {
    setHoverId(null);
    onNodeHover && onNodeHover(null);
    setTooltip(null);
  };

  const hasActive = !!activeId;

  return (
    <div className="kgraph-wrap" ref={wrapRef} onMouseMove={handleMove}>
      <svg className="kgraph-svg" viewBox={graph.viewBox} preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="kg-arrow" viewBox="0 0 10 10" refX="9" refY="5"
                  markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--axis-color-gray-400)" />
          </marker>
        </defs>
        {/* edges */}
        <g>
          {graph.edges.map(([a, b], i) => {
            const na = nodeById[a], nb = nodeById[b];
            if (!na || !nb) return null;
            const lit = litEdges.has(i);
            const dim = hasActive && !lit;
            return (
              <line key={i}
                    className={`kg-edge ${lit ? 'lit' : ''} ${dim ? 'dim' : ''}`}
                    x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} />
            );
          })}
        </g>
        {/* nodes */}
        <g>
          {graph.nodes.map(n => {
            const lit = litNodes.has(n.id);
            const dim = hasActive && !lit;
            return (
              <g key={n.id}
                 className={`kg-node type-${n.type} ${lit ? 'lit' : ''} ${dim ? 'dim' : ''}`}
                 transform={`translate(${n.x},${n.y})`}
                 onMouseEnter={(e) => handleEnter(n, e)}
                 onMouseLeave={handleLeave}>
                <circle r={n.r} />
                {/* center icon by type */}
                {n.type === 'company' && (
                  <text dy="3" fontSize="10" fontWeight="700" fill="var(--axis-text-secondary)">기업</text>
                )}
                {n.type === 'rnd' && (
                  <text dy="3" fontSize="10" fontWeight="700" fill="var(--axis-text-secondary)">R&D</text>
                )}
                {n.type === 'metric' && (
                  <text dy="3" fontSize="10" fontWeight="700" fill="var(--axis-text-secondary)">지표</text>
                )}
                {n.type === 'hscode' && (
                  <text dy="3" fontSize="10" fontWeight="700" fill="var(--axis-text-secondary)">HS</text>
                )}
                {n.type === 'country' && (
                  <text dy="3" fontSize="10" fontWeight="700" fill="var(--axis-text-secondary)">국가</text>
                )}
                {/* label below */}
                <text y={n.r + 14} fontSize="11">{n.label}</text>
              </g>
            );
          })}
        </g>
      </svg>

      {tooltip && (
        <div className="kg-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <div className="tt-title">
            {tooltip.node.label}
            <window.DataMark kind={tooltip.node.source || 'real'} withLabel={false} />
          </div>
          {tooltip.node.meta && Object.entries(tooltip.node.meta).map(([k, v]) => (
            <div className="tt-meta" key={k}><strong>{k}:</strong> {v}</div>
          ))}
        </div>
      )}

      <div className="kg-legend">
        <span className="leg"><span className="leg-dot company"></span>기업</span>
        <span className="leg"><span className="leg-dot rnd"></span>R&D 공고·중심 노드</span>
        <span className="leg"><span className="leg-dot metric"></span>지표·전후방</span>
        <span className="leg"><span className="leg-dot hscode"></span>HS Code</span>
        <span className="leg"><span className="leg-dot country"></span>수입국</span>
        <span style={{ marginLeft: 'auto', color: 'var(--axis-text-tertiary)', fontSize: 11 }}>
          노드 hover → 데이터 출처 표시 · 행 hover → 근거 그래프 하이라이트
        </span>
      </div>
    </div>
  );
};

Object.assign(window, { KGraph });
