import { lazy, Suspense, useState } from 'react';
import type { CytoDomain, CytoNode } from '@/types';
import { GRAPH_BY_DOMAIN } from './graphData';
import { NodeDetailPanel } from './NodeDetailPanel';
import { GraphLegend } from './GraphLegend';
import { GraphToolbar } from './GraphToolbar';

const GraphCanvas = lazy(() =>
  import('./GraphCanvas').then((m) => ({ default: m.GraphCanvas }))
);

export function GraphPage(): JSX.Element {
  const [domain, setDomain] = useState<CytoDomain>('sobujiang');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeFilter, setNodeFilter] = useState<string>('all');
  const [focusActive, setFocusActive] = useState(false);

  const graph = GRAPH_BY_DOMAIN[domain]!;
  const selectedNode: CytoNode | null =
    selectedNodeId ? (graph.nodes.find((n) => n.id === selectedNodeId) ?? null) : null;

  const connectedCount = selectedNodeId
    ? graph.edges.filter((e) => e.source === selectedNodeId || e.target === selectedNodeId).length
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
        nodeCount={graph.nodes.length}
        edgeCount={graph.edges.length}
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
            <GraphCanvas
              graph={graph}
              nodeFilter={nodeFilter}
              focusActive={focusActive}
              onNodeSelect={setSelectedNodeId}
            />
          </div>
        </Suspense>
        <NodeDetailPanel node={selectedNode} connectedCount={connectedCount} />
      </div>

      <GraphLegend onFilterChange={handleFilterChange} activeFilter={nodeFilter} />
    </div>
  );
}
