# 시연 회귀 체크리스트 (v0.1 33+12 + v0.2 14 = 59개)

> **v0.2 시연 메인(V1~V14)**: F030~F046 GIVC Ontology Platform 7페이지(데이터/CQ/온톨로지/그래프/시나리오/비교/계획). 라이브 루트 진입 시 자동 표시. **하단 V1~V14 섹션 참조.**
> **v0.1 보조(I1~I33)**: Sprint 1 M1 빌드 이송 인터랙션. `/v1` 라우트 공존. Plan §4.1의 33개를 프로토타입과 비교.
> **v0.1 S6 보강(N1~N12)**: chatgivc-align(F024~F027) - 도메인 토글·GVC 분석/통합뷰·실 질의 패널. S6 하단 additive.
> 자동화 불가 항목 - 사용자(서민원 책임) 시연 직전 수동 통과. (readiness plan M5 연계)
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
| I13 | S4 | **스코어 계산**(정규화→가중합→boost→matchBoost, Σ=0 방어) - *unit test 9/9 PASS* | **상** | ☐ |
| I14 | S4 | Hint 토글(4: rndcall/patent/finance/movement)→boost 재계산 | **상** | ☐ |
| I15 | S4 | Top5 표/카드 레이아웃 토글 | 중 | ☐ |
| I16 | S4 | 행 hover→그래프 하이라이트(hoverRowId→KGraph) | 중 | ☐ |
| I17 | S4 | KGraph 노드 hover→tooltip(출처·meta)+이웃 하이라이트+dim | **상** | ☐ |
| I18 | S4 | KGraph top5 동적 노드/엣지 필터 | 중 | ☐ |
| I19 | S4 | KPI strip(4, matchAccuracy 동적) | 하 | ☐ |
| I20 | S4 | 유사사례 리스트(정적) | 하 | ☐ |
| I21 | S4 | 반대추천 리스트(정적) | 하 | ☐ |
| I22 | S4 | What-If chat(입력·추천프롬프트3·Enter·setTimeout Mock·markdown 렌더 - **raw HTML 주입 대신 React 노드 빌더 사용 → XSS 원천 차단**) | 중 | ☐ |
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

> ⚠️ **I25~I33 콘텐츠 전환 주의 (F019~F023, S8~S10)**: S6 인터랙션 **구조는 동일**하나 도메인이 톨루엔/화학 → **공작기계 다단계 가치사슬**(소재→부품→장비, 머시닝센터 anchor)로 전면 교체됨. 회귀 시 ① 화학/톨루엔 잔존 텍스트 0 ② 다단계 그래프(장비←부품 베어링·감속기←소재 특수강) ③ 기업표 tier(장비/부품/소재) ④ KPI 자립화(감속기 수입의존) 확인. S4(I8~I24)도 소부장 기계 도메인(F020)으로 재스킨됨 - 화학 잔존 0 확인.

## 신규 기능 회귀 (chatgivc-align - F024~F027, S11~S14)

> S6 페이지 하단에 GVC 재정렬·도메인 토글·실 질의 패널이 **additive**로 추가됨(기존 S6 무손상). Mock 모드(기본) 기준 검증. 자동화 불가 - 시연 직전 수동 통과.

