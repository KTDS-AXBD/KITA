---
id: KOAMI-DESIGN-S20
title: Sprint 20 — F035 시나리오 분석 페이지 설계
sprint: S20
status: done
---

## 1. 구조

```
ScenarioPage.tsx (전면 재구현)
├── CQ 선택 Select (CQ-002/CQ-001)
├── NL 질의 바 + "분석 실행" 버튼
├── Cypher 토글 블록 (CypherBlock 재사용)
├── AnalysisSteps (5단계 애니메이션)
│   ├── ProgressBar
│   └── StepItem x5 (spinner → checkmark → completed)
└── ResultsPanel (CQ에 따라 분기)
    ├── Cq002Results (소부장)
    │   ├── 의존 구조 분석 (5개 품목 그라데이션 바)
    │   ├── A. Top5 기업 테이블
    │   ├── B. 선정 근거 (1위 점수 상세 + 기업 프로필)
    │   ├── C. 유사 과거 R&D 사례
    │   ├── D. 반대 추천 (제외 사유)
    │   ├── 설명가능성 패널 (선정경로 + 데이터출처)
    │   └── E. 의사결정 지원 리포트
    └── Cq001Results (호르무즈)
        ├── A. 영향 경로 시각화 (mini cytoscape)
        ├── B. 영향 품목 Top5 테이블
        ├── C. 설명가능성 (C1 인과경로 + C2 취약성 + C3 EWS + C4 재현성)
        ├── D. 대응 옵션 (3카드)
        └── E. 의사결정 지원 리포트
```

## 2. 상태 설계

```typescript
type CqId = 'cq2' | 'cq1';
type AnalysisState = 'idle' | 'running' | 'done';

// useState
const [selectedCq, setSelectedCq] = useState<CqId>('cq2');  // 기본=소부장
const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
const [completedSteps, setCompletedSteps] = useState<number>(0);
const [progress, setProgress] = useState<number>(0);
```

## 3. 데이터 파일

- `src/data/mock/scenarioResults.ts` — 확장 (CQ-001/CQ-002 모든 결과 데이터)
- `src/features/platform/scenario/ScenarioPage.tsx` — 전면 재구현

## 4. 컴포넌트 재사용

| 컴포넌트 | 용도 |
|---------|------|
| `CypherBlock` | Cypher 쿼리 표시 |
| `Badge` (real/est/paid) | 출처 배지 |
| `KpiCard` | KPI 수치 |
| `GraphCanvas` (lazy) | CQ-001 미니 영향경로 그래프 |

## 5. 수정 파일 목록

| 파일 | 작업 |
|------|------|
| `src/features/platform/scenario/ScenarioPage.tsx` | 전면 재구현 |
| `src/data/mock/scenarioResults.ts` | 데이터 확장 |

## 6. 테스트

- `src/features/platform/scenario/__tests__/ScenarioPage.test.ts`
  - CQ 선택 변경 시 질의 텍스트 변경 확인
  - 분석 실행 버튼 존재 확인
  - 기본 CQ-002 결과 데이터 확인
