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
| 구동 완전 실패 | 5분 요약 **백업 영상** 재생 |

## 3. 장애 대응 빠른 표

| 증상 | 원인 | 대응 |
|------|------|------|
| 배포 URL 404/5xx | Worker 다운/미배포 | `pnpm deploy:cf` 재배포 또는 `wrangler rollback` |
| What-If 토글 무응답/오류 | AI 호출 실패·429 | 정적 응답 자동 대체됨 — 토글 OFF로 진행 (시범 기능 안내) |
| 화면 깨짐 | 캐시/브라우저 | 강력 새로고침(Ctrl+Shift+R) 또는 오프라인 백업 |
| 느린 첫 로딩 | cold start | 시연 전 미리 1회 접속해 warm-up |

## 4. 백업 영상 녹화 가이드 (서민원 수동, 시연 전)

- **도구**: OBS / macOS 화면기록 / Windows 게임바 등.
- **내용**: `demo-script.md` 핵심 흐름 5분 요약 (Landing→S4 가중치·Hint→S6 그래프→About). **What-If는 정적 응답 기준으로 촬영**(실 LLM 비결정성 회피).
- **포맷**: MP4 1080p. 시연 노트북 로컬 저장 + 클라우드 백업.

## 5. 시연 후 (필수)

1. **공개 URL 만료**: `pnpm exec wrangler delete` (또는 CF Access off). 무기한 노출 방지(PRD §6.4).
2. 회고 양식 작성(`demo-script.md` 회고 메모) + 영업 24h 디브리프.

## 6. FAQ

- **Q. 데이터가 진짜인가요?** → "⭐실데이터(GIVC) 58%, △추정, ※가상을 표기로 구분합니다. 가상은 본 사업화 시 귀측 데이터로 대체됩니다."
- **Q. LLM이 실제로 도나요?** → "What-If 토글 ON 시 CF Workers AI 실 호출(시범, 세션 3회). 기본은 정적 응답."
- **Q. 모바일 되나요?** → "데스크톱 시연 전용입니다(1920/1366 최적)."

## 7. 핵심 명령어 요약

```bash
bash scripts/healthcheck.sh <URL>   # 가용성 점검
pnpm deploy:cf                      # 배포 (※ pnpm deploy 아님)
pnpm serve:offline                  # 오프라인 백업 (localhost:4173)
pnpm exec wrangler rollback         # 롤백
pnpm exec wrangler delete           # 시연 후 만료
```
