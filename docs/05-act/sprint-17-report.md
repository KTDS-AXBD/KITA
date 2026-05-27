---
id: KOAMI-RPRT-017
title: Sprint 17 Report — F031·F036·F037 정적 콘텐츠 3종
sprint: 17
f_items: [F031, F036, F037]
match_rate: 100
status: done
created: 2026-05-27
---

# Sprint 17 Report — 정적 콘텐츠 3종

## 요약

S16(F030) AppLayout/Sidebar 셸 위에 정적 콘텐츠 3개 페이지를 완성했어요.

| 페이지 | 라우트 | F-item | 결과 |
|--------|--------|--------|------|
| 데이터 현황 | `/platform/data` | F031 | ✅ |
| 비교 검증 | `/platform/compare` | F036 | ✅ |
| 추진 계획 | `/platform/plan` | F037 | ✅ |

## 구현 산출물

### 신규 파일
- `src/components/platform/StatusDot.tsx` — DotStatus 3종 (connected/collecting/unavailable)
- `src/features/platform/data/dataSources.ts` — 27건 DataSource Mock fixtures

### 수정 파일
- `src/components/platform/index.ts` — StatusDot export 추가
- `src/features/platform/data/DataStatusPage.tsx` — placeholder → 27건 현황표
- `src/features/platform/compare/ComparePage.tsx` — 2-카드+6축 전체 구현
- `src/features/platform/plan/PlanPage.tsx` — 타임라인+CQ 목록+푸터 완성

## 검증 결과

| 항목 | 결과 |
|------|------|
| `pnpm typecheck` | ✅ PASS |
| `pnpm lint` | ✅ 0 warnings/errors |
| `pnpm test` | ✅ 71/71 PASS (기존 회귀 0) |
| `pnpm build` | ✅ PASS (713KB, 231KB gzip) |

## Gap Analysis — Match Rate 100%

Design §2 명시 6파일 전부 구현 완료. DoD 7항목 전체 PASS.

## 주요 결정 사항

1. **도메인 정렬**: 소부장(공작기계) 우선, 호르무즈 보조 통합 (req-interview 결정 반영)
2. **DataStatusPage 정렬**: `domain` 필드로 소부장→both→hormuz 순 정렬
3. **ComparePage 질의**: "공작기계 국산화 R&D 기업 선정" (소부장 도메인)
4. **Timeline 확장**: Phase 설명은 Timeline 컴포넌트 수정 없이 PlanPage 인라인 grid로 처리

## 다음 Sprint (S18)

- **F032**: CQ 관리 페이지 — 좌 목록(필터 pills·상태배지) + 우 상세(질문·Cypher·검증결과) + 등록 모달
- **F033**: 온톨로지 모델 정의 — 엔티티 13종·관계 8종·속성 카드+제약 다크블록
