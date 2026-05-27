---
id: KOAMI-PLAN-S20
title: Sprint 20 — F035 시나리오 분석 페이지 (시연 하이라이트)
sprint: S20
status: done
---

## 1. 목표

GIVC Ontology Platform의 시연 하이라이트 페이지: CQ 선택 → NL 질의 → Cypher 변환 → 5단계 애니메이션 추론 → A~E 결과 패널 구현.

## 2. 범위 (F035)

- CQ 선택 토글: CQ-002(소부장 기본) / CQ-001(호르무즈 보조)
- Cypher 블록 토글 표시
- 5단계 추론 애니메이션 + 프로그레스 바
- 결과 A~E: CQ-002 기업추천 / CQ-001 영향품목

## 3. 참조

- 프로토타입: `docs/spec/기진회_2차세미나_프로토타입_v0.32_260527.html` §PAGE5 (line 2114~2821)
- 기존 컴포넌트: `src/components/platform/` (Badge, CypherBlock, Toggle, KpiCard, DataTable)
- 기존 Mock: `src/data/mock/scenarioResults.ts`, `cqData.ts`, `graphData.ts`

## 4. DoD

- [ ] typecheck 0 errors
- [ ] lint 0 warnings
- [ ] vitest test count >= 79 (기존 76 + 신규 3)
- [ ] 빌드 PASS
- [ ] CQ 토글 동작 — 질의/Cypher/결과 전환
- [ ] 분석 실행 버튼 클릭 시 5단계 애니메이션 후 A~E 표시
- [ ] 콘솔 에러 0

## 5. 공수 예측

~30분 autopilot (단일 파일 구현 + 데이터 확장)
