import { CytoscapePoC } from './CytoscapePoC';

export function GraphPage(): JSX.Element {
  return (
    <div className="op-page">
      <div className="op-section-header">
        <h2>지식그래프</h2>
        <p>소부장·공작기계 인과 관계 네트워크 · cytoscape.js</p>
      </div>
      <CytoscapePoC />
      <div className="op-placeholder" style={{ marginTop: 20 }}>
        노드 상세 패널·범례·도메인 토글(소부장↔호르무즈)·영향경로 — Sprint 19(F034)에서 구현 예정
      </div>
    </div>
  );
}
