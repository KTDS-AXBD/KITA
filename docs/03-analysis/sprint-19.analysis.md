# Sprint 19 Gap Analysis — F034 지식그래프 + F038 데이터레이어

| 항목 | 값 |
|------|-----|
| Sprint | 19 |
| F-items | F034 (지식그래프 페이지) · F038 (데이터레이어 그래프 Repository) |
| 분석일 | 2026-05-27 |
| **Match Rate** | **95%** |
| 판정 | **PASS (≥ 90% 완결 기준 충족)** |

## 검증 결과

| DoD 항목 | 상태 | 근거 |
|----------|:----:|------|
| `/platform/graph` 소부장 그래프 로드 + 노드 클릭 → 상세 패널 | OK | GraphPage + NodeDetailPanel + cytoscape tap 이벤트 |
| 도메인 토글 → 호르무즈 전환 (레이아웃 재계산) | OK | handleDomainChange + useEffect [graph] destroy/init |
| 노드 필터 → 강조 + dimmed | OK | GraphLegend 클릭 → nodeFilter → addClass('dimmed') |
| 영향경로 버튼 → 플래그 노드만 표시 | OK | GraphCanvas useEffect (hormuz/RnDProject/RiskIndicator/Event) |
| 범례 노드 타입 색상 표기 | OK | GraphLegend 11종 색상 원 + 라벨 |
| typecheck PASS | OK | tsc --noEmit 0 에러 |
| test 76 PASS (기존 71 + 신규 5) | OK | vitest 76/76 |
| build 번들 메인 ≤ 550KB | OK | 메인 327KB (GraphCanvas lazy 445KB 별도 청크) |
| GraphRepository Mock/real 토글 | OK | index.ts VITE_DATA_SOURCE=real 분기 추가 완료 |
| 출처 메타 source 전체 노드 0 누락 | OK | GraphRepository.test.ts 검증 PASS |

## 갭 목록

### 낮은 영향

| 항목 | Design | 구현 | 처리 |
|------|--------|------|------|
| 호르무즈 노드 수 | 63노드 (§2.2) | 44노드 | 핵심 선별 축소. 테스트 임계 ≥ 40 충족. S21 보강 후보 |
| 소부장 영향경로 Event 타입 | §5.3 미명시 | Event 포함 강조 | Design 누락 보완. 시연 품질 향상 |
| GraphLegend 항목 수 | 9개 (§5.5) | 11개 (+RawMaterial/IntermediateGoods) | Design 누락 보완 |

### 문서 역동기화 (코드 정확, 문서 갱신 필요)

| 항목 | 갱신 필요 사항 |
|------|--------------|
| Design §2.1 타입 네이밍 | GraphNode/Edge → CytoNode/Edge, 파일 위치 cyto-graph.ts 반영 |
| Design §1·§2.2 호르무즈 노드 수 | 63 → 44 정정 (또는 S21 보강 예약) |
| Design §5.5 GraphLegend | 11종으로 갱신 |
| Design §5.6 GraphToolbar | nodeFilter props 제거, 필터는 GraphLegend 책임 명시 |
| Design §5.3 영향경로 | Event 타입 추가 |

## 추가 구현 (Design 외)

- 도메인 변경 시 selectedNodeId·nodeFilter·focusActive 자동 초기화
- 필터/영향경로 동시 활성 방지 (상호 배타 토글)
- edge referential integrity 테스트 (5번째 테스트)
- `VITE_DATA_SOURCE=real` → `GraphRepositoryReal` toggle (즉시 적용)
