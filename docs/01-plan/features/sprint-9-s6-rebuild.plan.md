---
code: KOAMI-PLAN-009
title: Sprint 9 — S6 공작기계 가치사슬 재구축 (F021)
type: PLAN
status: IN_PROGRESS
created: 2026-05-25
sprint: S9
features: [F021]
req: [KOAMI-REQ-021]
---

# Sprint 9 — S6 공작기계 가치사슬 재구축

## 1. 배경

F019 게이트 GO + S8(S4·프레이밍) 완료. S6 시나리오를 톨루엔(단일 화학품목)에서 **공작기계 중심 다단계 가치사슬(소재→부품→장비)**로 전면 재구축. KOAMI 소부장 가치사슬 미션 정조준.

## 2. 아키텍처 rename map (Toluene → S6, 기존 S6_* 데이터 접두사에 정합)

| 현재 | 변경 |
|------|------|
| `types/toluene.ts` (`TolueneProduct`·`TolueneCompany`·`TolueneHintCard`) | `types/s6.ts` (`S6Focus`·`S6Company`·`S6HintCard`) |
| `data/mock/toluene.ts` | `data/mock/s6.ts` (기계 가치사슬 콘텐츠) |
| `repository/TolueneRepository.ts` (`TolueneRepository`·`tolueneRepository`) | `repository/S6Repository.ts` (`S6Repository`·`s6Repository`) |
| `repository/adapters/tolueneSnapshot.ts` | `repository/adapters/s6Snapshot.ts` (로직 유지·타입만 rename, real 경로는 톨루엔 스냅샷 그대로=F023 대상) |
| `features/toluene/` (S6Page·TradeChart·WordCloud·AnomalyPanel) | `features/s6/` |
| route `/scenario/toluene` | `/scenario/s6` (App.tsx·AppHeader·LandingPage) |
| export 경유 (`types/index.ts`·`mock/index.ts`·`repository/index.ts`) | 갱신 |

## 3. 다단계 가치사슬 데이터 모델 (소재→부품→장비)

**Anchor**: 머시닝센터(공작기계, HS 845710) — 장비 tier
**Tiers + F019 실측 무역**:
- **소재**: 특수강(베어링강·공구강)
- **부품**: 정밀 베어링(848210 수출$755M/수입$752M)·기어/감속기(848340 수입$994M>수출$648M=자립화)·CNC컨트롤러·서보모터
- **장비**: 머시닝센터(845710 수출$972M/수입$297M)·NC선반(845811)

**그래프**: 장비(anchor) ← 부품 tier ← 소재 tier 다단계. 각 tier에 기업 노드. 자립화 과제(감속기 수입의존) 강조. → F016 그래프 재귀CTE(깊이 순회)와 정합.

## 4. DoD

- [ ] 톨루엔 식별자(코드·라우트·콘텐츠) 0 (real 스냅샷 데이터 제외 — F023 대상)
- [ ] S6 다단계 가치사슬 그래프(소재→부품→장비) Mock 렌더
- [ ] 라우트 `/scenario/s6` + 네비/랜딩 링크 정합
- [ ] `pnpm typecheck` + `lint` + `test` PASS
- [ ] Mock 모드 S6 구동 — 그래프·무역차트·기업표·출처 ⭐△※ 정상 + 브라우저 시각검증 콘솔에러0

## 5. 순서

1. types/s6.ts (rename) + types/index.ts
2. data/mock/s6.ts (기계 가치사슬 콘텐츠) + mock/index.ts
3. repository/S6Repository.ts + adapters/s6Snapshot.ts + repository/index.ts
4. features/s6/ (4파일 이동·타입 import 갱신·페이지 카피)
5. route 갱신 (App.tsx·AppHeader·LandingPage)
6. graph-layout (다단계 좌표) — 또는 어댑터 결정적 레이아웃 활용
7. 검증 (typecheck/lint/test + 브라우저 시각검증)

## 6. 비고

- real 경로(s6Snapshot adapter)는 톨루엔 스냅샷 유지 → F023(기계 실데이터 재적재)에서 교체. F021은 Mock 모드 기준.
- 비가역 명령 없음.
