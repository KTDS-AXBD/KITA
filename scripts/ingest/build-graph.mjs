/** F014 — 실데이터 그래프 빌드: trade_by_country + companies → graph_nodes/edges (≤50, provenance) */
import { run, query, upsert, esc } from './lib/d1.mjs';

const HS = '290230';

export async function buildGraph() {
  const countries = query(`SELECT cnty_cd, cnty_nm, share FROM trade_by_country WHERE hs_code='${HS}';`);
  const companies = query(`SELECT id, name, core_type FROM companies;`);

  const nodes = [
    ['TOL', 'rnd', '톨루엔', 12, '{"HS":"290230","CAS":"108-88-3"}', 'real'],
    [`HS${HS}`, 'hscode', `HS ${HS}`, 8, null, 'real'],
  ];
  const edges = [['TOL', `HS${HS}`]];

  for (const c of countries) {
    const id = `C_${c.cnty_cd}`;
    const pct = Math.round((c.share || 0) * 100);
    nodes.push([id, 'country', c.cnty_nm, +(8 + (c.share || 0) * 12).toFixed(1), `{"비중":"${pct}%"}`, 'real']);
    edges.push(['TOL', id], [`HS${HS}`, id]);
  }
  for (const c of companies) {
    nodes.push([c.id, 'company', c.name, c.core_type === 1 ? 10 : 8, null, 'real']);
    edges.push(['TOL', c.id]);
  }

  if (nodes.length > 50) throw new Error(`그래프 노드 ${nodes.length} > 50 (선별 필요)`);

  // 멱등: 기존 그래프 비우고 재적재
  run('DELETE FROM graph_edges; DELETE FROM graph_nodes;');
  upsert('graph_nodes', ['id', 'type', 'label', 'r', 'meta', 'provenance'],
    nodes.map(([id, t, l, r, meta, p]) =>
      `('${esc(id)}','${t}','${esc(l)}',${r},${meta ? `'${esc(meta)}'` : 'NULL'},'${p}')`));
  // 무방향 → 양방향 2행
  const ev = edges.flatMap(([a, b]) => [`('${esc(a)}','${esc(b)}')`, `('${esc(b)}','${esc(a)}')`]);
  upsert('graph_edges', ['src', 'dst'], ev);

  return { nodes: nodes.length, edges: edges.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildGraph().then((r) => console.log('✓ 그래프 빌드:', JSON.stringify(r)))
    .catch((e) => { console.error('✖ 그래프 빌드 실패:', e.message); process.exit(1); });
}
