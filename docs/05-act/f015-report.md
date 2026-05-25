# F015 — kita-givc Repository 실구현체 + 어댑터 완료 리포트

> **완료일**: 2026-05-25 · **Plan**: [f015](../01-plan/features/f015-repository-adapter.plan.md) · **결과**: ✅ **완료** — 실데이터 스냅샷을 동기 `TolueneRepository`로 서빙, **화면 코드 변경 0**(KPI 충족).

## 1. Executive Summary

| 관점 | 결과 |
|------|------|
| **Problem** | F014 적재 실데이터를 S6 화면에 연결하되 화면 코드 0줄 변경(PRD KPI). |
| **Solution** | `SnapshotTolueneRepository`(동기 7메서드) + 어댑터(gap-fill·결정적 레이아웃) + `index.ts` 토글. |
| **Value Delivered** | Repository 교체만으로 Mock→실데이터 — 데이터레이어 격리 실증. `features/` diff 0. |

## 2. DoD 달성 (실측)

- [x] **화면 무변경**: `git diff src/features/` = 0 ✅
- [x] **실데이터 렌더**: VITE_DATA_SOURCE=real 빌드 시 S6 = 실 무역 4분기·기업 6사(롯데케미칼 20.4조 등)·그래프 11노드. 번들 실 기업명 포함 확인.
- [x] **토글 OFF=Mock**: 기본 빌드 런타임 Mock 선택(데모 안전). lint·test(9/9)·typecheck green.
- [x] **provenance 유지**: 무역·기업=⭐real, 이상치·점유율=△est, 뉴스·힌트=※virt(Mock fallback).

## 3. 구현

```
src/data/snapshot/s6.real.snapshot.json          # F014 스냅샷(committed, SPA import)
src/data/repository/adapters/tolueneSnapshot.ts  # 어댑터: 스냅샷→도메인 + gap-fill + 결정적 레이아웃
src/data/repository/TolueneRepository.ts          # + SnapshotTolueneRepository(동기)
src/data/repository/index.ts                      # 토글: VITE_DATA_SOURCE=real ? snapshot : mock
```

**어댑터 하이브리드 전략** (스키마차·gap 흡수):
| 메서드 | 소스 | provenance |
|--------|------|:---:|
| getProduct | 정적 reference(HS/CAS 공개표준) | ⭐real |
| getTradeSeries | 스냅샷 + 이상치 QoQ±10% 산출 | real / 이상치 △est |
| listCompanies | 스냅샷 companies | ⭐real(매출) / share △est |
| getGraph·getPositionedGraph | 스냅샷 + **결정적 방사형 레이아웃**(TOL중앙·국가좌호·기업우호) | ⭐real |
| getWordcloud·listHints | **Mock fallback**(뉴스 P1·시연카드) | ※virt |

## 4. 설계 결정·한계

- **동기 인터페이스 보존**(옵션A): 스냅샷 정적 import → async화 없이 화면 무변경. D1 라이브 조회는 Worker RAG(F016).
- **레이아웃**: stale `s6.layout.json`(Mock node id 기준) 미사용 → 어댑터가 실 node id로 결정적 좌표 산출(중앙붕괴 방지).
- **번들**: 런타임 토글이라 Vite가 Mock·실 양쪽 코드 번들(동기 import 트리셰이킹 불가). 데이터 전부 공개(관세청·DART) → 기밀 누수 아님. 번들 크기 214KB 유지.
- **share=△est**: 전사 매출 proxy(톨루엔 시장점유 아님) — DataMark △ 표기.

## 5. 후속 (F016)

- S6 4종 조회(SQL·그래프·FTS·RAG) + 33 인터랙션 회귀 + 성능(<2s 로딩·<100ms 재계산) 실측.
- 뉴스 워드클라우드 실적재(P1).
- 실데이터 모드 라이브 배포 판단(현 데모는 Mock 기본 — 별도 게이트).

---

*F015 ✅ (2026-05-25). 다음 = F016 조회·회귀·성능.*