| # | 영역 | 인터랙션 | 난이도 | ☐ |
|---|------|---------|:----:|:--:|
| N1 | 도메인 토글 | S6 하단 `GIVC 가치사슬 분석` 헤더 우측 **DomainToggle**(기계 ↔ 반도체) - 클릭 시 active 파란 배경 전환 | 하 | ☐ |
| N2 | 도메인 토글 | 토글 전환 시 분석 탭(GvcPane·GvcIntegration) + 질의 탭(SQL/결과) **도메인별 재렌더** (gvcDomainStore 전역 연동) | 중 | ☐ |
| N3 | 탭 전환 | `📊 분석` ↔ `💬 ChatGIVC 질의` 탭 switcher (active 밑줄·파란색) | 하 | ☐ |
| N4 | 분석·GvcPane | anchor 표기 + 가치사슬 KGraph(소재→부품→장비) + 제품 목록 표(tier·HS·출처 DataMark) | 중 | ☐ |
| N5 | 분석·GvcPane | KpiStrip 도메인별 산출(adaptGvcKpis) + ※ 가상(virt) 출처 배지 | 하 | ☐ |
| N6 | 분석·통합뷰 | **GvcIntegration** 기계×반도체 교차 비교 표(소재/부품/장비 3 tier) + 자립화 현황 2카드(수입의존 ⚠ 빨강) | 중 | ☐ |
| N7 | 질의·카탈로그 | 쿼리 버튼 **8개** - L1~L5 ⭐(live) + C1~C3 △(curated), 선택 시 btn-primary 강조 | 중 | ☐ |
| N8 | 질의·SQL 병기 | **실 ChatGIVC SQL**(녹색/gray-900) ↔ **데모 미러 SQL**(파랑/blue-950, `↪ 실행`) 2단 병기 - 미러는 live(L*)만 표시, curated(C*)는 단일 | **상** | ☐ |
| N9 | 질의·결과(live) | L* 선택 → 미러 SQL **실행 실결과** 테이블(GvcRepository 재사용) + 출처 배지 ⭐(실) + "실 GIVC 직결" 메시지 | **상** | ☐ |
| N10 | 질의·결과(curated) | C* 선택 → 큐레이션 정적 결과 테이블 + 출처 배지(△/※) + "mart.* 의존 - 공개데이터" 메시지 | 중 | ☐ |
| N11 | 질의·도메인 연동 | 도메인 토글(기계/반도체) 전환 시 SQL 템플릿(resolveTemplate)·결과 **도메인별 변경** | 중 | ☐ |
| N12 | 보안·출처 | 실 GVC 제품코드 노출 **0건** (`GVC\d{5}` 패턴 0, virt 코드만) + N4~N10 전 셀 DataMark(⭐/△/※) 누락 0 | **상** | ☐ |

## v0.2 7페이지 회귀 (V1~V14 - F030~F046, 시연 메인 흐름)

> **v0.2 GIVC Ontology Platform** = 라이브 koami.minu.best 루트 진입 자동 표시. 시연 메인. v0.1(I1~I33·N1~N12)는 `/v1` 라우트에 공존(보조 시연용). Mock 모드(기본) + real 모드(`VITE_DATA_SOURCE=real`) 모두 검증.

