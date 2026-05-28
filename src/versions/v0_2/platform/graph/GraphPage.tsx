import { lazy, Suspense, useState, useEffect } from 'react';
import type { CytoDomain, CytoNode, CytoGraph } from '@/types';
import { graphRepository } from '@/data/repository';
import { NodeDetailPanel } from './NodeDetailPanel';
import { GraphLegend } from './GraphLegend';
import { GraphToolbar } from './GraphToolbar';

const GraphCanvas = lazy(() =>
  import('./GraphCanvas').then((m) => ({ default: m.GraphCanvas }))
);

const EMPTY_GRAPH: CytoGraph = { domain: 'sobujiang', nodes: [], edges: [] };

export function GraphPage(): JSX.Element {
  const [domain, setDomain] = useState<CytoDomain>('sobujiang');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeFilter, setNodeFilter] = useState<string>('all');
  const [focusActive, setFocusActive] = useState(false);

  // Repository 경유 — 기본 Mock(정적), VITE_DATA_SOURCE=real 시 D1 /api/givc/cyto-graph.
  const [graph, setGraph] = useState<CytoGraph | null>(null);
  useEffect(() => {
    let alive = true;
    setGraph(null);
    graphRepository.getGraph(domain).then((g) => { if (alive) setGraph(g); });
    return () => { alive = false; };
  }, [domain]);

  const g = graph ?? EMPTY_GRAPH;
  const selectedNode: CytoNode | null =
    selectedNodeId ? (g.nodes.find((n) => n.id === selectedNodeId) ?? null) : null;

  const connectedCount = selectedNodeId
    ? g.edges.filter((e) => e.source === selectedNodeId || e.target === selectedNodeId).length
    : 0;

  function handleDomainChange(d: CytoDomain): void {
    setDomain(d);
    setSelectedNodeId(null);
    setNodeFilter('all');
    setFocusActive(false);
  }

  function handleFilterChange(type: string): void {
    setNodeFilter(type);
    if (type !== 'all') setFocusActive(false);
  }

  function handleFocusToggle(): void {
    setFocusActive((v) => !v);
    if (!focusActive) setNodeFilter('all');
  }

  return (
    <div className="op-page">
      <div className="op-section-header">
        <h2>지식그래프</h2>
        <p>소부장 공작기계 / 호르무즈 석유화학 인과 관계 네트워크 · cytoscape.js</p>
      </div>

      <GraphToolbar
        domain={domain}
        nodeCount={g.nodes.length}
        edgeCount={g.edges.length}
        focusActive={focusActive}
        onDomainChange={handleDomainChange}
        onFocusToggle={handleFocusToggle}
      />

      <div style={{ display: 'flex', gap: 0, minHeight: 520, border: '1px solid var(--op-border)', borderRadius: 'var(--op-radius)', overflow: 'hidden' }}>
        <Suspense fallback={
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--op-text-tertiary)', fontSize: 13 }}>
            그래프 로딩 중...
          </div>
        }>
          <div style={{ flex: 1, display: 'flex' }}>
            {graph
              ? <GraphCanvas
                  graph={graph}
                  nodeFilter={nodeFilter}
                  focusActive={focusActive}
                  onNodeSelect={setSelectedNodeId}
                />
              : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--op-text-tertiary)', fontSize: 13 }}>
                  그래프 로딩 중...
                </div>}
          </div>
        </Suspense>
        <NodeDetailPanel
          node={selectedNode}
          connectedCount={connectedCount}
          domain={domain}
          totalNodes={g.nodes.length}
        />
      </div>

      <GraphLegend onFilterChange={handleFilterChange} activeFilter={nodeFilter} />
    </div>
  );
}
