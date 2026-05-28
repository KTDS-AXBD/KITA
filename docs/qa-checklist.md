# KOAMI 시연 QA 체크리스트 (F008)

> 배포 후 / 시연 D-1에 점검. S1 33 인터랙션 회귀(`docs/03-do/sprint-1-regression-checklist.md`)와 연계.

## 사전 검증 완료 (Claude, 2026-05-24, 라이브 URL 실측)
- [x] 라이브 `/` 200 + 핵심 asset 200 (헬스체크 🟢)
- [x] **1920×1080 / 1366×768** 렌더링 정상, **가로 넘침 0**, 콘솔 에러 **0**
- [x] 라우팅(Landing/S4/S6/About) 200, 첫 로딩 FCP <2s, 출처표기 29개
- [x] **오프라인 자기완결성**: 빌드에 CDN/외부 런타임 호출 0 (토글 OFF=완전 정적). 유일 네트워크=opt-in `/api/chat`
- [ ] **남은 수동 (사용자 결정 2건만 유지, F049)**: V1~V14+I1~I33+N1~N12=**59 회귀 통과** + Lighthouse v0.2 7페이지 실측. (F049: 리허설·노트북 버전 고정·대형 디스플레이·Wi-Fi OFF 오프라인 구동 검증 폐기.)

## 1. 브라우저
- [ ] Chrome 최신 (시연 노트북)
- [ ] Edge 최신

## 2. 해상도
- [ ] 1920×1080
- [ ] 1366×768

## 3. 네트워크 (장애 시 백업 fallback용)
- [ ] 온라인 - 공개 CF URL 정상 구동
- [ ] cold load (캐시/탭 초기화 후 첫 로딩 < 2s)
- (F049: Wi-Fi OFF 오프라인 구동 검증 폐기. localhost 백업은 operations-manual §2 장애 표 fallback 옵션으로만 유지.)

## 4. 라우트 - v0.2 GIVC Ontology Platform (시연 메인)

> hash routing, 새로고침에도 동일 화면 유지

- [ ] `/` 루트 → v0.2 자동 표시(`/platform/data` 데이터 현황)
- [ ] `/select` 버전 선택기 - v0.1 / v0.2 카드 노출, 클릭 시 해당 셸로 이동
- [ ] `#/platform/data` 데이터 현황 (KPI 4 + 27행 테이블)
- [ ] `#/platform/cq` CQ 관리 (좌 목록 + 우 상세)
- [ ] `#/platform/ontology` 온톨로지 정의 (엔티티 13 + 관계 8)
- [ ] `#/platform/graph` 지식그래프 (cytoscape + 도메인 토글)
- [ ] `#/platform/scenario` 시나리오 분석 (CQ 토글 + 5단계 추론)
- [ ] `#/platform/compare` 비교 검증 (좌우 카드 + 6축 표)
- [ ] `#/platform/plan` 추진 계획 (Phase 0~4 + CQ Tier1/2)
- [ ] 7페이지 PageNav 하단 prev/next 버튼 동작

## 4b. 라우트 - v0.1 기존 PoC (공존, 시연 보조)

> v0.1 라우트는 `/v1` 접두 없이 직접 hash (registry OWNED_ROUTES 기준, F050 점검 시 정정).

- [ ] `#/v1` 또는 `/select` → v0.1 → Landing
- [ ] `#/scenario/rnd` S4 R&D 추천 (가중치 슬라이더·What-If)
- [ ] `#/scenario/s6` S6 가치사슬 (공작기계 다단계 + ChatGIVC 질의 패널 N1~N12)
- [ ] `#/scenario/toluene` (구 alias, `/scenario/s6`로 자동 매핑)
- [ ] `#/about/ontology` / `#/about/data` About
- [ ] `#/survey` 의견 회신 설문
- [ ] 각 라우트에서 새로고침 → 동일 화면 유지

## 5. 핵심 인터랙션 - v0.2 7페이지 (V1~V14 회귀 연계)

> 상세는 `docs/03-do/sprint-1-regression-checklist.md` V1~V14

- [ ] **데이터 현황** KPI 4 카드 + 27행 테이블 sticky 헤더(스크롤 시 컬럼명 유지, F042) + 최종 갱신일 노출
- [ ] **CQ 관리** 시나리오 커버리지 스트립 S1~S7 + 신규 CQ 모달 열기/닫기(focus trap F046)
- [ ] **온톨로지** 엔티티 13 카드 + 관계 8행 클릭 → Modal(focus trap·Esc 닫기·focus 복귀)
- [ ] **지식그래프** 소부장 24노드(real)/호르무즈 44노드(mock) 도메인 토글 + 노드 클릭 → 상세 패널 + 빈 상태 안내(F043)
- [ ] **시나리오 분석** 분석 실행 → 5단계 애니메이션 추론 → A 영향경로·B Top5·C 설명가능성·D 대응옵션·E 의사결정 리포트
- [ ] **시나리오 CQ 토글** CQ-002 소부장 ↔ CQ-001 호르무즈 (재현성 확인)
- [ ] **비교 검증** 좌측 chatGIVC + 우측 KG 두 카드 모두 SourceBadge(F043) + 6축 표
- [ ] **추진 계획** Phase 0~4 status 자동 계산 - 오늘 기준 active/done/upcoming(F042) + CQ Tier1/2 목록
- [ ] **PageNav** 7페이지 prev/next 순회 (data prev=null, plan next=null)
- [ ] **출처 메타** 실/추정/유료 SourceBadge 누락 0

## 5b. 핵심 인터랙션 - v0.1 (보조, 사용 시)

- [ ] S4 가중치 슬라이더 실시간 재계산
- [ ] S4 Data Expansion Hint 토글 → 정확도 65→88% boost
- [ ] S6 무역추이 차트 + 워드클라우드 + 다단계 가치사슬 그래프(F021)
- [ ] S6 ChatGIVC 질의 패널 도메인 토글 + L1~L5 live + C1~C3 curated(N1~N12)
- [ ] 출처표기 ⭐/△/※ 누락 0

## 6. 접근제어
- [ ] 공개 URL CF Access 보호됨 (F047/F048: 영구 운영, 시연 후 만료 폐기 항목)
- [ ] CF Access 이메일 정책 확인(`docs/deploy-guide.md`)

## 7. 시연 직전 (F049: 사용자 결정 2건만 유지)
- [ ] `bash scripts/healthcheck.sh <URL>` 전부 ✅
- [ ] V1~V14+I1~I33+N1~N12=**59 회귀** 통과
- [ ] Lighthouse v0.2 7페이지 실측 (`docs/03-do/sprint-1-regression-checklist.md` v0.2 Lighthouse 실측 표)
