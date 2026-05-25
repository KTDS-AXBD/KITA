/** F014 — D1 공통 헬퍼 (wrangler d1 execFileSync 래퍼 + 검증). shell 미사용(injection 안전) */
import { execFileSync } from 'node:child_process';

export const DB = process.env.KITA_GIVC_DB ?? 'kita-givc-poc';
export const LOC = process.argv.includes('--local') ? '--local' : '--remote';
export const esc = (s) => String(s).replace(/'/g, "''");

/** SQL 실행 (반환 무시). wrangler를 execFile로 호출 — 셸 경유 없음 */
export function run(sql) {
  execFileSync('npx', ['wrangler', 'd1', 'execute', DB, LOC, '--command', sql],
    { stdio: ['ignore', 'pipe', 'inherit'] });
}

/** SQL 조회 → results[] */
export function query(sql) {
  const out = execFileSync('npx', ['wrangler', 'd1', 'execute', DB, LOC, '--json', '--command', sql],
    { encoding: 'utf8' });
  const p = JSON.parse(out);
  return (Array.isArray(p) ? p[0] : p)?.results ?? [];
}

/** 적재 검증 (FR-08) — 0행/필수 NULL/provenance 위반 시 throw → 호출부 abort */
export function validate(rows, required, label) {
  if (!rows?.length) throw new Error(`검증 실패[${label}]: 0행`);
  for (const r of rows) {
    for (const k of required) {
      if (r[k] == null || r[k] === '') throw new Error(`검증 실패[${label}]: 필수컬럼 ${k} NULL`);
    }
    if (r.provenance && !['real', 'est', 'virt'].includes(r.provenance)) {
      throw new Error(`검증 실패[${label}]: provenance 값 ${r.provenance}`);
    }
  }
  return true;
}

/** INSERT OR REPLACE 배치 (소량 가정) */
export function upsert(table, cols, valueRows) {
  if (!valueRows.length) return;
  run(`INSERT OR REPLACE INTO ${table}(${cols.join(',')}) VALUES ${valueRows.join(',')};`);
}
