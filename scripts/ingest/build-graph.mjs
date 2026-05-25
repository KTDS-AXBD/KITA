/** F023 — 실데이터 그래프 빌드(기계 다단계 가치사슬): 소재→부품→장비(anchor) + 수입국 + tier별 실기업.
 *  ≤50 노드, provenance real. 기업→tier 노드 부착(ATTACH)은 dart.mjs TARGETS에서 파생(단일 진실원). */
import { run, query, upsert, esc } from './lib/d1.mjs';
import { TARGETS } from './lib/dart.mjs';

const ANCHOR_HS = '845710';
const ANCHOR = { id: 'MC', label: '머시닝센터', hs: ANCHOR_HS, ksic: 'C2922' };

// tier 중간 노드(metric) — 핵심 부품·소재. HS 무역수지로 자립화 라벨 산출.
const TIER_NODES = [
  { id: 'PART_BEARING', label: '정밀 베어링', tier: '부품', hs: '848210' },
  { id: 'PART_REDUCER', label: '정밀 감속기', tier: '부품', hs: '848340' },
  { id: 'MAT_STEEL',    label: '특수강',      tier: '소재', hs: '722840' },
];
// 가치사슬 위상: 소재→부품, 부품→장비(anchor)
const TIER_EDGES = [
  ['MAT_STEEL', 'PART_BEARING'], ['MAT_STEEL', 'PART_REDUCER'],
  ['PART_BEARING', 'MC'], ['PART_REDUCER', 'MC'],
];
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

  const ab = tradeBalance(ANCHOR_HS);
  const nodes = [
    ['MC', 'rnd', ANCHOR.label, 32,
      `{"HS":"${ANCHOR.hs}","KSIC":"${ANCHOR.ksic}","tier":"장비","무역수지":"${ab.deficit ? '적자' : '흑자'}(수출$${ab.expM}M/수입$${ab.impM}M)"}`, 'real'],
    [`HS${ANCHOR_HS}`, 'hscode', `HS ${ANCHOR_HS}`, 20, `{"desc":"머시닝센터 HS코드","tier":"장비"}`, 'real'],
  ];
  const edges = [['MC', `HS${ANCHOR_HS}`]];

  // 수입국 (앵커 HS 기준 수입 상대국)
  for (const c of countries) {
    const id = `C_${c.cnty_cd}`;
    const pct = Math.round((c.share || 0) * 100);
    nodes.push([id, 'country', c.cnty_nm, +(14 + (c.share || 0) * 8).toFixed(1), `{"비중":"${pct}%"}`, 'real']);
    edges.push(['MC', id]);
  }

  // tier 중간 노드 — HS 무역수지로 자립화 라벨
  for (const t of TIER_NODES) {
    const b = tradeBalance(t.hs);
    const bal = `${b.deficit ? '적자 — 자립화 과제' : '흑자'}(수출$${b.expM}M/수입$${b.impM}M)`;
    nodes.push([t.id, 'metric', t.label, 18, `{"tier":"${t.tier}","HS":"${t.hs}","무역수지":"${bal}"}`, 'real']);
  }
  for (const e of TIER_EDGES) edges.push(e);

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
