# F023 — 기계산업 실데이터 파이프라인 재적재 리포트 (S10)

> **완료일**: 2026-05-25 · **게이트**: [데이터 가용성 미니게이트 GO 3/3](./f023-data-gate-report.md)
> **결과**: 🟢 **완료** — koami-givc 파이프라인을 톨루엔 → 공작기계 다단계 가치사슬로 전면 재적재. real 모드 시각검증 PASS(콘솔에러0). Mock 데모 무변경.

---

## 1. 무엇을 했나

S9(F021)에서 Mock S6는 공작기계 다단계 가치사슬로 전환됐으나, **real 경로 스냅샷·ingest는 톨루엔 잔존**이었다. F023은 real 파이프라인(관세청 무역 + DART 기업 → D1 → Vectorize → 스냅샷)을 기계산업으로 재적재하여 `VITE_DATA_SOURCE=real` 토글 시 머시닝센터 다단계 가치사슬이 실데이터로 구동되게 했다.

**데이터 결정 (사용자 확정)**: ① 데이터 가용성 미니게이트 선행 ② 실제 상장 기계사 실명 적재 ③ Mock과 동일한 다단계 그래프 토폴로지.

## 2. 가치사슬 (실데이터)

| Tier | 기업(2024 DART 실매출) | HS·무역수지(관세청 2024) |
|------|----------------------|------------------------|
| 장비 (anchor) | 화천기공 2,222억·스맥 2,013억·한국정밀기계 637억 | 845710 머시닝센터 — 수출$486M/수입$149M **흑자** |
| 부품 | 삼익THK 3,044억(베어링)·에스피지 3,885억·에스비비테크 55억·우림피티에스 718억(감속기) | 848340 감속기 — 수출$324M/수입**$497M 적자(자립화)** · 848210 베어링 균형 |
| 소재 | 세아베스틸지주 3.6조·세아특수강 1.0조·현대제철 23.2조 | 722840 특수강 — 수출$10M/수입**$50M 적자(자립화)** |

핵심 서사: **장비는 흑자, 핵심 부품(감속기)·소재(특수강)는 수입의존 적자** = KOAMI 소부장 자립화. 무역수지 적자/흑자는 D1 `trade_stats`에서 런타임 산출(하드코딩 아님).

## 3. 변경 (16파일)

**ingest 파이프라인 (7)**: `lib/dart.mjs`(TARGETS 화학6사→기계10사 +tier/attach)·`ingest-companies.mjs`(tier 적재)·`ingest-trade.mjs`(단일HS→앵커+tier 멀티HS)·`build-graph.mjs`(flat→다단계: 소재→부품→장비 anchor + tier metric 노드 무역수지)·`build-snapshot.mjs`(앵커845710·root MC·tierTrade/byCountry 구조화)·`ingest-vectorize.mjs`(코퍼스 텍스트 기계)·`fixture-local.sql`(로컬 스모크 기계).
**스키마 (1)**: `migrations/0001`(companies +tier 컬럼).
**공용/Worker (3)**: `givc-queries.mjs`(companiesSql +tier·기본 HS/root 845710/MC)·`worker/index.ts`(givc 기본값 MC/845710)·`smoke-queries.mjs`(MC·감속기·845710).
**src 데이터계층 (4)**: `types/s6.ts`(+S6Kpi)·`mock/s6.ts`(+S6_KPIS)·`adapters/s6Snapshot.ts`(REAL_PRODUCT 머시닝센터·+adaptKpis·SnapshotShape +tierTrade/byCountry)·`S6Repository.ts`(+getKpis Mock/Snapshot).
**화면 (1)**: `features/s6/S6Page.tsx` — ↓ §4 참조.
**정리**: 죽은코드 `graph-layout/s6.layout.json`+S6_LAYOUT 제거(톨루엔 잔재·미사용).

## 4. "화면 코드 변경 0" DoD 해석 + KPI 하드코딩 결함

- **Repository 스왑 자체는 화면 무변경 증명**: product·trade·companies·graph는 이미 `s6Repository` 소비 → 스냅샷+어댑터 교체만으로 Mock→real 전환(diff 0). Repository 패턴 입증 성립.
- **별도 식별된 S9 잔존 결함**: `S6Page.tsx` KPI 카드 4장 + 차트 부제가 **하드코딩**(`$972M`·`$994M`·`일본34%`·`22Q1—25Q4`). real 모드에서 그래프·기업표(실데이터)와 불일치. 게다가 `$972M`/`$994M`는 **F019 게이트의 2배 중복합산 오류값**(관세청 API가 월별행 + `총계`행을 함께 반환 → 게이트가 둘 다 합산. 정확한 연간치는 $486M).
- **수정 (사용자 결정 = 데이터 연동)**: `getKpis()`를 Repository에 추가(Mock=큐레이션 상수 S6_KPIS, real=스냅샷 산출 adaptKpis). S6Page는 `getKpis()` 소비. 차트 부제도 `trade.quarters` 산출. **Mock 모드 화면 무변경**(S6_KPIS=기존 리터럴, Mock S6_TRADE에서 동일 산출), real 모드는 실데이터 일관.
- **교훈**: typecheck/lint/test/build 전부 통과했으나 **브라우저 시각검증이 정적검증 사각의 하드코딩 카피를 포착** — MEMORY 예고 패턴의 정확한 재현.

## 5. 검증

| 항목 | 결과 |
|------|------|
| 재적재(remote D1) | 무역 4HS/16행·기업 10사(전원 실매출)·그래프 18노드 다단계·FTS 28·**provenance real=47**(가상0) |
| 스냅샷 | 18노드·4분기·10기업, 화학 잔존 **0** |
| Vectorize | 구 톨루엔 벡터 9개 삭제 → vectorCount **18**(기계만) |
| typecheck/lint | PASS |
| vitest | **23/23 PASS** |
| build | PASS (222KB/gz 73KB) |
| 시각검증 real | 콘솔에러0·KPI 실데이터($486M·감속기$497M·핵심5·일본61%)·다단계 그래프·실기업10사 ⭐ |
| 시각검증 Mock | 콘솔에러0·KPI 큐레이션($972M·일본34%)·가상SME 유지 — **데모 무변경** |
| 로컬 스모크 | MC 재귀CTE 10노드·FTS '감속기' 2건·845710 2분기 PASS |

## 6. 남은 것

- **라이브 미배포**: real 적재는 remote D1 완료, 그러나 라이브 Worker는 미배포(Mock 기본). 기계 콘텐츠 전환 트랙(F019~F023) 완료 → `pnpm deploy:cf` 일괄 배포는 별도 결정.
- **CNC·서보 tier**: 순수 상장 CNC 컨트롤러 기업 부재 → real 그래프는 베어링·감속기·특수강 3 tier 노드(스맥이 장비+제어 통합). 시연 시 보완 가능.
- **현대제철(23.2조)**: 종합철강이라 소재 노드 매출 규모 압도 — 자립화 서사 중심은 감속기 강소기업(에스피지·에스비비테크).
- **뉴스 워드클라우드·RAG**: 여전히 ※가상 fallback (F018, 외부 게이트).

---

*F019 스코프 게이트 → F020+F022(S4·프레이밍) → F021(S6 Mock) → **F023(S6 real)** 로 기계산업 콘텐츠 전환 트랙 완료.*
