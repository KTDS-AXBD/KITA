# Sprint 13 — F026 Plan: Repository GVC 재정렬 + 통합 시나리오

## §1 목적
`GvcRepository`(F025 산출)를 S6 화면에 연결하여 기계↔반도체 도메인 토글과 통합 시나리오를 제공한다.  
기존 `s6Repository` 경로는 완전 보존 — 새 GVC 패널만 additive로 추가한다.

## §2 DoD
- 기계·반도체 도메인 토글 렌더 (콘솔에러 0 · 출처 표기 유지)
- 통합 시나리오 패널 (공통 가치사슬 단계 교차 비교 + 자립화 지표)
- 기존 S6 화면 회귀 무손상 (Mock/real 양쪽)
- `pnpm typecheck && pnpm lint && pnpm test` PASS

## §3 선행 산출물 (F025)
- `src/data/repository/GvcRepository.ts` — listDomains / listProducts / getNetwork / listMetrics / listMetricsByDomain
- GVC 의미층 코드 `GVC-MACH-*` (기계) / `GVC-SEMI-*` (반도체), provenance=virt

## §4 변경 파일 목록
| 파일 | 종류 | 설명 |
|------|------|------|
| `src/store/gvcDomainStore.ts` | NEW | Zustand 도메인 상태 (activeDomain: mach\|semi) |
| `src/store/index.ts` | MODIFY | useGvcDomainStore export 추가 |
| `src/data/repository/adapters/gvcS6Adapter.ts` | NEW | GvcRepository → KnowledgeGraph / S6Kpi 어댑터 |
| `src/features/s6/DomainToggle.tsx` | NEW | 기계↔반도체 토글 UI |
| `src/features/s6/GvcPane.tsx` | NEW | GVC 도메인 분석 패널 (그래프 + 지표 테이블) |
| `src/features/s6/GvcIntegration.tsx` | NEW | 통합 시나리오 (교차 비교 + 자립화 대조) |
| `src/features/s6/S6Page.tsx` | MODIFY | 기존 렌더 유지, 토글+패널 additive 삽입 |
| `src/data/repository/__tests__/gvcS6Adapter.test.ts` | NEW | 어댑터 단위 테스트 |

## §5 제약
- 공개 레포 유출 금지: Plan/Design/Report 산문에도 실 GVC코드·실 테이블명 언급 금지
- CI 없음: 로컬 PASS = DONE (GitHub Actions 대기 금지)
- getTradeSeries: 기존 공개데이터(관세청) 유지 (GVC 미러 미제공)
- merge 금지: PR(base=main) 생성까지

## §6 구현 순서
1. gvcDomainStore.ts → store/index.ts export
2. gvcS6Adapter.ts (순수 함수) → 테스트
3. DomainToggle.tsx → GvcPane.tsx → GvcIntegration.tsx
4. S6Page.tsx additive 삽입
5. typecheck / lint / test 일괄 검증
