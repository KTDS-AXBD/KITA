# F015 — kita-givc Repository 실구현체 + 어댑터 Planning Document

> **Summary**: F014 적재 스냅샷(`s6.real.snapshot.json`)을 **동기** `TolueneRepository` 인터페이스로 서빙하는 `SnapshotTolueneRepository` + 어댑터. 화면(`S6Page`) 코드 무변경 보장(옵션A). 실데이터 없는 항목(뉴스·힌트)은 Mock fallback(하이브리드). 토글로 Mock↔실 전환(데모 안전).
>
> **Project**: KITA PoC (kita-givc) · **Version**: 0.1.0 · **Date**: 2026-05-25 · **Status**: Draft

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | F014가 실데이터를 D1/스냅샷에 적재했지만, S6 화면은 여전히 MockTolueneRepository를 소비. 실데이터를 화면에 연결하되 **화면 코드는 0줄 변경**해야(KPI). |
| **Solution** | 스냅샷을 동기 import하는 `SnapshotTolueneRepository`(동일 인터페이스 7메서드) + 어댑터(스키마차·gap 흡수). `index.ts` 토글로 교체(화면 무변경). |
| **Function/UX Effect** | S6가 실 무역·기업·그래프로 렌더. 뉴스/힌트는 Mock(※가상) 유지. 토글 OFF=Mock(데모 기본 안전). |
| **Core Value** | "Repository 교체만으로 Mock→실데이터" 입증 — 데이터레이어 격리(PRD §6 Repository 패턴)의 실증. |

---

## 1. Scope

### 1.1 In Scope
- [ ] 스냅샷 committed 위치 — `src/data/snapshot/s6.real.snapshot.json`(build-snapshot 출력 변경, Vite import 가능)
- [ ] **어댑터** `src/data/repository/adapters/tolueneSnapshot.ts` — 스냅샷 → 도메인 타입:
  - getProduct → 정적 reference(name·HS290230·CAS 108-88-3, ⭐real 공개표준)
  - getTradeSeries → 스냅샷 tradeSeries + **anomalies 산출**(QoQ 급변 △est)
  - listCompanies → 스냅샷 companies(biz/role 매핑)
  - getWordcloud → 실데이터 없음 → **Mock fallback**(※virt)
  - listHints → 시연 카드 → **Mock fallback**(※virt)
  - getGraph/getPositionedGraph → 스냅샷 graph + **결정적 레이아웃 산출**(TOL 중심 방사형, 실 node id 대응)
- [ ] `SnapshotTolueneRepository implements TolueneRepository`(동기)
- [ ] `index.ts` 토글 — `import.meta.env.VITE_DATA_SOURCE === 'real' ? snapshot : mock`(기본 mock)
- [ ] 검증 — typecheck(app+worker) + build + vitest + S6 화면 무변경(diff 0 in features/)

### 1.2 Out of Scope
- 화면 컴포넌트 수정(무변경이 목표) / S4 슬라이스 / 뉴스 실적재(P1)
- 런타임 D1 직접 조회(옵션A=스냅샷, D1 라이브는 Worker RAG·F016)
- 배포(로컬 검증만, 라이브 데모는 별도 게이트)

---

## 2. Requirements

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-01 | 스냅샷 src/ 위치로 committed + import | High |
| FR-02 | SnapshotTolueneRepository 7메서드 동기 구현(인터페이스 동일) | High |
| FR-03 | 어댑터 gap-fill: product(reference)·anomalies(△est)·wordcloud/hints(Mock virt) | High |
| FR-04 | 그래프 결정적 레이아웃(실 node id, ≤50, 중앙붕괴 없음) | High |
| FR-05 | index.ts 토글(기본 mock, VITE_DATA_SOURCE=real 시 snapshot) | High |
| FR-06 | 화면 코드(features/) 변경 0 | High |
| FR-07 | typecheck/build/test green | High |

---

## 3. Success Criteria (DoD)

- [ ] `git diff src/features/` = 0 (화면 무변경)
- [ ] VITE_DATA_SOURCE=real 빌드 시 S6가 실 무역(4분기)·기업(6사)·그래프(11노드) 렌더
- [ ] 토글 OFF(기본)=Mock 동일 동작(회귀 0)
- [ ] provenance 표기 유지(real/est/virt) — share=△, 뉴스=※
- [ ] pnpm typecheck + build + test PASS

---

## 4. Risks

| Risk | Mit |
|------|-----|
| 동기 인터페이스 위반(async 유혹) | 스냅샷 정적 import(동기) 고수 |
| 그래프 레이아웃 좌표 부재→중앙 붕괴 | 어댑터 결정적 방사형 좌표 산출 |
| 실데이터 gap(뉴스·힌트)으로 화면 깨짐 | Mock fallback(※virt) |
| 실데이터 토글이 라이브 데모 오염 | 기본 OFF(mock), 배포 분리 |
| 회귀(vitest S4 9케이스)는 RndRepository — 무영향 | toluene만 교체 |

---

## 5. Architecture

```
src/data/snapshot/s6.real.snapshot.json        # F014 build-snapshot 출력(committed)
src/data/repository/adapters/tolueneSnapshot.ts # 스냅샷→도메인 어댑터(gap-fill·레이아웃)
src/data/repository/TolueneRepository.ts        # + SnapshotTolueneRepository
src/data/repository/index.ts                    # 토글(mock|snapshot)
```

- **레이아웃**: 어댑터가 viewBox(800×500) 내 결정적 배치 — TOL 중앙, hscode 상단, 국가 좌호, 기업 우호. mergeLayout 미사용(stale layout 회피).
- **provenance**: 행 source 유지 + share=△est·뉴스=※virt 표기.

---

## 6. Next Steps

1. [ ] build-snapshot 출력 → src/data/snapshot/ + 재생성
2. [ ] 어댑터 + SnapshotTolueneRepository + 토글
3. [ ] typecheck/build/test + 화면 diff 0 검증
4. [ ] F016 조회·회귀·성능

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-25 | 초안 — 스냅샷 동기 서빙·하이브리드 어댑터(gap Mock fallback)·결정적 레이아웃·토글 | 서민원 + Claude Code |
