# F013 — kita-givc M0 PoC 게이트 판정 리포트

> **판정일**: 2026-05-25 · **Plan/Design**: [Plan](../01-plan/features/f013-m0-poc-gate.plan.md) · [Design](../02-design/features/f013-m0-poc-gate.design.md)
> **종합 판정**: 🟢 **조건부 PASS** — 저장소(D1+Vectorize) 타당성 입증. 0b·0c 압도적 통과, 0d 파이프라인·D1·스냅샷 경로 검증. **잔여 = 0d 라이브 관세청 fetch(키 활성화 대기) + 0a 라이선스 캡처.**

---

## 1. 측정 결과 요약

| 항목 | 기준 | 실측 | 판정 | 비고 |
|------|------|------|:----:|------|
| **0b** D1 그래프 깊이2 | ≤50ms | **중앙값 0.37ms** (p95 0.50ms, min 0.27 max 0.58) | ✅ **PASS** | 노드10·엣지24, 재귀 CTE 20회 측정(meta.duration) |
| **0c** Vectorize 의미검색 | ≥80% | **100% (15/15)** | ✅ **PASS** | bge-m3(1024d, cosine), corpus 12 / 질의 15, top-k=3 |
| **0d** 적재 1라운드 | 1명령 재현+검증 | 파이프라인·D1 write/read·스냅샷·XML파서 ✅ / **라이브 fetch 403(게이트웨이 전파 대기)** | 🟡 **부분** | 활용신청 승인 완료, 키 전파 후 라이브 1라운드 |
| **0a** 소스·라이선스 | 상업이용+API 200 | **✅ 이용허락범위 "제한 없음"(상업가능) + 활용신청 승인(15100475, 2026-05-25)** / API 200은 전파 대기 | 🟢 **사실상 완료** | 라이선스·승인 확인, 게이트웨이 전파만 잔여 |

---

## 2. 항목별 상세

### 0b — D1 그래프 (✅ PASS, 압도적)
- 스키마 `graph_nodes`/`graph_edges`(무방향 양방향 2행) + 깊이2 재귀 CTE(`WITH RECURSIVE`, depth<2).
- `wrangler d1 execute --remote --json`의 `meta.duration`(서버 SQL 시간) 워밍업3+측정20회.
- **중앙값 0.37ms** — 기준(50ms) 대비 ~135배 여유. 데모 볼륨(노드≤50)에서 D1 인접리스트 그래프 충분 입증. **사전계산·대안 그래프 불필요.**

### 0c — Vectorize 의미검색 (✅ PASS, 100%)
- 임베딩 `@cf/baai/bge-m3`(다국어·한국어, 1024차원) REST run → Vectorize v2 upsert → top-k 검색.
- 라벨 샘플셋 15질의(HS코드·수입국·기업·용도·규제 등) 전부 정답 top-3 포함.
- ⚠️ **교훈**: Vectorize upsert는 **비동기 mutation** — 초기 2s 대기로 0%(빈 결과) → `processedUpToMutation` 폴링 보정 후 100%. (스크립트 반영 완료.)
- 한국어 도메인 질의에 bge-m3 적합성 확인. **모델 교체·튜닝 불필요.**

### 0d — 적재 1라운드 (🟡 부분, 전파 대기)
- ✅ 스크립트 완성(`poc-toluene.mjs`): 추출→정규화→provenance→검증/롤백→D1 upsert→조회.
- ✅ **실 스펙 반영**: 데이터셋이 **XML 포맷**(JSON 아님) → 의존성 없는 XML 파서 + `year`("YYYY.MM" 월단위)→분기 집계 + 다국가(JP/CN/US, `cntyCd` 필수) 루프.
- ✅ D1 write/read 경로 검증(graph seed upsert+count, trade_stats 스키마 적용).
- ✅ 옵션A 스냅샷 경로(`build-snapshot.mjs`): D1 → `s6.real.snapshot.json`이 `KnowledgeGraph`/`TradeSeries` shape 일치(노드10·엣지12 dedup). **동기 인터페이스 보존 입증.**
- 🟡 **라이브 관세청 fetch = HTTP 403** — 키 형식 확인(Encoding 키 raw append, 401→403). **활용신청 승인 직후라 apis.data.go.kr 게이트웨이 전파 대기**(자동승인도 수분~1h). → 전파 후 `pnpm poc:ingest` 1회로 0d 완료.

### 0a — 소스·라이선스 (🟢 사실상 완료)
- ✅ 소스세트 확정 + **활용신청 완료**(Playwright 자동, 2026-05-25, 개발계정·자동승인·만료 2028-05-25):
  - 무역 **15100475(국가별)** ✅ 승인 — 그래프 국가노드·국가별 비중
  - 무역 **15101609(품목별 총량)** ✅ 승인 — TradeChart 총 수출입(국가합산보다 정확)
  - 기업 **OpenDART** ✅ 키 검증(status 013=유효) — company.json·재무·corpCode, 키 1개 전 API 커버(활용신청 불필요)
- ✅ **라이선스 = "이용허락범위 제한 없음"**(상업 가능, 양 관세청 데이터셋) — data.go.kr 확인.
- 🟡 API 200 확인만 게이트웨이 전파 후 잔여(0d와 동시 해소).
- 뉴스(워드클라우드, P1): 뉴스빅데이터 메타데이터=fileData 다운로드(활용신청 불필요), BIGKinds 풀텍스트는 저작권 → 후순위.

---

## 3. 판정 및 권고

- **저장소 타당성(핵심 게이트 질문) = 입증.** D1(그래프·정형) + Vectorize(의미검색) 조합이 S6 톨루엔 슬라이스에 충분. 0b/0c가 기준을 큰 폭으로 통과해 **저장소 재선택·범위 축소 불필요**(§5.5 미발동).
- **권고: F014(적재 파이프라인) Plan 진행 가능.** 단 **0d 라이브 + 0a 라이선스 캡처**는 관세청 키 활성화 후 즉시 확인(블로커 아님 — 키 전파 타이밍 이슈).
- **잔여 액션**:
  1. 👤 data.go.kr 마이페이지에서 활용신청 **승인 상태 + 대상 API(15100475)** 확인. 승인 직후면 ~1-2h 후 재시도.
  2. 🤖 키 활성화 시 `pnpm poc:ingest` → 라이브 1라운드 + 0a 라이선스(KOGL 유형) 캡처 → 본 리포트 0d/0a ✅ 갱신.

---

## 4. 산출물

| 산출물 | 경로 |
|--------|------|
| 스키마 | `scripts/poc/schema-poc.sql` |
| 0b 벤치 | `scripts/poc/bench-graph.mjs` |
| 0c 벤치 | `scripts/poc/bench-vectorize.mjs` (mutation 폴링 보정) |
| 0d 적재 | `scripts/ingest/poc-toluene.mjs` (Encoding 키 raw append) |
| 스냅샷 | `scripts/poc/build-snapshot.mjs` → `scripts/poc/out/s6.real.snapshot.json` |
| 평가셋 | `scripts/poc/fixtures/semantic-eval.json` (15건) |
| CF 리소스 | D1 `kita-givc-poc`(74b58bed-…) · Vectorize `kita-givc-poc`(1024d/cosine) |

---

## 5. 비용 추산 (0c) — TODO

`bench-vectorize.mjs estimateCost()`에 CF 공식 단가 기입 후 확정. 현 골격: storedDim=12×1024, queriedDim=쿼리수×1024. 데모 볼륨(코퍼스 수백 chunk·What-If 세션 한정 쿼리) 기준 저비용 예상.
