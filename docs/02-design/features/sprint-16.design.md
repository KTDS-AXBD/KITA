# Sprint 16 Design — F030 디자인 시스템 + 앱 셸

> 작성: 2026-05-27 · Sprint 16 · F030 · 참조: v0.32 프로토타입 4248줄

---

## §1. 디자인 토큰 (v032-tokens.css)

v0.32 프로토타입 CSS :root에서 추출. 기존 AXIS 변수(`--axis-*`)와 병존.

```css
/* src/styles/v032-tokens.css */
:root {
  /* 배경 */
  --op-bg-base: #F4F6FB;
  --op-bg-card: #FFFFFF;
  /* 텍스트 */
  --op-text-primary: #111111;
  --op-text-secondary: #666666;
  --op-text-tertiary: #999999;
  /* 경계·그림자 */
  --op-border: #E8ECF1;
  --op-shadow: 0 1px 3px rgba(0,0,0,0.08);
  --op-shadow-lg: 0 4px 12px rgba(0,0,0,0.08);
  /* 액센트 */
  --op-accent: #E60012;
  --op-accent-light: rgba(230, 0, 18, 0.06);
  /* 형태 */
  --op-radius: 12px;
  --op-radius-sm: 8px;
  /* 레이아웃 */
  --op-sidebar-width: 240px;
  --op-header-height: 48px;
  /* 노드 색상 (11종 — 지식그래프용) */
  --op-color-event: #E60012;
  --op-color-region: #FF9F0A;
  --op-color-country: #4A90D9;
  --op-color-raw: #8B6914;
  --op-color-intermediate: #7B68EE;
  --op-color-product: #2ECC71;
  --op-color-industry: #E74C3C;
  --op-color-company: #3498DB;
  --op-color-ews: #F39C12;
  --op-color-rnd: #9B59B6;
  --op-color-policy: #34495E;
  --op-color-trade: #1ABC9C;
  --op-color-risk: #E60012;
}
```

> Prefix `--op-` (Ontology Platform)로 기존 `--axis-*`와 네임스페이스 격리.

---

## §2. 레이아웃 구조

```
<AppLayout>           ← display:flex, height:100vh
  <Sidebar />         ← fixed, 240px, overflow-y:auto
  <div.op-main-area>  ← margin-left:240px, flex:1, flex-direction:column
    <HeaderBar />     ← height:48px, sticky, breadcrumb + right slot
    <div.op-page-content>  ← padding: 28px 32px 48px
      {page}
    </div>
  </div>
</AppLayout>
```

### 사이드바 구조
```
.op-sidebar
  .op-sidebar-logo     ← 로고(fallback: 빨간 "G" 블록) + 제목
  .op-sidebar-subtitle ← "GIVC Ontology Platform"
  --- MAIN MENU ---
  SidebarItem [data-page, icon, label] × 5
  --- REFERENCE ---
  SidebarItem × 2 (비교검증, 추진계획)
  .op-sidebar-footer   ← "v0.32 · KT DS AX컨설팅팀"
```

---

## §3. 라우팅 확장

```typescript
// useHashRoute.ts: 라우트 목록 추가
const PLATFORM_ROUTES = [
  '/platform/data',
  '/platform/cq',
  '/platform/ontology',
  '/platform/graph',
  '/platform/scenario',
  '/platform/compare',
  '/platform/plan',
] as const;

// App.tsx 분기
'/platform/data'     → <DataStatusPage />
'/platform/cq'       → <CqManagePage />
'/platform/ontology' → <OntologyPage />
'/platform/graph'    → <GraphPage />   // cytoscape PoC 포함
'/platform/scenario' → <ScenarioPage />
'/platform/compare'  → <ComparePage />
'/platform/plan'     → <PlanPage />
```

---

## §4. 공용 컴포넌트 API

### KpiCard
```tsx
interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accentColor?: string;
}
```

### DataTable
```tsx
interface DataTableProps {
  columns: { key: string; label: string; width?: string }[];
  rows: Record<string, React.ReactNode>[];
}
```

