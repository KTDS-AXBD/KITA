/**
 * F015/F021 — 스냅샷 → 도메인 타입 어댑터 (옵션A 동기).
 * 적재 스냅샷(s6.real.snapshot.json)을 화면 도메인 타입으로 흡수.
 * gap(뉴스·힌트)은 Mock fallback(※virt), 그래프 좌표는 결정적 산출(stale layout 미사용).
 * ⚠️ F021: real 경로 스냅샷은 아직 톨루엔 데이터 — 기계 실데이터 재적재는 F023.
 */
import type {
  S6Focus,
  S6Company,
  ValueChainTier,
  TradeSeries,
  TradeAnomaly,
  WordCloudCollection,
  S6HintCard,
  KnowledgeGraph,
  PositionedGraph,
  PositionedNode,
  GraphNode,
  GraphEdge,
  NodeType,
  Provenance,
} from '@/types';
import snapshotJson from '@/data/snapshot/s6.real.snapshot.json';
import { S6_WORDCLOUD, HINTS_S6 } from '@/data/mock';

interface SnapshotShape {
  graph: {
    nodes: { id: string; type: string; label: string; r: number; meta?: Record<string, string>; source: string }[];
    edges: [string, string][];
    viewBox: string;
  };
  tradeSeries: { quarters: string[]; exports: number[]; imports: number[]; source: string };
  companies: { id: string; name: string; biz?: string; sales?: string; share?: string; coreType: number; role?: string; tier?: string; source: string }[];
}

const snap = snapshotJson as unknown as SnapshotShape;

/** anchor 기준정보 — 공개 표준(HS/KSIC), ⭐real. F023에서 기계 스냅샷으로 교체 예정. */
export const REAL_PRODUCT: S6Focus = {
  name: '톨루엔 (Toluene)',
  hsCode: 'HS 290230',
  ksic: 'KSIC C20111',
  category: '방향족 탄화수소 / BTX (F023에서 기계 품목으로 교체)',
  description: '실데이터: 관세청 무역통계 + DART 기업. ⚠️ 기계 가치사슬 재적재는 F023 대상.',
};

/** 무역 시계열 + 이상치 산출(직전 분기 대비 ±10%↑ → △est) */
export function adaptTradeSeries(): TradeSeries {
  const t = snap.tradeSeries;
  const anomalies: TradeAnomaly[] = [];
  for (let i = 1; i < t.imports.length; i++) {
    const prev = t.imports.at(i - 1) ?? 0;
    const cur = t.imports.at(i) ?? 0;
    if (prev > 0) {
      const d = (cur - prev) / prev;
      if (Math.abs(d) >= 0.1) {
        anomalies.push({ idx: i, label: `${t.quarters.at(i)} 수입 ${d > 0 ? '+' : ''}${(d * 100).toFixed(0)}%`, source: 'est' });
      }
    }
  }
  return { quarters: t.quarters, exports: t.exports, imports: t.imports, anomalies, source: 'real' };
}

function toTier(raw?: string): ValueChainTier {
  if (raw === '소재' || raw === '부품' || raw === '장비') return raw;
  return '부품'; // 스냅샷 미제공 시 기본(F023에서 tier 적재 시 정합)
}

export function adaptCompanies(): S6Company[] {
  return snap.companies.map((c) => ({
    id: c.id,
    name: c.name,
    biz: c.biz ?? '',
    share: c.share ?? '—',
    sales: c.sales ?? '—',
    coreType: (c.coreType === 1 ? 1 : 2),
    role: c.role ?? '',
    tier: toTier(c.tier),
    source: (c.source as Provenance) ?? 'real',
  }));
}

export function adaptGraph(): KnowledgeGraph {
  const nodes: GraphNode[] = snap.graph.nodes.map((n) => ({
    id: n.id,
    type: n.type as NodeType,
    label: n.label,
    r: n.r,
    meta: n.meta,
    source: n.source as Provenance,
  }));
  const edges: GraphEdge[] = snap.graph.edges.map((e) => [e[0], e[1]] as GraphEdge);
  return { nodes, edges, viewBox: snap.graph.viewBox };
}

/** 결정적 방사형 레이아웃 — anchor(type 'rnd') 중앙, 국가 좌호·기업 우호·부품/소재 상단 (stale layout 미사용) */
export function layoutGraph(graph: KnowledgeGraph): PositionedGraph {
  const vb = graph.viewBox.split(/\s+/).map(Number);
  const cx = (vb[0] ?? 0) + (vb[2] ?? 800) / 2;
  const cy = (vb[1] ?? 0) + (vb[3] ?? 500) / 2;
  const anchor = graph.nodes.find((n) => n.type === 'rnd');
  const anchorId = anchor?.id ?? '';
  const groups: { country: GraphNode[]; company: GraphNode[]; other: GraphNode[] } = { country: [], company: [], other: [] };
  for (const n of graph.nodes) {
    if (n.id === anchorId) continue;
    if (n.type === 'country') groups.country.push(n);
    else if (n.type === 'company') groups.company.push(n);
    else groups.other.push(n);
  }
  const pos = new Map<string, { x: number; y: number }>([[anchorId, { x: cx, y: cy }]]);
  const arc = (arr: GraphNode[], a0: number, a1: number, radius: number) => {
    arr.forEach((n, i) => {
      const t = arr.length <= 1 ? 0.5 : i / (arr.length - 1);
      const ang = a0 + (a1 - a0) * t;
      pos.set(n.id, { x: cx + radius * Math.cos(ang), y: cy + radius * Math.sin(ang) });
    });
  };
  arc(groups.country, Math.PI * 0.72, Math.PI * 1.28, 180); // 좌측 호 (수입국)
  arc(groups.company, -Math.PI * 0.42, Math.PI * 0.42, 215); // 우측 호 (기업)
  arc(groups.other, -Math.PI * 0.68, -Math.PI * 0.32, 150); // 상단 (부품·소재 tier)
  const nodes: PositionedNode[] = graph.nodes.map((n) => {
    const p = pos.get(n.id) ?? { x: cx, y: cy };
    return { ...n, x: Math.round(p.x), y: Math.round(p.y) };
  });
  return { nodes, edges: graph.edges, viewBox: graph.viewBox };
}

/** gap fallback — 뉴스 워드클라우드·시연 힌트는 실데이터 없음 → Mock(※virt) */
export const FALLBACK_WORDCLOUD: WordCloudCollection = S6_WORDCLOUD;
export const FALLBACK_HINTS: S6HintCard[] = HINTS_S6;
