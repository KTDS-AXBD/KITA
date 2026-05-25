# Sprint 14 Plan — F027: 실 질의 데모 패널 (ChatGIVC Query)

**Sprint:** 14 | **F-item:** F027 | **일자:** 2026-05-25

## §1 목표

S6 하단에 "💬 ChatGIVC 질의" 탭을 추가한다. 실 ChatGIVC SQL과 데모 미러 SQL을 병기(C 하이브리드)하고, 미러 SQL로 D1 실행 → 실 결과를 보여줘 "본사업화 시 실 GIVC에 직결"을 시연한다.

## §2 스코프

**포함 (F027):**
- `src/data/queries/chatgivc-catalog.ts` — 8개 쿼리 카탈로그 + resolveTemplate
- `src/data/queries/chatgivc-executor.ts` — executeQuery (리포지토리 위임)
- `src/features/s6/ChatGivcQueryPane.tsx` — 패널 컴포넌트
- `src/features/s6/S6Page.tsx` — 탭 추가 (additive, F026 무손상)
- 테스트 2파일

**제외:**
- 실 D1 API 호출 (Mock Repository 사용)
- 뉴스 RAG (F018)
- 신규 타입 (기존 타입 재사용)

## §3 공개 경계

- ✅ 테이블명·컬럼명 공개 OK: `scmm_his_chart`, `itm3101110000`, `mart.lnk0955a` 등
- ❌ 실 GVC 제품코드 (`실GVC코드…`) 절대 금지 → virt 코드(`GVC-MACH-*`/`GVC-SEMI-*`)만

## §4 DoD

- [ ] live 5종 동작 (미러 실행, 실 결과)
- [ ] 큐레이션 3종 표시
- [ ] 실SQL ↔ 미러SQL 병기
- [ ] 도메인 토글(F026) 연동
- [ ] 출처표기 (⭐/△/※)
- [ ] 기존 S6 무손상 (additive only)
- [ ] typecheck PASS
- [ ] lint PASS
- [ ] test PASS (45+건 예상)
- [ ] 콘솔 에러 0

## §5 구현 파일 목록

| 파일 | 작업 |
|------|------|
| `src/data/queries/chatgivc-catalog.ts` | 신규 |
| `src/data/queries/chatgivc-executor.ts` | 신규 |
| `src/data/queries/__tests__/chatgivc-catalog.test.ts` | 신규 |
| `src/data/queries/__tests__/chatgivc-executor.test.ts` | 신규 |
| `src/features/s6/ChatGivcQueryPane.tsx` | 신규 |
| `src/features/s6/S6Page.tsx` | 수정 (additive — 탭 state + ChatGivcQueryPane 추가) |