### EntityCard
```tsx
interface EntityCardProps {
  title: string;
  subtitle?: string;
  colorBlock: string;         // CSS color
  attrs: string[];            // attribute pill labels
  count?: number;             // top-right count
  tooltip?: string;           // attr tooltip text
}
```

### Badge
```tsx
type BadgeVariant = 'real' | 'estimate' | 'paid' | 'verified' | 'draft' | 'pending';
interface BadgeProps { variant: BadgeVariant; label?: string; }
// real='실' | estimate='추정' | paid='유료'
// verified='verified' | draft='draft' | pending='pending'
```

### CypherBlock
```tsx
interface CypherBlockProps { code: string; }
// 다크 배경(#1E1E2E) + 토큰: keyword(#89B4FA) entity(#A6E3A1) prop(#F9E2AF) comment(#6C7086)
// 단순 regex 기반 하이라이팅 (neo4j 키워드)
```

### Tooltip (3-type)
```tsx
// Type 1: AttrTooltip — attr pill (entity 속성)
// Type 2: InfoTip    — ⓘ 버튼 (standalone)
// Type 3: RelAttr    — 관계 속성 (점선 언더라인)
interface TooltipProps {
  type: 'attr' | 'info' | 'rel';
  label: string;
  content: string;
}
```

### Toggle
```tsx
interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}
```

### Modal
```tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;  // default 480
}
```

### Timeline
```tsx
interface TimelineItem {
  phase: string;       // "Phase 0"
  label: string;
  date: string;
  status: 'done' | 'active' | 'upcoming';
}
interface TimelineProps { items: TimelineItem[]; }
```

---

## §5. cytoscape PoC 설계

```typescript
// src/features/platform/graph/CytoscapePoC.tsx
// 의존성: cytoscape@^3.28.1, @types/cytoscape
// 성능 목표: 초기화 <200ms (10노드 기준)

interface PocNode {
  id: string;
  label: string;
  color: string;  // var(--op-color-*)에 대응하는 hex
}
interface PocEdge { source: string; target: string; label?: string; }
```

더미 데이터: 소부장 공작기계 미니 그래프 (이벤트→지역→원자재→중간재→제품→산업)

---

## §6. 플레이스홀더 페이지 패턴

모든 플레이스홀더 페이지 공통 구조:
```tsx
export function DataStatusPage(): JSX.Element {
  return (
    <div className="op-page">
      <div className="op-section-header">
        <h2>데이터 현황</h2>
        <p>27개 데이터소스 · 실 19 / 추정 4 / 유료 4</p>
      </div>
      <div className="op-placeholder">
        Sprint 17에서 구현 예정
      </div>
    </div>
  );
}
```

KPI 행 + 테이블 stub은 DataStatusPage에만 적용(F030 컴포넌트 동작 검증용).

---

## §7. 기존 라우트 보존 전략

App.tsx 분기:
```tsx
// platform/* → 신규 AppLayout (사이드바)
// 그 외 → 기존 AppHeader (상단 탭, 호환 유지)
const isPlatform = route.startsWith('/platform/');
if (isPlatform) {
  return <AppLayout route={route}><PageForRoute /></AppLayout>;
}
// 기존 흐름 유지 (LandingPage, S4Page, S6Page, ...)
```

---

## §8. 테스트 계약

기존 71개 테스트 PASS 유지가 최우선. 신규 단위 테스트:
- `Badge` 렌더 테스트 (3 variant × label 확인)
- `KpiCard` props 렌더 테스트
- `Modal` open/close 동작 테스트
- 라우팅: `/platform/data` → DataStatusPage 렌더 확인

---

## §9. Match Rate 기준

| 항목 | 가중치 | 기준 |
|------|--------|------|
| 사이드바 7메뉴 렌더 | 30% | 클릭→페이지 전환 |
| 디자인 토큰 적용 | 15% | #E60012 + Pretendard |
| 공용 컴포넌트 9종 | 30% | import 가능 + 렌더 |
| cytoscape PoC | 15% | 그래프 렌더 + <200ms |
| 기존 라우트 보존 | 10% | 5개 라우트 정상 |
