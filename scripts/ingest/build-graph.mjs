/** 실데이터 그래프 빌드(기계 다단계 가치사슬): 소재→부품→장비(anchor) + 수입국 + tier별 실기업.
 *  가치사슬 노드/엣지는 SSOT(lib/valuechain.mjs) — ingest-trade의 HS 목록과 단일 진실원.
 *  ≤50 노드, provenance real. 기업→tier 노드 부착(ATTACH)은 dart.mjs TARGETS에서 파생. */
import { run, query, upsert, esc } from './lib/d1.mjs';
import { TARGETS } from './lib/dart.mjs';
import { CHAIN, CHAIN_EDGES, ANCHOR_HS } from './lib/valuechain.mjs';

// 기업 id(=corp_code) → 부착 노드 (TARGETS 단일 진실원에서 파생)
const ATTACH = Object.fromEntries(TARGETS.map((t) => [t.corp_code, t.attach]));

/** HS별 무역수지(기간 합계) → 적자/흑자 + 수치($M). 자립화 라벨 산출용 */
function tradeBalance(hs) {
  const r = query(`SELECT SUM(exports) e, SUM(imports) i FROM trade_stats WHERE hs_code='${esc(hs)}';`)[0] ?? {};
  const expM = Math.round(Number(r.e || 0) / 1e6);
  const impM = Math.round(Number(r.i || 0) / 1e6);
  return { expM, impM, deficit: Number(r.i || 0) > Number(r.e || 0) };
}

export async function buildGraph() {
  const countries = query(`SELECT cnty_cd, cnty_nm, share FROM trade_by_country WHERE hs_code='${ANCHOR_HS}';`);
  const companies = query(`SELECT id, name, core_type, tier, role FROM companies;`);

  const nodes = [];
  const edges = [];

  // 가치사슬 노드 (소재/부품/장비) — HS 무역수지로 자립화 라벨 산출 (전부 real)
  for (const c of CHAIN) {
    const b = tradeBalance(c.hs);
    const bal = `${b.deficit ? '적자 — 자립화 과제' : '흑자'}(수출$${b.expM}M/수입$${b.impM}M)`;
    const meta = `{"tier":"${c.tier}","HS":"${c.hs}","무역수지":"${bal}"}`;
    nodes.push([c.id, 'metric', c.label, c.r, meta, 'real']);
  }
  // 가치사슬 위상 (소재→부품→장비)
  for (const e of CHAIN_EDGES) edges.push(e);

  // 수입국 (앵커 HS 기준 수입 상대국) — MC에 연결
  for (const c of countries) {
    const id = `C_${c.cnty_cd}`;
    const pct = Math.round((c.share || 0) * 100);
    nodes.push([id, 'country', c.cnty_nm, +(14 + (c.share || 0) * 8).toFixed(1), `{"비중":"${pct}%"}`, 'real']);
    edges.push(['MC', id]);
  }

  // tier별 실기업 → 부착 노드(장비 anchor / 부품 / 소재 metric)
  for (const c of companies) {
    const attach = ATTACH[c.id] ?? 'MC';
    nodes.push([c.id, 'company', c.name, c.core_type === 1 ? 20 : 16,
      `{"tier":"${c.tier ?? ''}","role":"${c.role ?? ''}"}`, 'real']);
    edges.push([attach, c.id]);
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
