/**
 * F015 — 스냅샷 → 도메인 타입 어댑터 (옵션A 동기).
 * F014 적재 스냅샷(s6.real.snapshot.json)을 화면 도메인 타입으로 흡수.
 * gap(뉴스·힌트)은 Mock fallback(※virt), 그래프 좌표는 결정적 산출(stale layout 미사용).
 */
import type {
  TolueneProduct,
  TolueneCompany,
  TradeSeries,
  TradeAnomaly,
  WordCloudCollection,
  TolueneHintCard,
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
  companies: { id: string; name: string; biz?: string; sales?: string; share?: string; coreType: number; role?: string; source: string }[];
}

const snap = snapshotJson as unknown as SnapshotShape;

/** 제품 기준정보 — 공개 표준(HS/CAS), ⭐real */
export const REAL_PRODUCT: TolueneProduct = {
  name: '톨루엔 (Toluene)',
  hsCode: 'HS 290230',
  cas: 'CAS 108-88-3',
  category: '방향족 탄화수소 / BTX',
  description: '도료·잉크·접착제·합성원료에 쓰이는 방향족 탄화수소 용제. 실데이터: 관세청 무역통계 + DART 기업.',
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

export function adaptCompanies(): TolueneCompany[] {
  return snap.companies.map((c) => ({
    id: c.id,
    name: c.name,
    biz: c.biz ?? '',
    share: c.share ?? '—',
    sales: c.sales ?? '—',
    coreType: (c.coreType === 1 ? 1 : 2),
    role: c.role ?? '',
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

/** 결정적 방사형 레이아웃 — TOL 중앙, 국가 좌호·기업 우호·기타 상단 (stale layout 미사용) */
export function layoutGraph(graph: KnowledgeGraph): PositionedGraph {
  const vb = graph.viewBox.split(/\s+/).map(Number);
  const cx = (vb[0] ?? 0) + (vb[2] ?? 800) / 2;
  const cy = (vb[1] ?? 0) + (vb[3] ?? 500) / 2;
  const groups: { country: GraphNode[]; company: GraphNode[]; other: GraphNode[] } = { country: [], company: [], other: [] };
  for (const n of graph.nodes) {
    if (n.id === 'TOL') continue;
    if (n.type === 'country') groups.country.push(n);
    else if (n.type === 'company') groups.company.push(n);
    else groups.other.push(n);
  }
  const pos = new Map<string, { x: number; y: number }>([['TOL', { x: cx, y: cy }]]);
  const arc = (arr: GraphNode[], a0: number, a1: number, radius: number) => {
    arr.forEach((n, i) => {
      const t = arr.length <= 1 ? 0.5 : i / (arr.length - 1);
      const ang = a0 + (a1 - a0) * t;
      pos.set(n.id, { x: cx + radius * Math.cos(ang), y: cy + radius * Math.sin(ang) });
    });
  };
  arc(groups.country, Math.PI * 0.72, Math.PI * 1.28, 180); // 좌측 호
  arc(groups.company, -Math.PI * 0.32, Math.PI * 0.32, 210); // 우측 호
  arc(groups.other, -Math.PI * 0.62, -Math.PI * 0.38, 150); // 상단
  const nodes: PositionedNode[] = graph.nodes.map((n) => {
    const p = pos.get(n.id) ?? { x: cx, y: cy };
    return { ...n, x: Math.round(p.x), y: Math.round(p.y) };
  });
  return { nodes, edges: graph.edges, viewBox: graph.viewBox };
}

/** gap fallback — 뉴스 워드클라우드·시연 힌트는 실데이터 없음 → Mock(※virt) */
export const FALLBACK_WORDCLOUD: WordCloudCollection = S6_WORDCLOUD;
export const FALLBACK_HINTS: TolueneHintCard[] = HINTS_S6;
