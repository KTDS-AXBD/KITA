# Sprint 13 — F026 Report

## 요약
`GvcRepository`(F025)를 S6 화면에 연결하는 어댑터 레이어 + 기계↔반도체 도메인 토글 + 통합 시나리오 패널을 구현했다.  
기존 `s6Repository` 경로는 완전 보존 — 신규 GVC 패널이 additive로 추가됐다.

## 결과
| 지표 | 값 |
|------|-----|
| Match Rate | 100% |
| 테스트 | 45/45 PASS (신규 14개) |
| typecheck | PASS (0 errors) |
| lint | PASS (0 warnings) |
| 기존 S6 회귀 | 무손상 |
| 공개레포 유출 | 없음 (신규 8개 파일 전수 확인) |

## 신규 산출물
- `src/store/gvcDomainStore.ts` — Zustand 도메인 상태 (mach/semi)
- `src/data/repository/adapters/gvcS6Adapter.ts` — GvcRepository → KnowledgeGraph / S6Kpi 어댑터
- `src/features/s6/DomainToggle.tsx` — 기계↔반도체 토글 UI
- `src/features/s6/GvcPane.tsx` — GVC 도메인 분석 패널 (그래프 + 지표 + 제품표)
- `src/features/s6/GvcIntegration.tsx` — 통합 시나리오 (교차 비교 + 자립화 대조)
- 수정: `src/store/index.ts`, `src/features/s6/S6Page.tsx` (additive)

## 교훈
- Sprint WT에 node_modules 없어 main WT symlink로 해결 (`ln -s`) — 향후 WT 생성 시 자동 symlink 검토
- `layoutGraph()` (s6Snapshot.ts) 재사용으로 GVC 그래프도 동일 결정적 레이아웃 — 중복 0
- GvcDomainStore를 hintsStore와 독립 분리하여 도메인 전환이 힌트 상태를 오염시키지 않음

## 다음
F027 — 실 질의 데모 패널 (S14): 퓨샷 질문 선택 → SQL 표시 → D1 실행 결과
