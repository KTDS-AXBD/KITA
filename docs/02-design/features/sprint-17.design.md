---
id: KOAMI-DESIGN-017
title: Sprint 17 Design — F031·F036·F037 정적 콘텐츠 3종
sprint: 17
f_items: [F031, F036, F037]
status: in_progress
created: 2026-05-27
---

# Sprint 17 Design — 정적 콘텐츠 3종

## §1. 아키텍처 결정

- 3개 페이지 모두 **완전 정적 Mock** — 외부 API 없음
- S16 컴포넌트(`KpiCard`, `Badge`, `DataTable`, `Timeline`) 최대 재사용
- 신규 컴포넌트: `StatusDot` (1개)
- 신규 데이터 파일: `dataSources.ts` (F031 fixtures)
- 스타일: 기존 `v032-tokens.css` CSS vars (`--op-*`) 인라인 스타일 패턴 유지

## §2. 파일 매핑

| 파일 | 작업 | 내용 |
|------|------|------|
| `src/components/platform/StatusDot.tsx` | 신규 | 상태 닷 (green/amber/gray) |
| `src/components/platform/index.ts` | 수정 | StatusDot export 추가 |
| `src/features/platform/data/dataSources.ts` | 신규 | 27건 DataSource 배열 |
| `src/features/platform/data/DataStatusPage.tsx` | 수정 | placeholder → 실 테이블 |
| `src/features/platform/compare/ComparePage.tsx` | 수정 | 전체 구현 |
| `src/features/platform/plan/PlanPage.tsx` | 수정 | 타임라인 + CQ + 푸터 |

## §3. 컴포넌트 설계

### StatusDot

```tsx
type DotStatus = 'connected' | 'collecting' | 'unavailable';
const DOT_COLORS: Record<DotStatus, string> = {
  connected: '#2ECC71',    // green
  collecting: '#F39C12',   // amber
  unavailable: '#CCCCCC',  // gray
};
const DOT_LABELS: Record<DotStatus, string> = {
  connected: '연동',
  collecting: '수집',
  unavailable: '미확보',
};
// 렌더: ● {label} (dot 8px + 텍스트 12px)
```

### dataSources.ts — 27건 배열

소부장(공작기계) 우선 정렬, 호르무즈 통합:

**실 데이터 (19건)**:
1. GIVC 품목-HS코드 / 실 / GIVC mart.lnk0951a / connected / both
2. 소부장넷 기업 DB / 실 / GIVC enp0111y / connected / sobujiang
3. R&D/리스크 시계열 / 실 / GIVC scmm_his_chart / connected / sobujiang
4. EWS 경보 / 실 / GIVC EWS / connected / both
5. 산업동향 보고서 / 실 / GIVC 보고서 DB / connected / both
6. GIVC 밸류체인 분류 / 실 / GIVC / connected / sobujiang
7. 관세청 수출입 통계 / 실 / 관세청 UNIPASS / connected / sobujiang
8. DART 기업 공시 / 실 / 금감원 DART / connected / sobujiang
9. 공작기계 수급통계 / 실 / KOMMA / collecting / sobujiang
10. 산업연관표 투입계수 / 실 / 한국은행 ECOS / collecting / both
11. 생산동향 / 실 / 통계청 KOSIS / collecting / sobujiang
12. 소재 수입의존도 / 실 / 관세청 UNIPASS / collecting / sobujiang
13. 일본 공작기계 수출통계 / 실 / JMTBA / collecting / sobujiang
14. 원유 수입 통계 / 실 / 한국석유공사 Petronet / collecting / hormuz
15. 원자재 가격 / 실 / KOMIS / collecting / hormuz
16. 석유화학 수급 통계 / 실 / KPIA / collecting / hormuz
17. 원유 비축 현황 / 실 / 한국석유공사 / collecting / hormuz
18. 기업 신용 등급 추이 / 실 / NICE/KIS / collecting / sobujiang
19. R&D 투자 동향 / 실 / 과학기술정보연구원 KISTI / collecting / sobujiang

