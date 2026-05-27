# Sprint 18 Design — F032 CQ 관리 · F033 온톨로지 정의

> 작성: 2026-05-27 · Sprint 18 · F032·F033 · 참조: v0.32 프로토타입 §cq-layout, §page-ontology

---

## §1. F032 — CQ 관리 페이지 레이아웃

```
<CqManagePage>
  <div style="display:flex; height:100%"> ← op-page 내
    <!-- 좌 패널 280px -->
    <div style="width:280px; border-right:1px solid var(--op-border)">
      <header>
        <h3>Competency Questions</h3>
        <button "+ CQ 추가">
      </header>
      <FilterPills>  ← 전체 / Tier 1 / Tier 2 / 검증완료 / 미검증
      <CqCardList>   ← 필터된 CqListCard × N
    </div>
    <!-- 우 패널 flex:1 -->
    <CqDetailPanel>  ← selectedCq 기반 상세 표시
      §질문 정의 (CQ ID·Tier·상태·질문·배경)
      §관련 엔티티/관계 (EntityTag pills)
      §그래프 쿼리 (<CypherBlock />)
      §검증 결과 (2×2 grid + 결과 품목 chips)
      §데이터 요구사항 (table: 데이터명·출처·상태배지)
    </CqDetailPanel>
  </div>
  <Modal open={addModalOpen}>  ← CQ 등록 폼
</CqManagePage>
```

---

## §2. F032 — CQ 데이터 모델 (`cqData.ts`)

```typescript
type CqStatus = 'verified' | 'draft' | 'pending';
type CqTier = 1 | 2;

interface CqEntityTag { name: string; color: string; }

interface CqDataReq { data: string; source: string; status: 'confirmed' | 'partial' | 'pending'; }

interface CqItem {
  id: string;           // 'CQ-001'
  tier: CqTier;
  status: CqStatus;
  question: string;
  background: string;
  entityCount: number;
  relationCount: number;
  entities: CqEntityTag[];
  relations: string[];
  cypher: string;
  verifiedAt?: string;
  statsNodes?: number;
  statsEdges?: number;
  statsTime?: number;
  resultItems?: string[];
  dataRequirements?: CqDataReq[];
}
```

**CQ 목록 (7건)**:
- CQ-001: Tier1 verified — 호르무즈 해협 봉쇄 시 소부장 밸류체인 영향 Top5
- CQ-002: Tier1 verified — R&D 공고 시 공작기계 기업 Top5 추천
- CQ-003: Tier2 draft — 핵심 소재 수입선 다변화 시나리오
- CQ-004: Tier2 draft — 공작기계 EWS 경보 연관 품목
- CQ-005: Tier2 draft — 소부장 국산화율 임계 기업
- CQ-006: Tier2 draft — 정책 우선순위 3가지
- CQ-007: Tier2 pending — 공급망 충격 해소 후 구조적 취약 품목

---

## §3. F033 — 온톨로지 정의 페이지 레이아웃

```
<OntologyPage>
  §섹션헤더 — "온톨로지 모델 정의" + 부제
  §KPI row (4칸 grid)
    [엔티티 타입: 13] [관계 타입: 8] [총 인스턴스: 161] [총 관계: 331]
  §엔티티 카드 grid (3열)
    <EntityCard /> × 13 (재활용 컴포넌트)
  §관계 정의 섹션
    header: "관계 정의" + 부제 + "+ 관계 편집" button
    table: 관계명 / 출발 / 도착 / 속성 / 데이터출처
    행 클릭 → 관계 편집 Modal
  §제약 정의 섹션
    header: "온톨로지 제약 (Constraints)"
    <pre style="background:#1E1E2E"> ← Cypher 제약 블록 (다크)
  <Modal open={relationModalOpen}>
    관계 상세 (읽기 전용 — 편집 form P2)
</OntologyPage>
```

---

## §4. F033 — 온톨로지 데이터 모델 (`ontologyData.ts`)

```typescript
interface OntologyEntity {
  label: string;            // 'Event'
  labelKr: string;          // '사건'
  subtitle: string;         // '지정학·공급망 충격 이벤트'
  colorVar: string;         // 'var(--op-color-event)'
  colorHex: string;         // '#E60012' (for inline style)
  attrs: { name: string; tooltip: string }[];
  count: number;
}

interface RelAttr { name: string; tooltip: string; }

interface OntologyRelation {
  name: string;             // 'DISRUPTS'
  tooltip: string;
  from: string;             // 'Event'
  to: string;               // 'Region'
  attrs: RelAttr[];
  source: string;           // '시나리오 정의'
}
```

**엔티티 13종** (소부장·호르무즈 공통 스키마):
1. Event (#E60012) · 2. Region (#FF9F0A) · 3. Country (#4A90D9) · 4. RawMaterial (#8B6914)
5. IntermediateGoods (#7B68EE) · 6. Product (#2ECC71) · 7. Industry (#E74C3C) · 8. Company (#3498DB)
9. EWS (#F39C12) · 10. Policy (#34495E) · 11. RnD (#9B59B6) · 12. Supply (#1ABC9C) · 13. Risk (#E60012)

**관계 8종** (from v0.32 prototype):
1. DISRUPTS (Event→Region) · 2. CONTROLS_ROUTE (Region→Country) · 3. EXPORTS (Country→RawMaterial)
4. REFINES_TO (RawMaterial→IntermediateGoods) · 5. INPUT_TO (IntermediateGoods→Product)
6. PRODUCES (Company→Product) · 7. BELONGS_TO (Product→Industry) · 8. TRIGGERS_POLICY (EWS→Policy)

---

## §5. 파일 매핑 (Worker)

| 파일 | 기존 | 변경 |
|------|------|------|
| `src/features/platform/cq/cqData.ts` | 없음 | 신규 생성 |
| `src/features/platform/cq/CqManagePage.tsx` | stub (16줄) | 전체 교체 |
| `src/features/platform/ontology/ontologyData.ts` | 없음 | 신규 생성 |
| `src/features/platform/ontology/OntologyPage.tsx` | stub (26줄) | 전체 교체 |

---

## §6. 테스트 전략

- 기존 vitest 71 유지 (신규 테스트 추가 없음 — UI 인터랙션 전용)
- `pnpm typecheck` 0 에러 — strict null check
- `pnpm build` 번들 크기 확인 (이전 713KB 대비 큰 변화 없어야 함)
