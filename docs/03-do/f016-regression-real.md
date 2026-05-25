# F016 — 실데이터 모드(real) 회귀 + 성능 검증

> Sprint 1 33 인터랙션 체크리스트(`sprint-1-regression-checklist.md`)를 **`VITE_DATA_SOURCE=real`** 빌드 기준으로 재검증.
> 실행: `VITE_DATA_SOURCE=real pnpm build && pnpm preview` → Playwright(자동) + 시연 직전 수동(시각).
> 검증일: 2026-05-25 (F016 /pdca do).

## 1. real 모드 차이 (Mock 대비)

real 모드는 **S6만** 실데이터로 전환(F015 SnapshotTolueneRepository). S4·About·Landing은 Mock 유지(S4 실데이터=F017 Phase 2).

| # | 항목 | Mock | real 모드 | 검증 |
|---|------|------|----------|:----:|
| I26 | S6 TradeChart | 가상 16분기 | **실 4분기**(관세청, 수출입 실값) | 자동 |
| I27 | S6 KGraph | Mock S6_GRAPH | **실 11노드**(TOL·HS·일본82%·중국18%·미국·기업6사, 재귀CTE 산출) | 자동 |
| I28 | S6 기업표 | 가상 기업 | **실 6사**(롯데케미칼 20.4조 등 DART) | 자동 |
| I24 | DataMark | ⭐/△/※ | 무역·기업 ⭐real / 이상치·share △est / 뉴스·힌트 ※virt | 수동 |
| I29 | S6 WordCloud | Mock 16단어 | **Mock fallback**(뉴스 P1=F018) ※virt | 수동 |
| I31 | S6 Hint | Mock 3 | **Mock fallback**(시연카드) ※virt | 수동 |

> 그래프 노드 배열 순서는 F016 재귀CTE 정식화로 **결정적 정렬**(타입랭크+id)로 변경 — 위치는 타입별 그룹 레이아웃이라 시각 동일.

## 2. 자동 검증 결과 (Playwright + 스모크, 2026-05-25)

| 항목 | 결과 |
|------|------|
| `VITE_DATA_SOURCE=real pnpm build` | ✅ JS 214.69KB (gz 70.51KB) — F015 214KB 유지 |
| 번들 실 기업명 포함 | ✅ `롯데케미칼` 등 |
| **S6 콘솔 에러** | ✅ **0건** (Playwright error level) |
| **S6 실 기업 6사 렌더** | ✅ 롯데케미칼·한화토탈·여천NCC·금호석유화학·대한유화·효성화학 전수 |
| S6 그래프·TradeChart | ✅ 톨루엔 그래프 + 차트(SVG 13) |
| **S4 콘솔 에러** | ✅ **0건** (real 토글 무영향) |
| `pnpm test` (vitest) | ✅ 23/23 (givc-queries 14 + scoring 9) |
| `pnpm typecheck`·`pnpm lint` | ✅ green |
| 조회 스모크(`smoke-queries.mjs`, 원격 D1) | ✅ 재귀CTE 11노드·FTS5 1건·정형 4분기 |
| Worker `wrangler dev` curl 3종 | ✅ graph(일본82%)·trade(4분기+byCountry)·search(톨루엔 snippet)·empty→400·SPA→200 |

## 3. 성능 실측 (real 모드, 2026-05-25)

| 기준 (DoD) | 실측 | 판정 |
|------------|------|:----:|
| 첫 로딩 < 2s | **97ms** (navigation loadEventEnd) | ✅ |
| S4 재계산 < 100ms | **0.17ms/회** (슬라이더 input→재스코어 20회 평균) | ✅ |

> S4 재계산은 순수 스코어링(vitest 9/9) + Zustand 동기 업데이트 — 실측 0.17ms로 100ms 기준 대폭 충족.

## 4. 시연 직전 수동 런북 (서민원 책임)

> 자동 검증은 콘솔 에러·실데이터 렌더·성능을 커버. 아래는 **시각·픽셀 동일성** 수동 항목.

- [ ] Sprint 1 33항목 전수(`sprint-1-regression-checklist.md`)를 real 빌드에서 재확인 — 특히 §1 차이표 6항목
- [ ] DataMark(⭐/△/※) 누락 0 육안 — S6 무역 ⭐ / share △ / 워드클라우드·힌트 ※
- [ ] 실 노트북 Chrome/Edge + 대형 디스플레이 렌더
- [ ] 그래프 노드 겹침/붕괴 없음(결정적 방사형 레이아웃)
- [ ] (선택) Worker 조회 엔드포인트 curl 시연 — 로컬 `wrangler dev` 또는 원격 service token

## 5. 한계·후속

- **S4 real 미전환**: F017 Phase 2(GIVC·PII). real 모드도 S4는 Mock.
- **뉴스 워드클라우드·RAG**: F018(BIGKinds 저작권·Vectorize Worker).
- **real 모드 라이브 배포**: 별도 게이트 — 현 배포는 Mock 기본(`VITE_DATA_SOURCE` 미설정).
