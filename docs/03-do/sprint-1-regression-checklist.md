# Sprint 1 — M1 빌드 이송 회귀 체크리스트 (33개)

> Plan §4.1의 33개 인터랙션을 프로토타입(`docs/spec/claude design/KITA PoC.html`)과 이송 결과(`pnpm dev`)에서 나란히 비교. **시각·동작 동일성** 검증. 자동화 불가 항목 — 사용자(서민원 책임) 시연 직전 수동 통과.
>
> **실행 방법**:
> 1. 두 창에 (A) 프로토타입 HTML 직접 열기, (B) `pnpm dev` 띄우기
> 2. 항목별로 동일 동작/픽셀 확인 후 체크
> 3. 차이 있으면 `### 차이 기록` 섹션에 캡처/메모 추가

## 체크리스트

| # | 영역 | 인터랙션 | 난이도 | ☐ |
|---|------|---------|:----:|:--:|
| I1 | 라우팅 | hash router 5경로(/·/scenario/rnd·/scenario/toluene·/about/ontology·/about/data)+404 | 중 | ☐ |
| I2 | 헤더 | 5탭 nav active 상태 + brand→home | 하 | ☐ |
| I3 | 헤더 | theme(dark class)·flavor(data-style) `<html>` 적용 | 중 | ☐ |
| I4 | Tweaks | 패널 토글 + flavor·theme·hintsPosition·top5·langMode 컨트롤 (**host-protocol 제거 확인**) | 상 | ☐ |
| I5 | Landing | Hero CTA 2버튼 navigate | 하 | ☐ |
| I6 | Landing | 시나리오 카드 2개 클릭 navigate | 하 | ☐ |
| I7 | Landing | ProvenanceLegend + 데모위치/화면흐름 섹션 | 하 | ☐ |
| I8 | S4 | 도메인 select(6) | 하 | ☐ |
| I9 | S4 | 예산 슬라이더(1~20) | 하 | ☐ |
| I10 | S4 | 기간 슬라이더(6~36) | 하 | ☐ |
| I11 | S4 | 프리셋 버튼(3)→domain/budget/period/weights 일괄 적용 | 중 | ☐ |
| I12 | S4 | 가중치 슬라이더(4)→실시간 재계산 | 중 | ☐ |
| I13 | S4 | **스코어 계산**(정규화→가중합→boost→matchBoost, Σ=0 방어) — *unit test 9/9 PASS* | **상** | ☐ |
| I14 | S4 | Hint 토글(4: rndcall/patent/finance/movement)→boost 재계산 | **상** | ☐ |
| I15 | S4 | Top5 표/카드 레이아웃 토글 | 중 | ☐ |
| I16 | S4 | 행 hover→그래프 하이라이트(hoverRowId→KGraph) | 중 | ☐ |
| I17 | S4 | KGraph 노드 hover→tooltip(출처·meta)+이웃 하이라이트+dim | **상** | ☐ |
| I18 | S4 | KGraph top5 동적 노드/엣지 필터 | 중 | ☐ |
| I19 | S4 | KPI strip(4, matchAccuracy 동적) | 하 | ☐ |
| I20 | S4 | 유사사례 리스트(정적) | 하 | ☐ |
| I21 | S4 | 반대추천 리스트(정적) | 하 | ☐ |
| I22 | S4 | What-If chat(입력·추천프롬프트3·Enter·setTimeout Mock·markdown 렌더 — **raw HTML 주입 대신 React 노드 빌더 사용 → XSS 원천 차단**) | 중 | ☐ |
| I23 | S4 | DataExpansionHints + currentRows + 데이터확장예시 카드 | 중 | ☐ |
| I24 | S4 | DataMark 메트릭 셀 전수 (⭐/△/※ 누락 0) | 하 | ☐ |
| I25 | S6 | 품목 검색(readonly)+프리셋 버튼 4 | 하 | ☐ |
| I26 | S6 | **TradeChart**(SVG line/area, 16분기, 수출입+이상치 마커) | **상** | ☐ |
| I27 | S6 | KGraph(S6_GRAPH 정적 + 좌표 머지) | 중 | ☐ |
| I28 | S6 | 기업표 행 hover→그래프 하이라이트 | 중 | ☐ |
| I29 | S6 | WordCloud(16단어, 감성 색상) | 하 | ☐ |
| I30 | S6 | AnomalyPanel | 하 | ☐ |
| I31 | S6 | Hint 토글(3, boost 로직 없음) | 하 | ☐ |
| I32 | S6 | KPI strip | 하 | ☐ |
| I33 | S6 | DataExpansionHints + 데이터확장예시 | 하 | ☐ |

## 통과 기준 (DoD §4.1)

- [ ] 33개 항목 100% 통과
- [ ] 첫 로딩 <2s (Lighthouse/실측)
- [ ] S4 가중치 재계산 <100ms (콘솔 `performance.now()`)
- [ ] 출처 표기(⭐/△/※) 누락 0
- [ ] Tweaks `localStorage('kita-tweaks')` 영속 (새로고침 후 값 유지)
- [ ] `grep -r 'window.parent' src/` → 0건 (host-protocol 제거 검증)

## 자동 검증 결과 (2026-05-24)

| 항목 | 결과 |
|------|------|
| `pnpm typecheck` (turbo 우회) | ✅ 0 error |
| `pnpm lint` | ✅ 0 error |
| `pnpm test` (vitest scoring) | ✅ 9/9 |
| `pnpm build` | ✅ JS 213KB (gz 70KB) + CSS 51KB (gz 10KB) |
| `pnpm dev` | ✅ http://localhost:5173 200 OK |
| `grep window.parent src/` | ✅ 0건 |

## 차이 기록

(시연 직전 사용자가 발견한 차이를 여기에 기록)
