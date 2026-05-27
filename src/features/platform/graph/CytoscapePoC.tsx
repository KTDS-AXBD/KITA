import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

const POC_ELEMENTS: cytoscape.ElementDefinition[] = [
  { data: { id: 'ev1', label: '호르무즈 봉쇄', type: 'event' } },
  { data: { id: 'rg1', label: '중동 지역', type: 'region' } },
  { data: { id: 'rm1', label: '정밀 볼스크류', type: 'raw' } },
  { data: { id: 'im1', label: '선형가이드', type: 'intermediate' } },
  { data: { id: 'pr1', label: '머시닝센터', type: 'product' } },
  { data: { id: 'co1', label: 'THK', type: 'company' } },
  { data: { id: 'co2', label: '삼익THK', type: 'company' } },
  { data: { id: 'in1', label: '공작기계 산업', type: 'industry' } },
  { data: { id: 'tr1', label: '대일 수입 무역', type: 'trade' } },
  { data: { id: 'ri1', label: '공급망 리스크', type: 'risk' } },
  // edges
  { data: { source: 'ev1', target: 'rg1', label: '발생지역' } },
  { data: { source: 'rg1', target: 'rm1', label: '원자재공급' } },
  { data: { source: 'rm1', target: 'im1', label: '부품제조' } },
  { data: { source: 'im1', target: 'pr1', label: '조립' } },
  { data: { source: 'co1', target: 'rm1', label: '공급사' } },
  { data: { source: 'co2', target: 'im1', label: '공급사' } },
  { data: { source: 'pr1', target: 'in1', label: '속함' } },
  { data: { source: 'tr1', target: 'rm1', label: '무역경로' } },
  { data: { source: 'ev1', target: 'ri1', label: '유발' } },
];

const NODE_COLORS: Record<string, string> = {
  event: '#E60012',
  region: '#FF9F0A',
  raw: '#8B6914',
  intermediate: '#7B68EE',
  product: '#2ECC71',
  company: '#3498DB',
  industry: '#E74C3C',
  trade: '#1ABC9C',
  risk: '#E60012',
};

export function CytoscapePoC(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const t0 = performance.now();

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: POC_ELEMENTS,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)' as unknown as string,
            'background-color': (ele: cytoscape.NodeSingular) =>
              NODE_COLORS[ele.data('type')] ?? '#999',
            color: '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': 10,
            'font-family': 'Pretendard, system-ui, sans-serif',
            width: 60,
            height: 60,
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
          } as cytoscape.Css.Edge,
        },
      ],
      layout: { name: 'cose', animate: false, randomize: false, padding: 20 },
    });

    const ms = Math.round(performance.now() - t0);
    console.log(`[CytoscapePoC] 초기화 ${ms}ms`);

    return () => { cyRef.current?.destroy(); };
  }, []);

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--op-text-tertiary)', marginBottom: 8 }}>
        cytoscape PoC · 10노드 소부장 미니 그래프 · 콘솔에서 초기화 시간 확인
      </div>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 400,
          border: '1px solid var(--op-border)',
          borderRadius: 'var(--op-radius)',
          background: '#FAFBFD',
        }}
      />
    </div>
  );
}
