# 시연 회귀 체크리스트 (기본 33 + 신규 12 = 45개)

> **기본(I1~I33)**: Sprint 1 M1 빌드 이송 인터랙션 — Plan §4.1의 33개를 프로토타입(`docs/spec/claude design/KOAMI PoC.html`)과 이송 결과(`pnpm dev`)에서 나란히 비교. **시각·동작 동일성** 검증.
> **신규(N1~N12)**: chatgivc-align(F024~F027) — 도메인 토글·GVC 분석/통합뷰·실 질의 패널. S6 하단 additive.
> 자동화 불가 항목 — 사용자(서민원 책임) 시연 직전 수동 통과. (readiness plan M5 연계)
>
> **실행 방법**:
> 1. 두 창에 (A) 프로토타입 HTML 직접 열기, (B) `pnpm dev` 띄우기
> 2. 항목별로 동일 동작/픽셀 확인 후 체크
> 3. 차이 있으면 `### 차이 기록` 섹션에 캡처/메모 추가

## 체크리스트

| # | 영역 | 인터랙션 | 난이도 | ☐ |
|---|------|---------|:----:|:--:|
| I1 | 라우팅 | hash router 5경로(/·/scenario/rnd·**/scenario/s6**(구 /scenario/toluene alias 유지)·/about/ontology·/about/data)+404 | 중 | ☐ |
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

> ⚠️ **I25~I33 콘텐츠 전환 주의 (F019~F023, S8~S10)**: S6 인터랙션 **구조는 동일**하나 도메인이 톨루엔/화학 → **공작기계 다단계 가치사슬**(소재→부품→장비, 머시닝센터 anchor)로 전면 교체됨. 회귀 시 ① 화학/톨루엔 잔존 텍스트 0 ② 다단계 그래프(장비←부품 베어링·감속기←소재 특수강) ③ 기업표 tier(장비/부품/소재) ④ KPI 자립화(감속기 수입의존) 확인. S4(I8~I24)도 소부장 기계 도메인(F020)으로 재스킨됨 — 화학 잔존 0 확인.

## 신규 기능 회귀 (chatgivc-align — F024~F027, S11~S14)

> S6 페이지 하단에 GVC 재정렬·도메인 토글·실 질의 패널이 **additive**로 추가됨(기존 S6 무손상). Mock 모드(기본) 기준 검증. 자동화 불가 — 시연 직전 수동 통과.

| # | 영역 | 인터랙션 | 난이도 | ☐ |
|---|------|---------|:----:|:--:|
| N1 | 도메인 토글 | S6 하단 `GIVC 가치사슬 분석` 헤더 우측 **DomainToggle**(기계 ↔ 반도체) — 클릭 시 active 파란 배경 전환 | 하 | ☐ |
| N2 | 도메인 토글 | 토글 전환 시 분석 탭(GvcPane·GvcIntegration) + 질의 탭(SQL/결과) **도메인별 재렌더** (gvcDomainStore 전역 연동) | 중 | ☐ |
| N3 | 탭 전환 | `📊 분석` ↔ `💬 ChatGIVC 질의` 탭 switcher (active 밑줄·파란색) | 하 | ☐ |
| N4 | 분석·GvcPane | anchor 표기 + 가치사슬 KGraph(소재→부품→장비) + 제품 목록 표(tier·HS·출처 DataMark) | 중 | ☐ |
| N5 | 분석·GvcPane | KpiStrip 도메인별 산출(adaptGvcKpis) + ※ 가상(virt) 출처 배지 | 하 | ☐ |
| N6 | 분석·통합뷰 | **GvcIntegration** 기계×반도체 교차 비교 표(소재/부품/장비 3 tier) + 자립화 현황 2카드(수입의존 ⚠ 빨강) | 중 | ☐ |
| N7 | 질의·카탈로그 | 쿼리 버튼 **8개** — L1~L5 ⭐(live) + C1~C3 △(curated), 선택 시 btn-primary 강조 | 중 | ☐ |
| N8 | 질의·SQL 병기 | **실 ChatGIVC SQL**(녹색/gray-900) ↔ **데모 미러 SQL**(파랑/blue-950, `↪ 실행`) 2단 병기 — 미러는 live(L*)만 표시, curated(C*)는 단일 | **상** | ☐ |
| N9 | 질의·결과(live) | L* 선택 → 미러 SQL **실행 실결과** 테이블(GvcRepository 재사용) + 출처 배지 ⭐(실) + "실 GIVC 직결" 메시지 | **상** | ☐ |
| N10 | 질의·결과(curated) | C* 선택 → 큐레이션 정적 결과 테이블 + 출처 배지(△/※) + "mart.* 의존 — 공개데이터" 메시지 | 중 | ☐ |
| N11 | 질의·도메인 연동 | 도메인 토글(기계/반도체) 전환 시 SQL 템플릿(resolveTemplate)·결과 **도메인별 변경** | 중 | ☐ |
| N12 | 보안·출처 | 실 GVC 제품코드 노출 **0건** (`GVC\d{5}` 패턴 0, virt 코드만) + N4~N10 전 셀 DataMark(⭐/△/※) 누락 0 | **상** | ☐ |

## 통과 기준 (DoD §4.1)

- [ ] 33개 기본 항목(I1~I33) 100% 통과
- [ ] 신규 기능 항목(N1~N12) 100% 통과 (chatgivc-align)
- [ ] 첫 로딩 <2s (Lighthouse/실측)
- [ ] S4 가중치 재계산 <100ms (콘솔 `performance.now()`)
- [ ] 출처 표기(⭐/△/※) 누락 0 (신규 GvcPane·통합뷰·질의 결과 포함)
- [ ] Tweaks `localStorage('koami-tweaks')` 영속 (새로고침 후 값 유지)
- [ ] `grep -r 'window.parent' src/` → 0건 (host-protocol 제거 검증)
- [ ] `grep -rE 'GVC[0-9]{5}' src/` → 0건 (실 GVC 제품코드 미노출 — virt만) *F027 자가 가드 테스트로 자동 검증됨*
- [ ] 화학/톨루엔 **사용자 노출 콘텐츠** 잔존 0 (S4·S6 — 기계 전환 F019~F023). ※ 코드 내 `/scenario/toluene` 라우트 alias(`App.tsx`)·리네임 이력 주석(`types/s6.ts`)은 의도적 잔존(무해)

## 자동 검증 결과

| 항목 | Sprint 1 (2026-05-24) | 현재 (2026-05-26) |
|------|------|------|
| `pnpm typecheck` (app+worker) | ✅ 0 error | ✅ 0 error |
| `pnpm lint` | ✅ 0 error | ✅ 0 error |
| `pnpm test` (vitest) | ✅ 9/9 (scoring) | ✅ **71** (scoring·gvcS6Adapter·chatgivc-executor·catalog 등) |
| `pnpm build` | ✅ JS 213KB (gz 70KB) + CSS 51KB (gz 10KB) | (시연 전 재실측) |
| `pnpm dev` | ✅ localhost:5173 200 OK | ✅ 동일 |
| `grep window.parent src/` | ✅ 0건 | ✅ 0건 |
| `grep -rE 'GVC[0-9]{5}' src/` | — | ✅ 0건 (F027 가드 테스트) |

## 차이 기록

(시연 직전 사용자가 발견한 차이를 여기에 기록)
