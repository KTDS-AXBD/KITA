# F013 M0 PoC 게이트 — 실행 가이드

> kita-givc 착수 게이트. **4개(0a~0d) 전부 PASS 시에만 F014 진행.** 미달 시 저장소 재선택/범위 축소.
> 설계: [`docs/02-design/features/f013-m0-poc-gate.design.md`](../../docs/02-design/features/f013-m0-poc-gate.design.md)

## 👤 Master 선행 작업 (프로비저닝 — 실행 블로커)

```bash
# 1) 공개데이터 API key 발급 → .dev.vars (gitignore, chmod 600, 커밋 금지)
#    - 관세청 무역통계: data.go.kr 로그인 → "관세청_품목별 국가별 수출입실적"(데이터 ID 15100475) 활용신청 → serviceKey
#    - OpenDART(기업): opendart.fss.or.kr → 인증키 신청
echo 'DATA_GO_KR_KEY=...' >> .dev.vars
echo 'OPENDART_KEY=...'   >> .dev.vars

# 2) CF 리소스 생성 (저비용·가역)
wrangler d1 create kita-givc-poc
wrangler vectorize create kita-givc-poc --dimensions=1024 --metric=cosine

# 3) env (bench-vectorize용 — REST 호출): CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN
#    토큰 권한: Workers AI Run + Vectorize Edit
```

## 🤖 PoC 실행 순서

```bash
# 스키마 적용
wrangler d1 execute kita-givc-poc --file scripts/poc/schema-poc.sql --remote

# 0d-seed → 0b: 그래프 시드 후 깊이2 ≤50ms 벤치
node scripts/ingest/poc-toluene.mjs --graph-only
node scripts/poc/bench-graph.mjs                       # PASS = 중앙값 ≤50ms

# 0c: 의미검색 ≥80% + 비용 추산
node scripts/poc/bench-vectorize.mjs                   # PASS = 정확도 ≥80%

# 0d-full: 관세청 추출 → 정규화 → 검증/롤백 → 적재 → 조회
node scripts/ingest/poc-toluene.mjs                    # PASS = 1라운드 재현 + 검증

# 옵션A 검증: D1 → 정적 스냅샷 (동기 인터페이스 보존)
node scripts/poc/build-snapshot.mjs                    # → scripts/poc/out/s6.real.snapshot.json
```

## 게이트 판정

| 항목 | PASS | 산출 |
|------|------|------|
| 0a 소스·라이선스 | 상업이용 확인 + API 200 | 라이선스 캡처 |
| 0b 그래프 | 깊이2 중앙값 ≤50ms | bench-graph |
| 0c 의미검색 | top-k 정확도 ≥80% | bench-vectorize |
| 0d 적재 | 1라운드 재현 + 검증 | poc-toluene |

→ 종합 판정 리포트: `docs/05-act/f013-m0-gate-report.md` (PASS→F014 / 0b·0c FAIL→범위축소)

## ⚠️ TODO (실행 시 보강)

- `poc-toluene.mjs` `normalizeTrade()` — 관세청 실제 응답 필드 → 분기 매핑 확정(API 응답 shape 확인 후).
- `bench-vectorize.mjs` `estimateCost()` — CF 공식 단가표 기입.
- `fixtures/semantic-eval.json` — 도메인 지식 기반 질의·정답 검수/보강(현 시드 15건).