**추정 데이터 (4건)**:
20. 특허 출원 동향 / 추정 / KIPRIS / unavailable / sobujiang
21. 국가 R&D 과제 / 추정 / NTIS / unavailable / sobujiang
22. 뉴스 데이터 / 추정 / 뉴스 API / unavailable / both
23. 글로벌 공작기계 시장 / 추정 / Gardner Research / unavailable / sobujiang

**유료 데이터 (4건)**:
24. 글로벌 무역 분석 / 유료 / ITC Trade Map / unavailable / both
25. 공작기계 가격 인덱스 / 유료 / S&P Global / unavailable / sobujiang
26. 기업 신용 DB / 유료 / Bloomberg / unavailable / sobujiang
27. 원유 선물 / 유료 / Reuters Eikon / unavailable / hormuz

## §4. 페이지별 렌더 설계

### DataStatusPage (F031)

```
┌─ op-page ─────────────────────────────────┐
│ section-header: 데이터 현황 / 27건...       │
│                                             │
│ ┌─ KPI 4종 (grid 4col) ──────────────────┐ │
│ │ 총 27  │ 실 19    │ 추정 4  │ 유료 4   │ │
│ └────────────────────────────────────────┘ │
│                                             │
│ ┌─ card (overflow-x:auto) ───────────────┐ │
│ │ badge-legend: [실][추정][유료]           │ │
│ │ ─────────────────────────────────────  │ │
│ │ DataTable: 상태·#·데이터명·구분·출처...  │ │
│ └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

DataTable rows: `dataSources.map(ds => ({ 상태: <StatusDot/>, '#': ds.id, 데이터명: ds.name, 구분: <Badge/>, ... }))`

### ComparePage (F036)

```
┌─ op-page ─────────────────────────────────┐
│ section-header: 비교 검증 / 기존 방식 vs...  │
│                                             │
│ ┌── 2-card grid (1fr 1fr) ───────────────┐ │
│ │ chatGIVC (LLM+RAG)  │ 온톨로지+KG       │ │
│ │ ─ header            │ ─ header          │ │
│ │ ─ 채팅버블 Q+A       │ ─ Top3 바         │ │
│ │ ─ ✗ ✗ ✗ ✗ 주석     │ ─ 인과경로 박스   │ │
│ │                     │ ─ ✓ ✓ ✓ ✓ ✓ ✓   │ │
│ └────────────────────────────────────────┘ │
│                                             │
│ ┌─ card (overflow) ──────────────────────┐ │
│ │ 6축 비교표 (DataTable)                  │ │
│ └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**질의 내용 (소부장 도메인)**:
- Q: "공작기계 국산화 R&D 기업을 선정하려면 어떤 기업을 봐야 하나요?"
- chatGIVC A: 일반적 답변 + ✗ 4개 (품목 미제시, 인과경로 없음, 정량 근거 없음, 대응옵션 불가)
- 온톨로지 A: R&D Top3 (대한정밀감속기 94.2, 서원베어링테크 87.6, 에스피지 72.3) + 경로박스 + ✓ 6개

**6축 비교**:
| 비교 축 | LLM+RAG | 온톨로지+KG |
| 인과관계 추적 | 문서 기반, 경로 추적 불가 | 관계 그래프 6단계 자동 추적 |
| 설명가능성 | "이 문서에서 찾았습니다" | "A→B→C, R&D 투자율 72.3%" |
| 재현성 | 같은 질문, 다른 답변 가능 | 같은 그래프 = 같은 답변 |
| 시나리오 예측 | 구조적 답변 불가 | 조건 변경 → 영향 자동 재계산 |
| 대응 옵션 | 일반론 수준 | 데이터 기반 비교 + 근거 |
| 데이터 신뢰 | 출처: "문서 p.23" | 출처: 산업연관표 72.3% |

### PlanPage (F037)

