# KOAMI 배포 가이드 (F007/F008)

> Cloudflare Workers Static Assets 배포. **배포는 수동(Master)** — 대외 작업.
> 공개 진입점: **`https://koami.minu.best`** (커스텀 도메인, 공개·영구). S3(2026-05-24) 비추측 URL+시연후 만료 모델에서 전환.

## 사전 조건
- **`wrangler.jsonc` 로컬 생성** (gitignore):
  ```bash
  cp wrangler.jsonc.example wrangler.jsonc
  ```
  운영 설정(현재 적용값):
  ```jsonc
  "name": "koami-demo-fa390844",         // Worker 내부 식별자
  "workers_dev": false,                  // workers.dev 라우트 비활성화 → 커스텀 도메인 단일 진입점
  "routes": [
    { "pattern": "koami.minu.best", "custom_domain": true }
  ]
  ```
  → 공개 URL = `https://koami.minu.best`
- **F016 — koami-givc D1 바인딩** (읽기전용 조회 `/api/givc/*`): `wrangler.jsonc`에 바인딩명 **`DB`** 필수(Worker 코드 `c.env.DB` 참조 — `koami_givc_poc` 등 다른 이름이면 500).
  ```jsonc
  "d1_databases": [
    { "binding": "DB", "database_name": "koami-givc-poc",
      "database_id": "74b58bed-dee6-4f95-b338-11e304f08fad" }
  ]
  ```
  - 엔드포인트: `GET /api/givc/graph?root=TOL&depth=2` · `/api/givc/trade?hs=290230` · `/api/givc/search?q=<term>` (SELECT-only, rate-limit 미적용).
  - **로컬 스모크**: `koami.minu.best`가 CF Access 뒤라 `wrangler dev --remote`는 차단(service token 필요) → 로컬은 `"remote": true` 바인딩 + `wrangler dev`(원격 D1 조회) 또는 `db:migrate:local`+`fixture-local.sql`+`build-graph --local`+`ingest-fts --local` 후 `wrangler dev`.
  - 원격 데이터 적재/검증: `pnpm db:migrate`(0001+0002) → `pnpm ingest:all` → `node scripts/ingest/smoke-queries.mjs`.
- Cloudflare 계정 + `wrangler` 인증: `pnpm exec wrangler whoami` (계정 `AX컨설팅팀`)
  - 미인증 시: 세션에서 `! pnpm exec wrangler login`
- **커스텀 도메인 전제**: `minu.best`가 같은 CF 계정의 **active zone**이어야 함 → 배포 시 DNS 레코드+SSL 인증서 자동 생성. (API 토큰은 Workers Routes Edit + Zone DNS Edit 권한 필요.)

## 배포 (수동)
```bash
# 1) 번들 검증 (안전, 사전 실행 권장 — 외부 영향 없음)
pnpm deploy:dryrun        # = pnpm build && wrangler deploy --dry-run

# 2) 실 배포 → 커스텀 도메인·SSL 자동 생성, workers.dev 비활성화
pnpm deploy:cf            # = pnpm build && wrangler deploy  (※ 'deploy'는 pnpm 내장명령과 충돌 → deploy:cf)
#   → https://koami.minu.best  (첫 배포 시 SSL 프로비저닝 1~2분 소요 가능)
```

## 배포 후 스모크 (수동)
```bash
# 커스텀 도메인 200 + SSL 검증 + 에셋 200
curl -sS -o /dev/null -w "HTTP %{http_code} | SSL %{ssl_verify_result}\n" https://koami.minu.best/
bash scripts/healthcheck.sh https://koami.minu.best
```
- `ssl_verify_result 0` = 인증서 정상 발급·체인 검증 통과.
- `docs/qa-checklist.md` 수행 (최소 Chrome 1920 + 오프라인 1회).

## 접근제어 (CF Access 게이팅 — 2026-05-25 적용)
- **현재 상태**: `koami.minu.best`는 **CF Access로 보호**됨. 허용 이메일(`sinclairseo@gmail.com`·`ktds.axbd@gmail.com`)만 OTP 또는 Google 인증 후 접근. 비인증 요청은 302 → `axconsulting.cloudflareaccess.com` 로그인.
- **앱**: Zero Trust → Access → Applications → **`KOAMI Demo`** (self-hosted, domain `koami.minu.best`, path 전체, session 24h). 정책 **`Allowed viewers`** (Allow + Emails).
- **`/api/chat`도 자동 보호** — 같은 호스트라 인증 쿠키 `CF_Authorization`가 same-origin fetch에 실려 What-If LLM은 정상 동작하면서 무단 호출은 차단.
- **접근모델 이력**: 비추측 URL+시연후 만료(폐기) → 공개 커스텀 도메인 → **CF Access 게이팅(현재)**.

### 관리
- **이메일 추가/삭제**: Zero Trust 대시보드 → Access → Applications → `KOAMI Demo` → 정책 Edit. 새 고객 참석자 이메일은 시연 전 추가.
- **해제(다시 공개)**: 대시보드에서 `KOAMI Demo` 앱 삭제 → 즉시 공개 복귀.

### (참조) 대시보드로 재생성하려면 — 지정 이메일 + One-time PIN

> 위 앱은 Access API로 생성됨(self-hosted, allowed_idps 비움=OTP+Google). 아래는 대시보드 수동 재생성 절차.

**0. Zero Trust 최초 활성화 (1회성)**: dash.cloudflare.com → 계정 `AX컨설팅팀` → 좌측 **Zero Trust** (또는 one.dash.cloudflare.com) → 팀 이름 입력(예 `ktds-axbd` → `ktds-axbd.cloudflareaccess.com`) → **Zero Trust Free**(50명, $0, 카드 등록 요구 가능) 확인.

**1. Access 앱 추가**: Zero Trust → **Access → Applications** → **Add an application** → **Self-hosted**.
- Application name: `KOAMI Demo` / Session Duration: `24h` (시연 주기에 맞춰)
- **Public hostname**: subdomain `koami` + domain `minu.best`, **path 비움**(전체 보호, `/api/chat` 포함)
- Identity providers: `Accept all available identity providers`(One-time PIN 기본 포함) 또는 One-time PIN 선택 → Next

**2. 정책**: Add a policy → name `Allowed viewers`, **Action: Allow** → Include → Selector **Emails** → 허용 이메일 추가(시작: `sinclairseo@gmail.com`, `ktds.axbd@gmail.com` + 고객 참석자) → Next → 기본값 → **Save**.

**3. 검증**: 시크릿 창 https://koami.minu.best → Access 로그인 → 이메일 입력 → 수신 PIN 입력 → 허용 목록이면 진입.

**4. 수정/해제**: Access → Applications → `KOAMI Demo` → Edit(이메일 추가·삭제). 해제는 application 삭제 → 즉시 공개 복귀.

> ⚠️ 인증/인가 분업: One-time PIN=인증(이메일 소유 확인), Emails 정책=인가(허용 목록). PIN만 켜고 정책을 anyone으로 두면 통제 안 됨. `/api/chat`은 `CF_Authorization` 쿠키가 same-origin fetch에 자동 첨부돼 그대로 동작.

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
- 커스텀 도메인만 분리하려면 CF 대시보드 → Workers → 해당 Worker → Domains & Routes에서 `koami.minu.best` 제거.
