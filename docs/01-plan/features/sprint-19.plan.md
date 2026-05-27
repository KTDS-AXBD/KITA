---
id: KOAMI-PLAN-019
type: plan
sprint: 19
features: [F034, F038]
created: 2026-05-27
status: approved
---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | `/platform/graph` 라우트가 PoC 10노드 스텁 — 소부장/호르무즈 2도메인 지식그래프와 노드 상세 패널이 없어 시연 하이라이트 부재 |
| **Solution** | cytoscape dynamic import + 37/63노드 풀그래프 + 노드 클릭 상세패널 + 도메인 토글/필터/영향경로 툴바 |
| **Functional UX Effect** | 노드 클릭 → 우측 패널에 출처·상세·관련 데이터 즉시 표시 / 도메인 토글로 소부장↔호르무즈 전환 / 노드 타입 필터 + 영향경로 집중 |
| **Core Value** | chatGIVC(LLM) 대비 온톨로지+KG의 인과추적·재현성 우월성을 그래프 인터랙션으로 증명 |

---

## §1 목표

1. **F034**: 지식그래프 페이지 완전 구현 — cytoscape 소부장/호르무즈 풀그래프 + 노드 상세패널 + 범례 + 툴바
2. **F038**: 데이터레이어 정비 — 그래프 Repository 추가, 기존 fixtures 출처메타 일관성, D1 real 어댑터 재활용 구조 명시
3. **번들 최적화**: cytoscape dynamic import → 현 745KB 감소

## §2 범위

### F034 — 지식그래프 페이지

**포함**:
- `src/features/platform/graph/graphData.ts` — 소부장(37노드+엣지) + 호르무즈(63노드+엣지) TypeScript 픽스처
- `src/features/platform/graph/GraphPage.tsx` — 전면 재구현 (PoC 제거, 풀 레이아웃)
- `src/features/platform/graph/GraphCanvas.tsx` — cytoscape 캔버스 (lazy import)
- `src/features/platform/graph/NodeDetailPanel.tsx` — 노드 클릭 상세 우측 패널
- `src/features/platform/graph/GraphLegend.tsx` — 노드 타입별 색상/레전드
- `src/features/platform/graph/GraphToolbar.tsx` — 도메인 토글 + 노드 필터 셀렉트 + 영향경로 버튼
- `CytoscapePoC.tsx` 제거 (GraphPage에 흡수)

**제외**:
- NL→Cypher 시연 (F035, S20)
- D1 real 그래프 데이터 적재 (F038 어댑터 구조 정의만, 실 데이터는 S21)

### F038 — 데이터 레이어

**포함**:
- `src/data/repository/GraphRepository.ts` — 소부장/호르무즈 그래프 Mock + real 어댑터 (index.ts 토글)
- `src/data/mock/graph.ts` — graphData.ts에서 export한 Mock
- 기존 `dataSources.ts`, `cqData.ts`, `ontologyData.ts` 출처메타 점검 (누락 시 보완)
- F035용 `scenarioResults.ts` 스텁 (소부장 Top5 결과 Mock)
- `src/data/repository/index.ts` GraphRepository export 추가

**제외**:
- koami-givc D1 real 그래프 쿼리 실제 구현 (S21에서 처리)
- 시나리오 Repository 구현체 (F035 범위)

## §3 기존 코드 실측

```
src/features/platform/graph/CytoscapePoC.tsx  — 호르무즈 기반 10노드 PoC, 제거 대상
src/features/platform/graph/GraphPage.tsx     — stub, 전면 재구현
src/data/mock/dataSources.ts                  — 27소스 ✅ (source 필드 확인 필요)
src/data/mock/cqData.ts (=features/platform/cq/cqData.ts) — CQ 7건 ✅
src/features/platform/ontology/ontologyData.ts — 엔티티13·관계8 ✅
src/data/repository/S6Repository.ts          — GraphRepository 패턴 참조
src/data/repository/index.ts                 — GraphRepository export 추가 필요
docs/spec/기진회_2차세미나_프로토타입_v0.32_260527.html — 그래프 데이터 원천
```

