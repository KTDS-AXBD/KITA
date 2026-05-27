import { CypherBlock } from '@/components/platform';

const SAMPLE_CYPHER = `// CQ-002: 소부장 국산화 영향 분석
MATCH (e:Event)-[:IMPACTS]->(r:Region)
      -[:SUPPLIES]->(rm:RawMaterial)
      -[:ASSEMBLES]->(p:Product)
WHERE e.type = 'supply_disruption'
RETURN p.name AS 제품, rm.name AS 원자재,
       COUNT(DISTINCT r) AS 영향지역수
ORDER BY 영향지역수 DESC
LIMIT 10`;

export function ScenarioPage(): JSX.Element {
  return (
    <div className="op-page">
      <div className="op-section-header">
        <h2>시나리오 분석</h2>
        <p>CQ 선택 → NL 질의 → Cypher → 추론 → A~E 결과</p>
      </div>
      <div style={{ marginBottom: 20 }}>
        <CypherBlock code={SAMPLE_CYPHER} />
      </div>
      <div className="op-placeholder">
        CQ 선택·NL→Cypher 추론 애니메이션·A~E 분석결과 패널 — Sprint 20(F035)에서 구현 예정
      </div>
    </div>
  );
}
