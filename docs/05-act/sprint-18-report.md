# Sprint 18 Report — F032 CQ 관리 · F033 온톨로지 정의

> 완료: 2026-05-27 · autopilot · Sprint 18 · Match Rate 97%

---

## 결과 요약

| 항목 | 결과 |
|------|------|
| Sprint | 18 |
| F-items | F032 CQ 관리 · F033 온톨로지 정의 |
| Match Rate | 97% |
| 검증 | typecheck 0 / test 71 PASS / build 745KB |
| proprietary | 0건 |
| 구현 시간 | autopilot 1세션 |

---

## 구현 내용

### F032 — CQ 관리 페이지 (`/platform/cq`)

- **2패널 레이아웃**: 좌 300px CQ 목록 + 우 flex:1 상세 패널
- **CQ 데이터 (7건)**: CQ-001~CQ-007 — Tier1×2(검증완료), Tier2×5(초안·대기)
  - CQ-001: 호르무즈 봉쇄 → 소부장 영향 Top5 (Cypher + 검증결과)
  - CQ-002: R&D 공고 → 공작기계 기업 Top5 추천 (S4 화면 CQ 연동)
  - CQ-003~007: 수입다변화·EWS·국산화율·정책·구조적 취약성
- **필터 pills**: 전체/Tier1/Tier2/검증완료/미검증 (실시간 필터)
- **CQ 상세 패널**: 질문정의·엔티티태그·Cypher 쿼리·검증결과·데이터요구사항 5섹션
- **신규 CQ 등록 모달**: 폼 제출 시 로컬 state append, ID 자동생성

### F033 — 온톨로지 정의 페이지 (`/platform/ontology`)

- **KPI row**: 엔티티 13 / 관계 8 / 인스턴스 161 / 총 관계 331
- **엔티티 카드 13종** (EntityCard 재활용 · 3열 grid):
  Event·Region·Country·RawMaterial·IntermediateGoods·Product·Industry·Company·EWS·Policy·RnD·Supply·Risk
- **관계 테이블 8행**: DISRUPTS·CONTROLS_ROUTE·EXPORTS·REFINES_TO·INPUT_TO·PRODUCES·BELONGS_TO·TRIGGERS_POLICY
  - 각 행 호버 인터랙션 + 클릭 → 관계 상세 모달
  - 속성 위 마우스오버 → 인라인 툴팁
- **제약 다크블록 3종**: 유일성·NOT NULL·값범위 (Neo4j 5.x+ Cypher)
- **관계 편집 모달**: 관계명·설명·출발/도착 엔티티·속성·출처 표시 (읽기 전용)

---

## DoD 체크리스트

- [x] `/platform/cq` — 7개 CQ 카드 렌더 + 클릭 시 우측 상세 전환
- [x] 필터 pills — 5종 작동 (미해당 카드 hidden)
- [x] 신규 CQ 추가 모달 열림/닫힘 + 저장 시 목록 append
- [x] `/platform/ontology` — 4 KPI + 13 엔티티 카드 + 관계 테이블 + 제약 블록 렌더
- [x] 관계 행 클릭 시 관계 편집 모달 열림
- [x] `pnpm typecheck` 0 errors
- [x] `pnpm test` 71 PASS
- [x] `pnpm build` 745KB (< 1MB)
- [x] proprietary 문자열 0

---

## 기술 메모

- **재활용 컴포넌트**: `Modal`, `CypherBlock`, `EntityCard`, `Badge`, `KpiCard` — 신규 컴포넌트 0개
- **상태 관리**: 페이지 내 `useState` only — Zustand 불필요 (로컬 선택 상태)
- **도메인 공용**: F032·F033은 소부장·호르무즈 공통 방법론 페이지 — 도메인 토글 없음 (설계 의도)
- **CQ-002 연동**: F035 시나리오 분석 페이지(S20)의 "소부장 기본" CQ와 동일 데이터 기반
- **번들 크기**: 이전 713KB → 745KB (+32KB, 신규 데이터 파일 반영)

---

## 다음 Sprint 권고

- **S19 (F034·F038)**: 지식그래프(cytoscape dynamic import) + 데이터레이어 통합 Mock fixtures
- **Note**: cytoscape는 번들 크기 영향 큼 → dynamic import() 필수 (현 745KB 기준 +고려)