## §4 기술 결정

| 항목 | 결정 | 근거 |
|------|------|------|
| **cytoscape import** | `React.lazy` + `Suspense` + dynamic import | 현 745KB → ~400KB 이하 목표 |
| **그래프 레이아웃** | `cose` (force-directed, cytoscape 내장) | 프로토타입 동일, 외부 확장 불필요 |
| **노드 상세 패널** | 우측 사이드 패널 (GraphPage 내 state) | 프로토타입 `.detail-panel` 패턴 |
| **도메인 토글** | `useState<'sobujiang' \| 'hormuz'>` in GraphPage | F030 DomainToggle 컴포넌트 재활용 |
| **노드 필터** | `<select>` → cytoscape `addClass('dimmed')` | 프로토타입 `filterGraphNodes` 패턴 |
| **영향경로 집중** | 버튼 토글 → `hormuz/sobujiang` 플래그 노드만 표시 | 프로토타입 `toggleHormuzFocus` 패턴 |
| **출처 메타** | 노드 data에 `source: 'real' \| 'est' \| 'paid'` 강제 | KOAMI 데이터 출처 표기 규칙 |

## §5 구현 파일 매핑

| 파일 | 작업 | F-item |
|------|------|--------|
| `src/features/platform/graph/graphData.ts` | 신규 — 소부장/호르무즈 노드+엣지 TS 픽스처 | F034+F038 |
| `src/features/platform/graph/GraphPage.tsx` | 전면 재구현 | F034 |
| `src/features/platform/graph/GraphCanvas.tsx` | 신규 — cytoscape lazy 컴포넌트 | F034 |
| `src/features/platform/graph/NodeDetailPanel.tsx` | 신규 | F034 |
| `src/features/platform/graph/GraphLegend.tsx` | 신규 | F034 |
| `src/features/platform/graph/GraphToolbar.tsx` | 신규 | F034 |
| `src/features/platform/graph/CytoscapePoC.tsx` | **삭제** (GraphPage 흡수) | F034 |
| `src/data/mock/graph.ts` | 신규 — graphData re-export | F038 |
| `src/data/repository/GraphRepository.ts` | 신규 | F038 |
| `src/data/repository/index.ts` | 수정 — GraphRepository export | F038 |
| `src/data/mock/scenarioResults.ts` | 신규 스텁 (F035용) | F038 |

## §6 DoD (완료 기준)

- [ ] `/platform/graph` 소부장 그래프 로드 · 노드 클릭 → 상세 패널 표시
- [ ] 도메인 토글 클릭 → 호르무즈 그래프로 전환 (레이아웃 재계산)
- [ ] 노드 필터 셀렉트 → 해당 타입 강조·나머지 dimmed
- [ ] 영향경로 버튼 → hormuz/sobujiang 플래그 노드만 표시
- [ ] 범례 노드 타입 색상 표기
- [ ] `pnpm typecheck` PASS (0 error)
- [ ] `pnpm test` 기존 71건 PASS (GraphRepository 테스트 추가 시 73건+)
- [ ] `pnpm build` 번들 ≤ 550KB (gz ≤ 180KB)
- [ ] GraphRepository Mock/real 토글 (`VITE_DATA_SOURCE=real` 준비)
- [ ] 출처 메타 (`source` 필드) 전체 노드 0 누락

## §7 리스크

| 리스크 | 가능성 | 대응 |
|--------|--------|------|
| cytoscape dynamic import TypeScript 타입 에러 | 중간 | `as any` fallback + CytoscapePoC 선례 참조 |
| 소부장/호르무즈 노드 수 많아 레이아웃 느림 | 낮음 | `cose animate:false` + 성능 로깅 |
| 번들 증가 (현 745KB) | 중간 | React.lazy 적용 후 빌드 측정, 200KB+ 감소 목표 |
