# KITA 배포 가이드 (F007/F008)

> Cloudflare Workers Static Assets 배포. **배포는 수동(Master)** — 대외 작업.
> 공개 진입점: **`https://kita.minu.best`** (커스텀 도메인, 공개·영구). S3(2026-05-24) 비추측 URL+시연후 만료 모델에서 전환.

## 사전 조건
- **`wrangler.jsonc` 로컬 생성** (gitignore):
  ```bash
  cp wrangler.jsonc.example wrangler.jsonc
  ```
  운영 설정(현재 적용값):
  ```jsonc
  "name": "kita-demo-fa390844",         // Worker 내부 식별자
  "workers_dev": false,                  // workers.dev 라우트 비활성화 → 커스텀 도메인 단일 진입점
  "routes": [
    { "pattern": "kita.minu.best", "custom_domain": true }
  ]
  ```
  → 공개 URL = `https://kita.minu.best`
- Cloudflare 계정 + `wrangler` 인증: `pnpm exec wrangler whoami` (계정 `AX컨설팅팀`)
  - 미인증 시: 세션에서 `! pnpm exec wrangler login`
- **커스텀 도메인 전제**: `minu.best`가 같은 CF 계정의 **active zone**이어야 함 → 배포 시 DNS 레코드+SSL 인증서 자동 생성. (API 토큰은 Workers Routes Edit + Zone DNS Edit 권한 필요.)

## 배포 (수동)
```bash
# 1) 번들 검증 (안전, 사전 실행 권장 — 외부 영향 없음)
pnpm deploy:dryrun        # = pnpm build && wrangler deploy --dry-run

# 2) 실 배포 → 커스텀 도메인·SSL 자동 생성, workers.dev 비활성화
pnpm deploy:cf            # = pnpm build && wrangler deploy  (※ 'deploy'는 pnpm 내장명령과 충돌 → deploy:cf)
#   → https://kita.minu.best  (첫 배포 시 SSL 프로비저닝 1~2분 소요 가능)
```

## 배포 후 스모크 (수동)
```bash
# 커스텀 도메인 200 + SSL 검증 + 에셋 200
curl -sS -o /dev/null -w "HTTP %{http_code} | SSL %{ssl_verify_result}\n" https://kita.minu.best/
bash scripts/healthcheck.sh https://kita.minu.best
```
- `ssl_verify_result 0` = 인증서 정상 발급·체인 검증 통과.
- `docs/qa-checklist.md` 수행 (최소 Chrome 1920 + 오프라인 1회).

## 접근제어 (S3: 공개 모델)
- **공개 (현재)**: `kita.minu.best`는 누구나 접근. 데이터 100% Mock + 영업 멘트 중립화로 노출 위험 낮음. 영업기밀(고객명·전략)은 git 제외 + 프로토타입 중립화로 코드/화면에 없음.
- **비추측 URL+시연후 만료 모델은 폐기** — 커스텀 도메인은 기억 쉽고 영구라 obscurity 통제가 무의미.
- **더 강한 통제가 필요하면 (옵션)**: Zero Trust → Access → Application에 `kita.minu.best` 추가, 이메일 OTP 등 정책. 단 방문자마다 인증 필요 → 즉석 공유는 번거로워짐.

## 롤백
```bash
pnpm exec wrangler deployments list      # 배포 이력
pnpm exec wrangler rollback [<id>]       # 직전(또는 지정) 버전으로
```

## 오프라인 백업 (SaaS 장애 대비)
```bash
pnpm build && pnpm serve:offline         # http://localhost:4173 (완전 정적, 무네트워크)
```
> 시연 노트북에 사전 빌드 + 대기. 네트워크 장애 시 즉시 전환.

## 폐기 (옵션, 수동)
- 공개 영구 운영이므로 상시 만료는 하지 않음. **사이트를 내릴 때만**:
  ```bash
  pnpm exec wrangler delete            # Worker 삭제 (커스텀 도메인 라우트·DNS도 함께 정리)
  ```
- 커스텀 도메인만 분리하려면 CF 대시보드 → Workers → 해당 Worker → Domains & Routes에서 `kita.minu.best` 제거.
