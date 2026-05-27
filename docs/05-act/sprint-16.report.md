# Sprint 16 Report — F030 디자인 시스템 + 앱 셸

> 작성: 2026-05-27 · Sprint 16 · F030 · Match Rate: 100%

---

## §1. 요약

v0.32 "GIVC Ontology Platform" 사이드바 대시보드 셸을 KOAMI SPA에 성공적으로 이식했다.
기존 상단 탭 5개 → 좌측 사이드바(MAIN 5 + REF 2) 구조로 전환, 후속 S17~S21의 선행 게이트 달성.

---

## §2. 구현 산출물

### 신규 파일 (17개)
| 파일 | 역할 |
|------|------|
| `src/styles/v032-tokens.css` | v0.32 디자인 토큰 (`--op-accent: #E60012` 등 25개 변수) |
| `src/shell/Sidebar.tsx` | 사이드바 MAIN 5 + REF 2 + footer |
| `src/shell/HeaderBar.tsx` | 브레드크럼 + 도메인 배지 |
| `src/shell/AppLayout.tsx` | sidebar + header + page-content 래퍼 |
| `src/components/platform/Badge.tsx` | 출처(실/추정/유료) + 상태(verified/draft/pending) 배지 |
| `src/components/platform/KpiCard.tsx` | KPI 카드 (label + value + sub) |
| `src/components/platform/DataTable.tsx` | 데이터 테이블 (thead/tbody + hover) |
| `src/components/platform/EntityCard.tsx` | 엔티티 카드 (colorBlock + attrs + count) |
| `src/components/platform/Tooltip.tsx` | 3-type 툴팁 (attr/info/rel) |
| `src/components/platform/CypherBlock.tsx` | Cypher 구문 하이라이터 (React 엘리먼트, XSS 안전) |
| `src/components/platform/Toggle.tsx` | 온/오프 슬라이더 토글 |
| `src/components/platform/Modal.tsx` | 오버레이 모달 (Esc 닫기 + 외부 클릭 닫기) |
| `src/components/platform/Timeline.tsx` | Phase 타임라인 |
| `src/components/platform/index.ts` | barrel export |
| `src/features/platform/data/DataStatusPage.tsx` | 데이터 현황 (KPI 4 + 배지 stub) |
| `src/features/platform/cq/CqManagePage.tsx` | CQ 관리 placeholder |
| `src/features/platform/ontology/OntologyPage.tsx` | 온톨로지 정의 (EntityCard 3종 샘플) |
| `src/features/platform/graph/GraphPage.tsx` | 지식그래프 (CytoscapePoC 포함) |
| `src/features/platform/graph/CytoscapePoC.tsx` | **cytoscape PoC** — 10노드 소부장 미니 그래프 |
| `src/features/platform/scenario/ScenarioPage.tsx` | 시나리오 분석 (CypherBlock 샘플) |
| `src/features/platform/compare/ComparePage.tsx` | 비교 검증 placeholder |
| `src/features/platform/plan/PlanPage.tsx` | 추진 계획 (Timeline Phase 0~4) |

### 수정 파일 (6개)
| 파일 | 변경 내용 |
|------|----------|
| `src/App.tsx` | `/platform/*` 분기 + AppLayout 적용 |
| `src/shell/index.ts` | Sidebar·HeaderBar·AppLayout export 추가 |
| `src/main.tsx` | v032-tokens.css import 추가 |
| `src/styles/app.css` | 사이드바 대시보드 CSS 클래스 추가 (~180줄) |
| `index.html` | Pretendard CDN + 타이틀 갱신 |
| `package.json` + `pnpm-lock.yaml` | cytoscape@3.33.4, @types/cytoscape@3.31.0 추가 |

---

## §3. DoD 체크리스트

- [x] `pnpm typecheck` PASS (app + worker, 0 error)
- [x] `pnpm lint` PASS (0 warning, exit 0)
- [x] `pnpm test` PASS (71/71)
- [x] `pnpm build` 성공 (699KB gzip 227KB — cytoscape 포함)
- [x] 사이드바 7개 메뉴 클릭 → 라우팅 동작 (App.tsx `/platform/*` 분기)
- [x] 브레드크럼 현재 페이지 반영 (HeaderBar PAGE_LABELS 맵)
- [x] cytoscape PoC: 10노드 그래프 렌더, 초기화 시간 콘솔 로깅
- [x] 기존 5개 라우트 정상 동작 (기존 AppHeader 경로 유지)
- [x] `--op-accent: #E60012` + Pretendard 폰트 적용

---

## §4. 주요 기술 결정 및 교훈

### 4.1 XSS 보안 처리
- CypherBlock 초안: `dangerouslySetInnerHTML` + regex 하이라이팅 → **security hook 경고 감지**
- 수정: React 엘리먼트 기반 토크나이저로 교체 (Set 기반 키워드 판정 + 순차 파싱)

### 4.2 디자인 토큰 격리
- 기존 `--axis-*` 변수와 충돌 방지: 신규 토큰에 `--op-` 접두사 적용
- 두 시스템 병존 → 기존 라우트 영향 0

### 4.3 cytoscape 번들 크기
- 정적 import 시 699KB (cytoscape ~360KB 기여)
- **F034 권장**: `import('cytoscape')` dynamic import → 그래프 페이지 진입 시 lazy load
- F030 PoC에서 기능 동작 검증 완료, 최적화는 F034

### 4.4 이중 셸 공존 전략
- `/platform/*` → AppLayout (사이드바 대시보드)
- 기타 → AppHeader (기존 상단 탭)
- 기존 기능(S4·S6·설문·About) 완전 보존

---

## §5. Match Rate: 100%

| 항목 | 가중치 | 결과 |
|------|--------|------|
| 사이드바 7메뉴 렌더 | 30% | ✅ PASS |
| 디자인 토큰 | 15% | ✅ PASS |
| 공용 컴포넌트 9종 | 30% | ✅ PASS |
| cytoscape PoC | 15% | ✅ PASS |
| 기존 라우트 보존 | 10% | ✅ PASS |

**종합: 100% / 100%**

---

## §6. 다음 Sprint 준비

- **S17 (F031·F036·F037)**: 정적 콘텐츠 3종 — 데이터현황 실 데이터, 비교검증 6축 표, 추진계획 CQ 목록
- **S18 (F032·F033)**: CQ 관리(목록·상세·모달) + 온톨로지 정의(엔티티 13종·관계 8종)
- **F034 (S19)**: cytoscape dynamic import + 노드 상세패널 + 도메인 토글
- **번들 최적화**: F034에서 `import('cytoscape')` lazy load 적용 (목표 초기 번들 <350KB)
