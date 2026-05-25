# Sprint 13 — F026 Design: Repository GVC 재정렬 + 통합 시나리오

## §1 아키텍처 흐름

```
GvcRepository (F025)
  ├─ listProducts(domain)    → GvcProduct[]
  ├─ getNetwork(domain)      → GvcNetworkEdge[]
  └─ listMetrics(gvcCode)    → GvcMetric[]

gvcS6Adapter (NEW)
  ├─ adaptGvcGraph(products, edges) → KnowledgeGraph
  ├─ adaptGvcLayout(graph)          → PositionedGraph
  └─ adaptGvcKpis(domain, metrics)  → S6Kpi[]

gvcDomainStore (NEW)
  └─ activeDomain: GvcDomain ('mach' | 'semi') + setDomain()

S6Page.tsx (additive only)
  ├─ [기존 렌더 — s6Repository 경로 UNCHANGED]
  ├─ DomainToggle — activeDomain 전환
  ├─ GvcPane(domain) — GVC 분석 패널
  └─ GvcIntegration — 기계+반도체 교차 비교
```

## §2 gvcS6Adapter 설계

### adaptGvcGraph
- `GvcProduct[]` → `GraphNode[]` (tier별 타입: 장비=rnd, 부품=metric, 소재=hscode, null=company)
- `GvcNetworkEdge[]` → `GraphEdge[]`
- viewBox 고정 `"0 0 800 500"`

### adaptGvcLayout
- `layoutGraph()` (s6Snapshot.ts 재사용) — anchor=장비tier 노드, 소재 상단, 국가/기업 좌우호

### adaptGvcKpis
- 도메인 앵커 제품(tier='장비')의 GvcMetric 6개 → S6Kpi 4개 선택
  - metric_sales_growth → 매출 성장률
  - metric_capital_efficiency → 자본 효율
  - metric_inventory_turnover → 재고 회전
  - metric_rnd_growth → R&D 성장

## §3 gvcDomainStore 설계

```typescript
interface GvcDomainState {
  activeDomain: GvcDomain;       // 'mach' | 'semi'
  setDomain: (d: GvcDomain) => void;
}
// 기본값: 'mach' (기계, 기존 S6 테마와 일치)
```

## §4 컴포넌트 설계

### DomainToggle
- 두 버튼 (기계 GVC / 반도체 GVC)
- activeDomain = 선택 강조
- setDomain(d) 호출

### GvcPane
props: `{ domain: GvcDomain }`
- `gvcRepository.listProducts(domain)` + `getNetwork(domain)` → adaptGvcGraph → KGraph
- `gvcRepository.listMetricsByDomain(domain, key)` → 지표 미니 테이블
- 출처 표기: provenance=virt → DataMark kind="virt"

### GvcIntegration
- 두 도메인 나란히 (mach / semi)
- 공통 tier(소재·부품·장비) 존재 여부 교차 표시
- 자립화 지표 대조 (import > export → 수입의존, ⚠️ 표시)

## §5 S6Page 삽입 위치

```jsx
{/* 기존 렌더 — UNCHANGED */}
...

{/* ─── F026 additive sections ─── */}
<GvcSection>
  <DomainToggle />          {/* 도메인 전환 */}
  <GvcPane domain={activeDomain} />   {/* GVC 분석 패널 */}
  <GvcIntegration />        {/* 통합 시나리오 */}
</GvcSection>
```

Callout 바로 위, ProvenanceLegend 바로 위에 삽입.

## §6 테스트 계약

| 테스트 | 확인 |
|--------|------|
| adaptGvcGraph(mach) — 4노드 4엣지 | nodes.length=4, edges.length=4 |
| adaptGvcGraph(semi) — 4노드 3엣지 | nodes.length=4, edges.length=3 |
| 장비tier 노드 type='rnd' | node.type==='rnd' |
| adaptGvcKpis(mach) — 4개 S6Kpi | items.length=4, label 포함 |
| gvcDomainStore 초기값 'mach' | activeDomain==='mach' |
| setDomain('semi') 후 'semi' | activeDomain==='semi' |