| # | 영역 | 인터랙션 | 난이도 | ☐ |
|---|------|---------|:----:|:--:|
| V1 | 진입 | 루트 `/` → 자동 v0.2 표시 (`/platform/data` 데이터 현황) | 하 | ☐ |
| V2 | 데이터 현황 | KPI 4 카드(총 27 / 실 19 / 추정 4 / 유료 4) + 27행 테이블 + **최종 갱신일** 노출(F042) | 중 | ☐ |
| V3 | 데이터 현황 | 테이블 스크롤 시 **sticky 헤더**(컬럼명 유지) - wrapper max-height 60vh 적용(F042) + 부제 3분류 정의(실/추정/유료) | 중 | ☐ |
| V4 | CQ 관리 | 시나리오 커버리지 스트립 S1~S7(F040) + Tier1/Tier2 필터 + CQ 클릭 → 우측 상세(질의서연결·빌드업 이력·산업부 보고) | 중 | ☐ |
| V5 | CQ 관리 | **신규 CQ 모달** + Modal focus trap(F046) - 모달 열림 시 첫 SELECT(시나리오) 자동 focus·Tab/Shift+Tab wrap·Esc 닫기 후 trigger button focus 복귀·body scroll lock | **상** | ☐ |
| V6 | 온톨로지 | 엔티티 13 카드(3컬럼 데스크탑, 좁은 폭 wrap, F045) + 관계 8행 표 + SourceBadge GIVC/UNIPASS/MOTIE 등(F041 격상) | 중 | ☐ |
| V7 | 온톨로지 | 관계 행 클릭 → **Modal** + `role="dialog"`·`aria-modal`·focus trap(F046) | **상** | ☐ |
| V8 | 그래프 | 도메인 토글(소부장 24노드 real / 호르무즈 44노드 mock) + GraphCanvas lazy chunk 로딩(445KB) | **상** | ☐ |
| V9 | 그래프 | 노드 클릭 → 우측 상세 패널 + 노드 미선택 시 **빈 상태 안내**(도메인 컨텍스트·노드수·클릭 가이드·사용 팁 3종, F043 E) + 필터/영향경로 토글 | 중 | ☐ |
| V10 | 시나리오 | CQ 선택(CQ-002 소부장 / CQ-001 호르무즈) → NL 질의 → Cypher 변환 토글 → 분석 실행 → **5단계 애니메이션 추론** | **상** | ☐ |
| V11 | 시나리오 | 결과 A 영향경로(cytoscape mini) + B Top5 + C 설명가능성(인과·취약성·EWS·재현성) + D 대응 옵션 + E 의사결정 리포트 (각 카드 SourceBadge F041·반응형 minmax F044) | **상** | ☐ |
| V12 | 비교 검증 | 좌 chatGIVC 카드 + 우 KG 카드 **양쪽 모두 SourceBadge**(F043 D, 좌="보고서 종합" est·우=NTIS/KIPRIS real) + 6축 비교표 + 좌우 큰 카드 minmax(320) 반응형 stack(F045) | **상** | ☐ |
| V13 | 추진 계획 | Phase 0~4 타임라인 **today 기준 자동 status**(F042 A) - 오늘 5/28에 Phase 0=active, Phase 1~4=upcoming + Phase 5컬럼 설명 반응형(F045) + 푸터 정식 직책 "KT DS Enterprise사업본부 AX컨설팅팀"(F043 F) | 중 | ☐ |
| V14 | 동선·a11y | **PageNav 7페이지 prev/next**(F042 B, data prev=null·plan next=null) + Sidebar nav `aria-label="주 메뉴"`(F043 H) + 메뉴 SVG aria-hidden·반응형 1280/700/400 wrap(F044/F045) | 중 | ☐ |

### v0.2 Lighthouse 실측 (시연 노트북, M5 잔여)

> v0.2 7페이지는 사용자 측 실측(F049: 사용자 결정 시연 직전 2건 중 하나). vite preview localhost:4173/4174/4175 fallback으로 헤드리스 가능.

```bash
pnpm build && pnpm serve:offline  # 4173 점유 시 4174/4175 자동 fallback
# 별도 터미널
npx lighthouse http://localhost:4175/#/platform/data --preset=desktop --only-categories=performance --view
# 위 패턴으로 7페이지 + 기존 v0.1 3페이지(공존) 실측
```

| 화면 | Perf | FCP | LCP | TBT | CLS | TTI | 비고 |
|------|:----:|:---:|:---:|:---:|:---:|:---:|:----:|
| `/platform/data` 데이터 현황 | _ | _ | _ | _ | _ | _ | KPI + 27행 테이블 |
| `/platform/cq` CQ 관리 | _ | _ | _ | _ | _ | _ | 좌우 패널 |
| `/platform/ontology` 온톨로지 | _ | _ | _ | _ | _ | _ | 엔티티 13 카드 |
| `/platform/graph` 지식그래프 | _ | _ | _ | _ | _ | _ | cytoscape 445KB lazy chunk |
| `/platform/scenario` 시나리오 | _ | _ | _ | _ | _ | _ | 5단계 추론 애니메이션 |
| `/platform/compare` 비교 검증 | _ | _ | _ | _ | _ | _ | 좌우 카드 + 6축 표 |
| `/platform/plan` 추진 계획 | _ | _ | _ | _ | _ | _ | Phase 타임라인 |

## 통과 기준 (DoD §4.1)