```
┌─ op-page ─────────────────────────────────┐
│ section-header: 추진 계획 / 6월 리뷰까지    │
│                                             │
│ ┌─ card (Timeline) ──────────────────────┐ │
│ │ Phase 0 (done) → 1 (active) → 2 → 3 → 4│ │
│ └────────────────────────────────────────┘ │
│                                             │
│ h3: Competency Question 목록               │
│                                             │
│ ┌─ CQ Tier1 ─────────────────────────────┐ │
│ │ Tier 1 — 시연 대상                       │ │
│ │ [CQ-002] 소부장 자립화 R&D 기업 Top5...  │ │
│ │ [CQ-001] 호르무즈 봉쇄 시 영향 품목...   │ │
│ └────────────────────────────────────────┘ │
│                                             │
│ ┌─ CQ Tier2 ─────────────────────────────┐ │
│ │ Tier 2 — 고객 확인 후 추가               │ │
│ │ CQ-003 ~ CQ-007 목록                    │ │
│ └────────────────────────────────────────┘ │
│                                             │
│ footer: KT DS AX컨설팅팀 | 2026            │
└─────────────────────────────────────────────┘
```

**타임라인 데이터** (existing Timeline 컴포넌트, 데이터 교체):
```ts
const PHASES = [
  { phase: 'Phase 0', label: '준비', date: '5/26~5/30', status: 'done',     desc: 'CQ 질의서 발송 · 데이터 수집 착수' },
  { phase: 'Phase 1', label: '시나리오 확정', date: '6/2~6/6', status: 'active',   desc: 'CQ 회신 분석 · 데이터 정제/스키마 확정' },
  { phase: 'Phase 2', label: 'KG 구축', date: '6/9~6/13', status: 'upcoming', desc: 'Neo4j 구축 · CQ 검증' },
  { phase: 'Phase 3', label: '시연 준비', date: '6/16~6/20', status: 'upcoming', desc: 'UI 구현 · 비교 검증' },
  { phase: 'Phase 4', label: '리뷰', date: '6/23~6/27', status: 'upcoming', desc: '내부 리허설 · 고객 Prototype 리뷰' },
];
```

> **주의**: Timeline 컴포넌트는 `label`과 `date`·`status`만 받으므로, `desc` 표시가 필요하면 PlanPage에서 확장하거나 인라인으로 처리한다.

**CQ 데이터**:
- Tier1: CQ-002 (소부장 R&D), CQ-001 (호르무즈 영향)
- Tier2: CQ-003~007 (공작기계 도메인 5건)

## §5. 스타일 패턴

기존 `ComparePage` 인라인 스타일 패턴:
```css
/* 2-카드 */
display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px;

/* 카드 */
background: var(--op-bg-card); border-radius: var(--op-radius); border: 1px solid var(--op-border); overflow: hidden;

/* 카드 헤더 */
padding: 14px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid var(--op-border);

/* 채팅버블 */
padding: 10px 14px; border-radius: 8px; font-size: 13px; line-height: 1.6; margin-bottom: 10px;
user: background #F4F6FB; ai: background #FFFFFF border 1px solid var(--op-border)

/* annotation */
padding: 6px 10px; border-radius: 6px; font-size: 12px; margin-bottom: 6px;
negative: background #FFF0F0; color #D32F2F; positive: background #F0FFF4; color #2E7D32;

/* impact bar */
height: 8px; border-radius: 4px; background #E8ECF1; fill: background var(--op-accent);

/* CQ section */
background var(--op-bg-card); border-radius var(--op-radius); border 1px solid var(--op-border); padding 16px 20px; margin-bottom 12px;

/* CQ tier label */
font-size 11px; font-weight 700; padding 3px 10px; border-radius 12px;
Tier1: background #E60012; color #FFF;  Tier2: background #E8ECF1; color #666;

/* CQ item */
display flex; align-items center; gap 12px; padding 10px 0; border-bottom 1px solid var(--op-border);
CQ id: font-size 12px; font-weight 700; min-width 52px; color var(--op-accent);
Tier2 id: color #AAAAAA;

/* footer */
text-align center; font-size 12px; color var(--op-text-tertiary); padding 24px 0 16px; border-top 1px solid var(--op-border); margin-top 32px;
```

## §6. 테스트 전략

- 기존 vitest 71건 회귀 0 확인
- 신규 유닛 테스트 불필요 (정적 데이터 렌더, 로직 없음)
- `pnpm typecheck` — `dataSources.ts` 타입 정합성 확인
- `pnpm build` — 번들 size 증가 확인 (CSS 없으므로 미미할 것)
