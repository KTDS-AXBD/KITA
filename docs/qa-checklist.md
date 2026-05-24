# KITA 시연 QA 체크리스트 (F008)

> 배포 후 / 시연 D-1에 점검. S1 33 인터랙션 회귀(`docs/03-do/sprint-1-regression-checklist.md`)와 연계.

## 사전 검증 완료 (Claude, 2026-05-24, 라이브 URL 실측)
- [x] 라이브 `/` 200 + 핵심 asset 200 (헬스체크 🟢)
- [x] **1920×1080 / 1366×768** 렌더링 정상, **가로 넘침 0**, 콘솔 에러 **0**
- [x] 라우팅(Landing/S4/S6/About) 200, 첫 로딩 FCP <2s, 출처표기 29개
- [x] **오프라인 자기완결성**: 빌드에 CDN/외부 런타임 호출 0 (토글 OFF=완전 정적). 유일 네트워크=opt-in `/api/chat`
- [ ] **남은 수동 (시연 노트북·D1)**: 실 Chrome/Edge 버전 확인 · 대형 디스플레이 1회 · 실제 Wi-Fi OFF 오프라인 구동 · 33 인터랙션 회귀 클릭

## 1. 브라우저
- [ ] Chrome 최신 (시연 노트북 버전 고정 기록: ______)
- [ ] Edge 최신

## 2. 해상도
- [ ] 1920×1080
- [ ] 1366×768
- [ ] 외부 대형 디스플레이 (시연장 프로젝터/모니터)

## 3. 네트워크
- [ ] 온라인 — 공개 CF URL 정상 구동
- [ ] **오프라인 — localhost 백업(`pnpm serve:offline`) 완전 구동** (네트워크 차단 후 테스트)
- [ ] cold load (캐시/탭 초기화 후 첫 로딩 < 2s)

## 4. 라우트 (hash routing — 새로고침 유지 확인)
- [ ] `/` Landing
- [ ] `#/scenario/rnd` S4
- [ ] `#/scenario/toluene` S6
- [ ] `#/about/ontology` / `#/about/data` About
- [ ] 각 라우트에서 새로고침 → 동일 화면 유지

## 5. 핵심 인터랙션 (S1 회귀 연계)
- [ ] S4 가중치 슬라이더 실시간 재계산
- [ ] S4 Data Expansion Hint 토글 → 정확도 65→88% boost
- [ ] 지식그래프 노드 hover → tooltip(출처)
- [ ] 표 행 hover → 그래프 하이라이트
- [ ] S6 무역추이 차트 + 워드클라우드
- [ ] 출처표기 ⭐/△/※ 누락 0

## 6. 접근제어
- [ ] 공개 URL이 비추측 경로/CF Access로 보호됨
- [ ] 시연 후 만료/비활성화 절차 확인 (`docs/deploy-guide.md`)

## 7. 시연 직전
- [ ] `bash scripts/healthcheck.sh <URL>` 전부 ✅
- [ ] 리허설 2회
