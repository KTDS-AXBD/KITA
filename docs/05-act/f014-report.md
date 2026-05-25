# F014 — kita-givc 적재 파이프라인 완료 리포트

> **완료일**: 2026-05-25 · **Plan**: [f014](../01-plan/features/f014-ingest-pipeline.plan.md) · **Design**: [f014](../02-design/features/f014-ingest-pipeline.design.md) · **데이터 명세**: [manifest](../02-design/features/kita-givc-data-sources.md)
> **결과**: ✅ **완료** — 관세청 무역 + DART 기업 실데이터 적재 파이프라인 1명령 재현. provenance 전부 real, 검증 PASS.

## 1. Executive Summary

| 관점 | 결과 |
|------|------|
| **Problem** | F013은 무역 슬라이스만. 기업·그래프·의미검색까지 재현 파이프라인 필요. |
| **Solution** | `scripts/ingest/`(lib+5스크립트) — 관세청(무역)+DART(기업)+그래프+Vectorize를 `pnpm ingest:all` 1명령. |
| **Value Delivered** | S6 전 데이터 ⭐real 적재 — 무역 4분기·국가 3·기업 6사(실매출)·그래프 11노드·벡터 11docs. |

## 2. 적재 결과 (실측)

| 도메인 | 결과 | 소스 |
|--------|------|------|
| trade_stats | 4분기(2024Q1~Q4) | 관세청 15101609 |
| trade_by_country | 3국 — 일본 82%·중국 18%·미국 0.1% | 관세청 15100475 |
| companies | 6사 — 롯데케미칼 20.4조·한화토탈 11.8조·금호석화 7.2조·여천NCC 6.4조·대한유화/효성화학 2.8조 | DART |
| graph_nodes/edges | 11노드(TOL·HS·국가3·기업6) / 26행(무방향 13×2) | 조합 |
| vectorize | 11 docs 임베딩·upsert(bge-m3) | CF Workers AI |
| provenance | **real=24 (누락 0)** | NOT NULL 강제 |
| 스냅샷 | `s6.real.snapshot.json`(graph·tradeSeries·companies shape) | 옵션A |

## 3. DoD 달성

- [x] D1 정식 스키마 migration(5테이블) 적용 — `migrations/0001_kita_givc.sql`
- [x] 관세청 무역(총량+국가별) 적재 + 검증
- [x] DART 기업 6사 개황+매출 적재(corp_code 실해소) + 그래프 company 노드
- [x] 그래프 실데이터 빌드(11≤50, provenance 100%) + Vectorize 코퍼스
- [x] 스냅샷 생성(companies 포함)
- [x] `pnpm ingest:all` 1명령 재현 + 검증 PASS + 도메인별 통계 리포트

## 4. 구현 산출물

```
migrations/0001_kita_givc.sql               # 정식 스키마(5테이블)
scripts/ingest/lib/{d1,datagokr,dart}.mjs   # 공통 헬퍼(검증·관세청·DART)
scripts/ingest/ingest-trade.mjs             # 15101609+15100475
scripts/ingest/ingest-companies.mjs         # DART 6사
scripts/ingest/build-graph.mjs              # 실데이터 노드·엣지
scripts/ingest/ingest-vectorize.mjs         # 코퍼스 임베딩
scripts/ingest/ingest-all.mjs               # 오케스트레이션+리포트
scripts/ingest/build-snapshot.mjs           # D1→스냅샷(옵션A)
package.json: db:migrate, ingest:{trade,companies,graph,vec,all,snapshot}
```

## 5. 한계·후속 (F015/F016)

- **share = △est**(전사 매출 proxy, 톨루엔 시장점유 아님) — 화면 DataMark로 △ 표기 필요(F015).
- companies 행 provenance=real(개황·매출 DART), share·core_type·role은 △est 의미 — 필드별 표기는 F015 어댑터/화면.
- Vectorize 인덱스에 F013 PoC 코퍼스 잔존(stale id 일부) — 필요시 인덱스 재생성.
- 뉴스 워드클라우드(P1) 미적재 — 메타데이터 소스 확정 후.
- **F015**: Repository 실구현체(SnapshotTolueneRepository) + 어댑터(스키마차 흡수) + 화면 연결(무변경 검증) + 회귀(F016).

---

*F014 ✅ (2026-05-25). 다음 = F015 Repository 실구현체·어댑터.*
