---
code: KOAMI-PLAN-008
title: Sprint 8 — S4 재스킨 + 프레이밍 전환 (F020 + F022)
type: PLAN
status: IN_PROGRESS
created: 2026-05-25
sprint: S8
features: [F020, F022]
req: [KOAMI-REQ-020, KOAMI-REQ-022]
---

# Sprint 8 — S4 재스킨 + 프레이밍 전환

## 1. 배경

F019 게이트 GO 결론(소부장·가치사슬 정렬). 데모 콘텐츠를 확정 고객 **한국기계산업진흥회(KOAMI)** 도메인으로 전환. KOAMI 실제 미션 = 소재·부품·장비(소부장) GIVC·가치사슬 분석 → 데모 전제와 정조준.

## 2. 범위

### F020 — S4 R&D 기계산업 재스킨
S4(R&D 적합 기업 추천) **구조·로직·그래프 컴포넌트는 그대로**, **데이터만** 소부장 기계 가치사슬로 교체:
- `src/data/mock/domains.ts` — DOMAINS(소부장 기계 분류) + PRESETS(소부장 자립화 R&D 사례)
- `src/data/mock/rnd.ts` — 후보풀(장비·부품·소재 기업) + counter + similar cases + 그래프 노드/엣지 + hints + what-if 프롬프트
- 스코어링(`page_rnd` 로직)·가중치 슬라이더·그래프 렌더 = **무변경** (화면 코드 diff 0 목표, F015 패턴 계승)

### F022 — 랜딩/About 프레이밍 전환
- `src/features/landing/LandingPage.tsx` — 청중(산업부·산자부 정책의사결정자 → KOAMI 소부장·가치사슬 담당+회원사), 시나리오 설명, 데이터 카탈로그
- `src/features/about/AboutDataPage.tsx`·`AboutOntologyPage.tsx` — 온톨로지 개념·데이터 카탈로그 KOAMI 맥락

## 3. 데이터 근거 (F019 실측)

| 단계 | HS | 품목 | 2024 수출/수입 | 내러티브 |
|------|----|----|------|---------|
| 장비 | 845710 | 머시닝센터 | $972M/$297M | 수출 강세 |
| 장비 | 845811 | NC선반 | $1,443M/$114M | 수출 강세 |
| 부품 | 848210 | 볼베어링 | $755M/$752M | 균형 |
| 부품 | 848340 | 기어·감속기 | $648M/**$994M** | **수입의존 → 자립화 과제** |

→ 헤드라인 시나리오 = **고정밀 감속기/베어링 국산화 R&D** (데이터로 자립화 당위성 증명).

## 4. DoD

- [ ] S4 후보풀·프리셋이 소부장 기계 기업·사례로 교체 (화학·반도체 잔재 0)
- [ ] 랜딩/About 청중·시나리오·카탈로그가 KOAMI 맥락
- [ ] 화면 컴포넌트(features/rnd) 로직 diff 0 (데이터 레이어만 변경)
- [ ] `pnpm typecheck` + `pnpm lint` + `pnpm test` PASS
- [ ] Mock 모드 S4 구동 — Top5 재계산·가중치 슬라이더·그래프 정상, 출처 표기(⭐△※) 유지

## 5. 순서

1. domains.ts (DOMAINS + PRESETS) — 시연 오프닝 시나리오 ← **헤드라인 프리셋은 서민원 도메인 입력**
2. rnd.ts (후보풀·그래프·hints·what-if)
3. LandingPage / About 프레이밍
4. 검증 (typecheck/lint/test + Mock 구동)
