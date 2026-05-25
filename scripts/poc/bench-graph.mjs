#!/usr/bin/env node
/**
 * F013 0b — D1 그래프 깊이2 탐색 벤치 (Design §3.2/§3.3)
 * 통과 = 중앙값 ≤ 50ms.
 *
 * 측정: wrangler d1 execute --json 의 meta.duration(서버 쿼리 시간, 프로세스 스폰 제외).
 * 워밍업 3회 → 측정 20회 → 중앙값/p95.
 *
 * 사전: scripts/poc/schema-poc.sql 적용 + 톨루엔 노드/엣지 적재(poc-toluene.mjs --graph-only).
 * 실행: node scripts/poc/bench-graph.mjs [--local] [--seed TOL] [--runs 20]
 */
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const DB = 'kita-givc-poc';
const SEED = valOf('--seed') ?? 'TOL';
const RUNS = Number(valOf('--runs') ?? 20);
const WARMUP = 3;
const LOC = args.includes('--local') ? '--local' : '--remote';
const THRESHOLD_MS = 50;

const SQL = `
WITH RECURSIVE reach(id, depth) AS (
  SELECT '${SEED}', 0
  UNION
  SELECT CASE WHEN e.src = r.id THEN e.dst ELSE e.src END, r.depth + 1
  FROM reach r JOIN graph_edges e ON (e.src = r.id OR e.dst = r.id)
  WHERE r.depth < 2
)
SELECT DISTINCT n.id, n.type, n.label FROM reach JOIN graph_nodes n ON n.id = reach.id;`;

function valOf(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

function runOnce() {
  // --json → [{ results, meta: { duration, rows_read, ... } }]
  const out = execFileSync(
    'npx',
    ['wrangler', 'd1', 'execute', DB, LOC, '--json', '--command', SQL],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const parsed = JSON.parse(out);
  const meta = Array.isArray(parsed) ? parsed[0]?.meta : parsed?.meta;
  const dur = meta?.duration;
  if (typeof dur !== 'number') throw new Error('meta.duration 미반환 — wrangler 버전/출력 형식 확인');
  return dur;
}

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
const pctile = (xs, p) => [...xs].sort((a, b) => a - b)[Math.ceil((p / 100) * xs.length) - 1];

console.log(`▶ 0b 그래프 벤치 — DB=${DB} ${LOC} seed=${SEED} warmup=${WARMUP} runs=${RUNS}`);
try {
  for (let i = 0; i < WARMUP; i++) runOnce();
  const samples = [];
  for (let i = 0; i < RUNS; i++) samples.push(runOnce());

  const med = median(samples);
  const p95 = pctile(samples, 95);
  const pass = med <= THRESHOLD_MS;
  console.log(`\n  중앙값 ${med.toFixed(2)}ms · p95 ${p95.toFixed(2)}ms · min ${Math.min(...samples).toFixed(2)} max ${Math.max(...samples).toFixed(2)}`);
  console.log(`  판정: ${pass ? '✅ PASS' : '❌ FAIL'} (기준 ≤${THRESHOLD_MS}ms)`);
  if (!pass) {
    console.log('  → 대안(Design §3.3): node_reach 사전계산 테이블 / 대안 그래프 DB');
    process.exit(1);
  }
} catch (e) {
  console.error('✖ 벤치 실패:', e.message);
  console.error('  사전: schema-poc.sql 적용 + 그래프 적재 + CF 리소스/인증 확인');
  process.exit(2);
}
