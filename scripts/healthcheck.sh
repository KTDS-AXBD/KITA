#!/usr/bin/env bash
# KITA 배포 URL 가용성 헬스체크 (F008)
# 사용: bash scripts/healthcheck.sh https://kita.<account>.workers.dev
# 시연 D-1에 실행하여 / 200 + 핵심 asset 로드를 확인한다.
set -uo pipefail

URL="${1:-}"
if [ -z "$URL" ]; then
  echo "usage: healthcheck.sh <deploy-url>" >&2
  exit 2
fi
URL="${URL%/}"   # 끝 슬래시 제거

fail=0
check() {
  local target="$1"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$target" 2>/dev/null || echo "000")
  if [ "$code" = "200" ]; then
    echo "✅ $target ($code)"
  else
    echo "❌ $target ($code)"
    fail=1
  fi
}

echo "=== KITA 헬스체크: $URL ==="
check "$URL/"

# index.html에서 첫 js/css asset 경로 추출 → 실재 확인
asset=$(curl -s --max-time 10 "$URL/" 2>/dev/null | grep -oE '/assets/[^"]+\.(js|css)' | head -1)
if [ -n "$asset" ]; then
  check "${URL}${asset}"
else
  echo "⚠️ index.html에서 asset 경로를 찾지 못함 (빈 응답?)"
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "🟢 헬스체크 통과 — 시연 준비 OK"
else
  echo "🔴 헬스체크 실패 — 배포/롤백 점검 필요"
fi
exit $fail
