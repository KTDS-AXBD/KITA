import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import type { CytoGraph, CytoNodeType } from '@/types';

interface GraphCanvasProps {
  graph: CytoGraph;
  nodeFilter: string;
  focusActive: boolean;
  onNodeSelect: (nodeId: string | null) => void;
}

const NODE_TYPE_KEYS: Record<CytoNodeType, string> = {
  Event: '--op-color-event',
  Region: '--op-color-region',
  Country: '--op-color-country',
  RawMaterial: '--op-color-raw',
  IntermediateGoods: '--op-color-intermediate',
  Product: '--op-color-product',
  Industry: '--op-color-industry',
  Company: '--op-color-company',
  EWSAlert: '--op-color-ews',
  RnDProject: '--op-color-rnd',
  PolicyOption: '--op-color-policy',
  TradeRecord: '--op-color-trade',
  RiskIndicator: '--op-color-risk',
};

function resolveNodeColors(): Record<string, string> {
  const s = getComputedStyle(document.documentElement);
  const result: Record<string, string> = {};
  for (const [type, cssVar] of Object.entries(NODE_TYPE_KEYS)) {
    result[type] = s.getPropertyValue(cssVar).trim() || '#999';
  }
  return result;
}

export function GraphCanvas({ graph, nodeFilter, focusActive, onNodeSelect }: GraphCanvasProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // 그래프 교체 (도메인 변경 시)
  useEffect(() => {
    if (!containerRef.current) return;
    cyRef.current?.destroy();

    const t0 = performance.now();
    const nodeColors = resolveNodeColors();

    const elements: cytoscape.ElementDefinition[] = [
      ...graph.nodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          hormuz: n.hormuz,
        },
        position: n.position,
      })),
      ...graph.edges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          type: e.type,
        },
      })),
    ];

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)' as unknown as string,
            'background-color': (ele: cytoscape.NodeSingular) =>
              nodeColors[ele.data('type') as string] ?? '#999',
            color: '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': 10,
            'font-family': 'Pretendard, system-ui, sans-serif',
            'text-wrap': 'wrap' as unknown as string,
            width: 64,
            height: 64,
            'border-width': 2,
            'border-color': '#fff',
          } as cytoscape.Css.Node,
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#C8CDD5',
            'target-arrow-color': '#C8CDD5',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)' as unknown as string,
            'font-size': 9,
            color: '#888',
            'font-family': 'Pretendard, system-ui, sans-serif',
          } as cytoscape.Css.Edge,
        },
        {
          selector: 'edge[type="impact"]',
          style: {
            width: 2.5,
            'line-color': '#E60012',
            'target-arrow-color': '#E60012',
          } as cytoscape.Css.Edge,
        },
        {
          selector: '.dimmed',
          style: {
            opacity: 0.15,
          } as cytoscape.Css.Node,
        },
        {
          selector: 'node.selected',
          style: {
            'border-color': '#E60012',
            'border-width': 3,
          } as cytoscape.Css.Node,
        },
      ],
      layout: { name: 'cose', animate: false, randomize: false, padding: 30 },
    });

    console.log(`[GraphCanvas] ${graph.domain} 초기화 ${Math.round(performance.now() - t0)}ms · 노드 ${graph.nodes.length} · 엣지 ${graph.edges.length}`);

    const cy = cyRef.current;

    cy.on('tap', 'node', (evt: cytoscape.EventObject) => {
      cy.nodes().removeClass('selected');
      evt.target.addClass('selected');
      onNodeSelect(evt.target.id() as string);
    });

    cy.on('tap', (evt: cytoscape.EventObject) => {
      if (evt.target === cy) {
        cy.nodes().removeClass('selected');
        onNodeSelect(null);
      }
    });

    return () => { cyRef.current?.destroy(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph]);

  // 필터 + 영향경로 (graph 변경 없이 state만 변경 시)
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass('dimmed');

    if (focusActive) {
      cy.elements().addClass('dimmed');
      if (graph.domain === 'hormuz') {
        cy.nodes('[hormuz]').removeClass('dimmed');
        cy.nodes('[hormuz]').connectedEdges().removeClass('dimmed');
      } else {
        const focusNodes = cy.nodes('[type="RnDProject"],[type="RiskIndicator"],[type="Event"]');
        focusNodes.removeClass('dimmed');
        focusNodes.connectedEdges().removeClass('dimmed');
        focusNodes.neighborhood('node').removeClass('dimmed');
      }
    } else if (nodeFilter !== 'all') {
      cy.elements().addClass('dimmed');
      const matched = cy.nodes(`[type="${nodeFilter}"]`);
      matched.removeClass('dimmed');
      matched.connectedEdges().removeClass('dimmed');
      matched.neighborhood('node').removeClass('dimmed');
    }
  }, [nodeFilter, focusActive, graph.domain]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        minHeight: 480,
        border: '1px solid var(--op-border)',
        borderRadius: 'var(--op-radius)',
        background: '#FAFBFD',
      }}
    />
  );
}
