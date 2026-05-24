# KITA 배포 가이드 (F007/F008)

> Cloudflare Workers Static Assets 배포. **배포·접근제어·만료는 수동(Master)** — 비가역·대외 작업.

## 사전 조건
- Cloudflare 계정 + `wrangler` 인증: `pnpm exec wrangler whoami`
  - 미인증 시: `pnpm exec wrangler login` (브라우저 OAuth) — 세션에서 `! pnpm exec wrangler login`
- `.dev.vars`의 `ACCOUNT_ID` 참고 (계정 식별)

## 배포 (수동)
```bash
# 1) 번들 검증 (안전, 사전 실행 권장)
pnpm deploy:dryrun        # = pnpm build && wrangler deploy --dry-run

# 2) 실 배포 → 공개 URL 발급
pnpm deploy:cf            # = pnpm build && wrangler deploy  (※ 'deploy'는 pnpm 내장명령과 충돌 → deploy:cf)
#   → https://kita.<account>.workers.dev
```

## 배포 후 스모크 (수동)
```bash
bash scripts/healthcheck.sh https://kita.<account>.workers.dev
# / 200 + 핵심 asset 200 확인 → 🟢
```
+ `docs/qa-checklist.md` 수행 (최소 Chrome 1920 + 오프라인 1회).

## 접근제어 (수동, CF 대시보드)
- **비추측 경로** (기본): Worker 이름/route를 추측 어렵게. Mock 단계 충분.
- **Cloudflare Access** (옵션): Zero Trust → Access → Application 추가, 이메일 OTP 등 정책.
- 시연 대상에게만 비공개 공유.

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

## 시연 후 만료 (필수, 수동)
- CF Access 정책 off 또는 Worker 삭제: `pnpm exec wrangler delete`
- 공개 URL이 무기한 노출되지 않도록 시연 종료 후 즉시 처리 (PRD §6.4).
