# Sprint 14 Report — F027: 실 질의 데모 패널 (ChatGIVC Query)

**Sprint:** 14 | **F-item:** F027 | **일자:** 2026-05-25
**Match Rate:** 100% | **Status:** DONE

## 구현 결과

### 신규 파일 (5)
| 파일 | 내용 |
|------|------|
| `src/data/queries/chatgivc-catalog.ts` | 8개 쿼리 카탈로그 (L1~L5 live, C1~C3 curated) + resolveTemplate |
| `src/data/queries/chatgivc-executor.ts` | executeQuery — GvcRepository 위임 실행 |
| `src/data/queries/__tests__/chatgivc-catalog.test.ts` | 12 tests — ID순서·virt코드·SQL검증 |
| `src/data/queries/__tests__/chatgivc-executor.test.ts` | 14 tests — L1~L5 실행·L4앵커필터·L5평균·C 반환null |
| `src/features/s6/ChatGivcQueryPane.tsx` | 패널 컴포넌트 (쿼리선택·SQL병기·결과테이블) |

### 수정 파일 (1)
| 파일 | 변경 |
|------|------|
| `src/features/s6/S6Page.tsx` | `givcTab` state + 탭 switcher + ChatGivcQueryPane 조건부 렌더 (additive) |

## DoD 검증

| 항목 | 결과 |
|------|------|
| live 5종 동작 (미러 실행, 실 결과) | ✅ |
| 큐레이션 3종 | ✅ |
| 실SQL↔미러SQL 병기 | ✅ |
| 도메인 토글 연동 | ✅ |
| 출처표기 (⭐/△/※) | ✅ |
| 기존 S6 무손상 (additive) | ✅ |
| typecheck PASS | ✅ |
| lint PASS | ✅ |
| test PASS (71건, 신규 26건) | ✅ |
| 콘솔에러 0 | ✅ |

## 공개 경계 검증

- `실GVC코드…` 등 실 GVC 코드 미포함 확인 (테스트 `expect(sql).not.toMatch(/GVC\d{5}/)`)
- virt 코드 `GVC-MACH-MC001` / `GVC-SEMI-WF001` 사용
- 테이블명·컬럼명(`scmm_his_chart`, `mart.lnk0955a` 등) 공개 OK

## 설계 핵심 결정 재현

**§1 C 하이브리드**: 좌=실 ChatGIVC SQL(다크 그린), 우=데모 미러 SQL(다크 블루) 병기.
미러 SQL로 D1 실행 → 실 결과 + "본사업화 시 실 GIVC에 직결" 메시지.

**큐레이션 mart.* 의존**: C1(mart.lnk0955a)·C2(trade_search_target_gvc)·C3(mart.lnk0957a) 실 SQL 표시 + 정적 결과. mart.* 미러 부재 이유 명시.

## 다음 Sprint

- F028 (S15): 본사업화 청사진 정식화
- 라이브 배포: `pnpm deploy:cf` (Master 결정)
