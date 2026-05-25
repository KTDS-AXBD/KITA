/** F016 — entity_fts 채움: companies(name·biz·role) + graph_nodes(label) → FTS5 코퍼스.
 *  graph·companies 적재 후 실행(ingest-all 끝단). 멱등: DELETE 후 재삽입. */
import { run, query, esc } from './lib/d1.mjs';

export async function ingestFts() {
  const companies = query('SELECT id, name, biz, role FROM companies;');
  const nodes = query('SELECT id, label FROM graph_nodes;');

  const rows = [];
  for (const c of companies) {
    const text = [c.name, c.biz, c.role].filter(Boolean).join(' ');
    rows.push(`('${esc(c.id)}','company','${esc(text)}')`);
  }
  for (const n of nodes) {
    rows.push(`('${esc(n.id)}','node','${esc(n.label)}')`);
  }

  run('DELETE FROM entity_fts;');
  if (rows.length) run(`INSERT INTO entity_fts(entity_id, kind, text) VALUES ${rows.join(',')};`);

  return { company: companies.length, node: nodes.length, total: rows.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestFts().then((r) => console.log('✓ FTS 채움:', JSON.stringify(r)))
    .catch((e) => { console.error('✖ FTS 채움 실패:', e.message); process.exit(1); });
}