- [ ] 33개 기본 항목(I1~I33) 100% 통과 (v0.1, `/v1` 공존)
- [ ] 신규 기능 항목(N1~N12) 100% 통과 (v0.1 S6 chatgivc-align)
- [ ] **v0.2 7페이지 회귀 V1~V14 100% 통과 (시연 메인)**
- [x] 첫 로딩 <2s (Lighthouse/실측) - **✅ 측정 완료 2026-05-26**, 3화면 모두 0.5~0.7s (아래 Lighthouse 결과)
- [ ] S4 가중치 재계산 <100ms (콘솔 `performance.now()`) - *F016서 0.17ms 실측(MEMORY), 시연 노트북 재확인 권장*
- [ ] 출처 표기(⭐/△/※) 누락 0 (신규 GvcPane·통합뷰·질의 결과 포함)
- [ ] Tweaks `localStorage('koami-tweaks')` 영속 (새로고침 후 값 유지)
- [ ] `grep -r 'window.parent' src/` → 0건 (host-protocol 제거 검증)
- [ ] `grep -rE 'GVC[0-9]{5}' src/` → 0건 (실 GVC 제품코드 미노출 - virt만) *F027 자가 가드 테스트로 자동 검증됨*
- [ ] 화학/톨루엔 **사용자 노출 콘텐츠** 잔존 0 (S4·S6 - 기계 전환 F019~F023). ※ 코드 내 `/scenario/toluene` 라우트 alias(`App.tsx`)·리네임 이력 주석(`types/s6.ts`)은 의도적 잔존(무해)

## 자동 검증 결과

| 항목 | Sprint 1 (2026-05-24) | 현재 (2026-05-26) |
|------|------|------|
| `pnpm typecheck` (app+worker) | ✅ 0 error | ✅ 0 error |
| `pnpm lint` | ✅ 0 error | ✅ 0 error |
| `pnpm test` (vitest) | ✅ 9/9 (scoring) | ✅ **71** (scoring·gvcS6Adapter·chatgivc-executor·catalog 등) |
| `pnpm build` | ✅ JS 213KB (gz 70KB) + CSS 51KB (gz 10KB) | (시연 전 재실측) |
| `pnpm dev` | ✅ localhost:5173 200 OK | ✅ 동일 |
| `grep window.parent src/` | ✅ 0건 | ✅ 0건 |
| `grep -rE 'GVC[0-9]{5}' src/` | - | ✅ 0건 (F027 가드 테스트) |

### Lighthouse 실측 (2026-05-26)

> `pnpm build` → `vite preview :4173` → `npx lighthouse --preset=desktop --only-categories=performance` (Chrome headless). 목표: 첫 로딩 <2s.

| 화면 | Perf | FCP | LCP | Speed Index | TBT | CLS | TTI |
|------|:----:|:---:|:---:|:----:|:---:|:---:|:---:|
| Landing (`/`) | **99** | 0.7s | 0.7s | 0.7s | 0ms | 0 | 0.7s |
| S4 R&D (`/#/scenario/rnd`) | **100** | 0.5s | 0.5s | 0.5s | 0ms | 0.039 | 0.5s |
| S6 가치사슬+ChatGIVC (`/#/scenario/s6`) | **100** | 0.5s | 0.5s | 0.5s | 0ms | 0.017 | 0.5s |

- ✅ **3화면 전부 첫 로딩 0.5~0.7s - <2s 목표 대폭 통과** (TBT 0ms, CLS <0.1 양호)
- 빌드 산출: JS 238.8KB (gz 77.9) + CSS 51.3KB (gz 9.9)
- ⚠️ desktop 프리셋·localhost·headless 기준. 실 시연 환경(노트북·네트워크·CF Access)은 별도 변수 - 시연 노트북 실측 권장 (M5)
- HTML 리포트: `/tmp/koami-lh-{landing,scenario-rnd,scenario-s6}.report.html` (재부팅 시 소멸, `npx lighthouse`로 재생성)

## 차이 기록

(시연 직전 사용자가 발견한 차이를 여기에 기록)
