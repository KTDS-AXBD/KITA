# KOAMI PoC 운영 매뉴얼 (F011)

> 발표자 외 인수·장애 대응용 1페이지 런북. 상세 배포는 `deploy-guide.md`, QA는 `qa-checklist.md`.

## 1. 시연 실행 순서 (D-day)

1. **사전 (D-1)**: `bash scripts/healthcheck.sh <배포URL>` → 🟢 확인. 리허설 2회.
2. **온라인 시연**: 배포 URL 접속 (비공개 공유 경로). 캐시/탭 초기화 cold load.
3. **오프라인 백업 대기** (필수): 별도 터미널에 `pnpm build && pnpm serve:offline` → `http://localhost:4173` 대기.
4. 시연 진행: `demo-script.md` 흐름.

## 2. 온/오프라인 전환

| 상황 | 조치 |
|------|------|
| 정상 | 배포 URL(온라인) |
| 네트워크/SaaS 장애 | **즉시 localhost:4173로 전환** (사전 실행해 둔 백업). What-If 토글은 OFF(오프라인은 실 LLM 불가, 정적 응답 자동 대체) |
| 구동 완전 실패 | 오프라인 localhost 백업 + 발표자 요약 진행(데모 스크립트 §⑥ 비교 검증 핵심 메시지 구두). |

## 3. 장애 대응 빠른 표

| 증상 | 원인 | 대응 |
|------|------|------|
| 배포 URL 404/5xx | Worker 다운/미배포 | `pnpm deploy:cf` 재배포 또는 `wrangler rollback` |
| What-If 토글 무응답/오류 | AI 호출 실패·429 | 정적 응답 자동 대체됨 - 토글 OFF로 진행 (시범 기능 안내) |
| 화면 깨짐 | 캐시/브라우저 | 강력 새로고침(Ctrl+Shift+R) 또는 오프라인 백업 |
| 느린 첫 로딩 | cold start | 시연 전 미리 1회 접속해 warm-up |

## 4. 시연 후

1. **공개 URL 만료 = 폐기 항목**(S3 결정): `koami.minu.best`는 CF Access 보호 + 영구 운영. `wrangler delete`로 만료 안 함. 사이트를 내릴 때만 사용. (이전 가이드는 비공개 비추측 URL 시절 절차였고, 커스텀 도메인 + CF Access 전환 후 폐기.)
2. CF Access 이메일 회수가 필요하면 정책 PUT으로 제거 (상세 `docs/deploy-guide.md`).
3. 회고 양식 작성(`demo-script.md` 회고 메모) + 영업 24h 디브리프.

## 5. FAQ

- **Q. 데이터가 진짜인가요?** → "**실 19개(70%) / 추정 4 / 유료 4 = 총 27개 데이터 소스**를 ⭐실/△추정/※유료로 표기 구분합니다(F031 데이터 현황 페이지). 유료는 본 사업화 단계에서 도입 검토 중. 실데이터는 GIVC + 공개 API(관세청·DART), 추정은 합리적 추론, 유료는 S&P·Bloomberg 등."
- **Q. LLM이 실제로 도나요?** → "v0.1 `/v1/scenario/rnd` What-If 토글 ON 시 CF Workers AI 실 호출(시범, KV 세션 3회). 기본은 정적 응답. v0.2 시나리오 분석은 시연용 결정적 스크립트(재현성 보장)."
- **Q. 모바일 되나요?** → "데스크톱 시연 전용입니다(1920/1366 최적). 단 v0.2는 반응형 그리드(F042~F045) 적용 - 700px 태블릿/400px 모바일에서도 자동 wrap 동작(시연 흐름엔 영향 없음)."

## 6. 핵심 명령어 요약

```bash
bash scripts/healthcheck.sh <URL>   # 가용성 점검
pnpm deploy:cf                      # 배포 (※ pnpm deploy 아님)
pnpm serve:offline                  # 오프라인 백업 (localhost:4173, 점유 시 4174/4175 fallback)
pnpm exec wrangler rollback         # 롤백
pnpm exec wrangler versions list    # 활성 버전 + 100% 비율 확인
# pnpm exec wrangler delete         # ⚠️ 사이트 영구 폐지 시만. 시연 후 자동 만료 아님(S3 결정).
```
