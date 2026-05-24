import { useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import type { PositionedGraph, PositionedNode } from '@/types';
import { DataMark } from './DataMark';

interface KGraphProps {
  graph: PositionedGraph;
  highlightFrom?: string | null;
  onNodeHover?: (id: string | null) => void;
}

interface TooltipState {
  x: number;
  y: number;
  node: PositionedNode;
}

const TYPE_LABEL: Record<PositionedNode['type'], string> = {
  company: '기업',
  rnd: 'R&D',
  metric: '지표',
  hscode: 'HS',
  country: '국가',
};

export function KGraph({ graph, highlightFrom, onNodeHover }: KGraphProps): JSX.Element {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const activeId = hoverId ?? highlightFrom ?? null;
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));

  const litNodes = new Set<string>();
  const litEdges = new Set<number>();
  if (activeId) {
    litNodes.add(activeId);
    graph.edges.forEach(([a, b], i) => {
      if (a === activeId || b === activeId) {
        litEdges.add(i);
        litNodes.add(a);
        litNodes.add(b);
      }
    });
  }

  const handleEnter = (n: PositionedNode, e: ReactMouseEvent<SVGGElement>): void => {
    setHoverId(n.id);
    onNodeHover?.(n.id);
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setTooltip({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top + 12, node: n });
  };

  const handleMove = (e: ReactMouseEvent<HTMLDivElement>): void => {
    if (!hoverId || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setTooltip((t) => (t ? { ...t, x: e.clientX - rect.left + 12, y: e.clientY - rect.top + 12 } : null));
  };

  const handleLeave = (): void => {
    setHoverId(null);
    onNodeHover?.(null);
    setTooltip(null);
  };

  const hasActive = !!activeId;

  return (
    <div className="kgraph-wrap" ref={wrapRef} onMouseMove={handleMove}>
      <svg className="kgraph-svg" viewBox={graph.viewBox} preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker
            id="kg-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="var(--axis-color-gray-400)" />
          </marker>
        </defs>
        <g>
          {graph.edges.map(([a, b], i) => {
            const na = nodeById.get(a);
            const nb = nodeById.get(b);
            if (!na || !nb) return null;
            const lit = litEdges.has(i);
            const dim = hasActive && !lit;
            return (
              <line
                key={i}
                className={`kg-edge ${lit ? 'lit' : ''} ${dim ? 'dim' : ''}`}
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
              />
            );
          })}
        </g>
        <g>
          {graph.nodes.map((n) => {
            const lit = litNodes.has(n.id);
            const dim = hasActive && !lit;
            return (
              <g
                key={n.id}
                className={`kg-node type-${n.type} ${lit ? 'lit' : ''} ${dim ? 'dim' : ''}`}
                transform={`translate(${n.x},${n.y})`}
                onMouseEnter={(e) => handleEnter(n, e)}
                onMouseLeave={handleLeave}
              >
                <circle r={n.r} />
                <text dy="3" fontSize="10" fontWeight="700" fill="var(--axis-text-secondary)">
                  {TYPE_LABEL[n.type]}
                </text>
                <text y={n.r + 14} fontSize="11">
                  {n.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {tooltip && (
        <div className="kg-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <div className="tt-title">
            {tooltip.node.label}
            <DataMark kind={tooltip.node.source} withLabel={false} />
          </div>
          {tooltip.node.meta &&
            Object.entries(tooltip.node.meta).map(([k, v]) => (
              <div className="tt-meta" key={k}>
                <strong>{k}:</strong> {v}
              </div>
            ))}
        </div>
      )}

      <div className="kg-legend">
        <span className="leg">
          <span className="leg-dot company"></span>기업
        </span>
        <span className="leg">
          <span className="leg-dot rnd"></span>R&D 공고·중심 노드
        </span>
        <span className="leg">
          <span className="leg-dot metric"></span>지표·전후방
        </span>
        <span className="leg">
          <span className="leg-dot hscode"></span>HS Code
        </span>
        <span className="leg">
          <span className="leg-dot country"></span>수입국
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--axis-text-tertiary)', fontSize: 11 }}>
          노드 hover → 데이터 출처 표시 · 행 hover → 근거 그래프 하이라이트
        </span>
      </div>
    </div>
  );
}
