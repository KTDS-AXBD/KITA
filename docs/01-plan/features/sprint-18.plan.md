# Sprint 18 Plan — F032 CQ 관리 · F033 온톨로지 정의

> 작성: 2026-05-27 · Sprint 18 · F032·F033 · 참조: SPEC.md, v0.32 프로토타입

---

## §1. 목표

| F-item | 페이지 | 핵심 기능 |
|--------|--------|-----------|
| F032 | `/platform/cq` | 좌 CQ 목록(필터 pills·상태배지) + 우 상세(질문·엔티티태그·Cypher·검증결과) + 신규 등록 모달 |
| F033 | `/platform/ontology` | KPI 4종·엔티티 13종 카드·관계 8종 테이블·제약 다크블록·관계 편집 모달 |

**도메인**: 소부장(공작기계) 기본, 호르무즈 보조 (방법론 페이지 공용 — 도메인 토글 불필요).

---

## §2. 범위

### F032 파일 목록

| 파일 | 작업 |
|------|------|
| `src/features/platform/cq/cqData.ts` | 신규 — CQ Mock 데이터 (7건: Tier1×2 verified, Tier2×5 draft/pending) |
| `src/features/platform/cq/CqManagePage.tsx` | stub → 전체 구현 |

### F033 파일 목록

| 파일 | 작업 |
|------|------|
| `src/features/platform/ontology/ontologyData.ts` | 신규 — 엔티티 13종·관계 8종·제약 Mock |
| `src/features/platform/ontology/OntologyPage.tsx` | stub → 전체 구현 |

**변경 없는 파일**: App.tsx, useHashRoute.ts, AppLayout.tsx, Sidebar.tsx, 공용 컴포넌트 전체, 기존 라우트.

---

## §3. 기술 결정

1. **상태 관리**: 각 페이지 내 `useState` — Zustand 불필요 (페이지 로컬 선택 상태)
2. **재활용 컴포넌트**: `Modal`, `CypherBlock`, `EntityCard`, `Badge`, `KpiCard`
3. **CQ 등록 모달**: 간단한 form (ID 자동생성, Tier/Status select, 질문 textarea). 제출 시 로컬 state append.
4. **관계 편집 모달**: 읽기 전용 상세 표시 (편집 form은 P2로 미구현).
5. **출처 표기**: 데이터 요구사항 표에서 `badge-real(확보)`, `badge-estimate(추정)`, `badge-paid(미확보)` 사용.

---

## §4. DoD

- [ ] `/platform/cq` — 7개 CQ 카드 렌더 + 클릭 시 우측 상세 전환
- [ ] 필터 pills — 전체/Tier1/Tier2/검증완료/미검증 작동 (미해당 카드 hidden)
- [ ] 신규 CQ 추가 모달 열림/닫힘 + 저장 시 목록 append
- [ ] `/platform/ontology` — 4 KPI + 13 엔티티 카드 + 관계 테이블 + 제약 블록 렌더
- [ ] 관계 행 클릭 시 관계 편집 모달 열림
- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm test` 71 PASS (신규 테스트 없음 — UI 전용)
- [ ] `pnpm build` 성공 (번들 ≤ 1MB)
- [ ] proprietary 문자열 0 (실 GVC 코드 등 비공개 정보 미포함)
