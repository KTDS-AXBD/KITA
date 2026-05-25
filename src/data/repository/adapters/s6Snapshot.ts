/**
 * F015/F021/F023 — 스냅샷 → 도메인 타입 어댑터 (옵션A 동기).
 * 적재 스냅샷(s6.real.snapshot.json)을 화면 도메인 타입으로 흡수.
 * gap(뉴스·힌트)은 Mock fallback(※virt), 그래프 좌표는 결정적 산출(stale layout 미사용).
 * F023: real 경로 스냅샷 = 기계 다단계 가치사슬(머시닝센터 anchor + 베어링/감속기/특수강 tier + 상장 기계사).
 */
import type {
  S6Focus,
  S6Company,
  ValueChainTier,
  TradeSeries,
  TradeAnomaly,
  WordCloudCollection,
  S6HintCard,
  S6Kpi,
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
  tierTrade: Record<string, { hs: string; exports: number; imports: number }>;
  byCountry: { cnty_nm: string; share: number | null; imports: number }[];
  companies: { id: string; name: string; biz?: string; sales?: string; share?: string; coreType: number; role?: string; tier?: string; source: string }[];
}

const snap = snapshotJson as unknown as SnapshotShape;

/** anchor 기준정보 — 공개 표준(HS/KSIC), ⭐real. F023 기계 가치사슬 재적재 완료. */
export const REAL_PRODUCT: S6Focus = {
  name: '머시닝센터 (공작기계)',
  hsCode: 'HS 845710',
  ksic: 'KSIC C2922',
  category: '금속절삭 공작기계 / 장비 (가치사슬 정점)',
  description:
    '실데이터: 관세청 기계 무역통계(머시닝센터 + 베어링·감속기·특수강 tier) + DART 상장 기계사. 소재→부품→장비 소부장 다단계 가치사슬.',
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

/** KPI 카드 산출 — 스냅샷 실데이터 기반(연간수출=앵커 4분기합·핵심부품수입=감속기·핵심기업=coreType1·수입국=top share). */
export function adaptKpis(): S6Kpi[] {
  const t = snap.tradeSeries;
  const annualExp = t.exports.slice(-4).reduce((a, b) => a + b, 0);
  const reducerImp = snap.tierTrade?.reducer?.imports ?? 0;
  const core = snap.companies.filter((c) => c.coreType === 1).length;
  const reserve = snap.companies.length - core;
  const sorted = [...(snap.byCountry ?? [])].sort((a, b) => (b.share ?? 0) - (a.share ?? 0));
  const top = sorted.at(0);
  const pct = (s?: number | null): string => `${Math.round((s ?? 0) * 100)}%`;
  const usdM = (v: number): string => `$${Math.round(v / 1e6).toLocaleString()}M`;
  const others = sorted.slice(1, 3).map((c) => `${c.cnty_nm} ${pct(c.share)}`).join(' · ');
  return [
    { label: '연간 수출 (장비)', value: usdM(annualExp), delta: '머시닝센터 845710', deltaDir: 'up' },
    { label: '핵심부품 수입', value: usdM(reducerImp), delta: '감속기 수입의존', deltaDir: 'down' },
    { label: '핵심 기업', value: `${core}개`, delta: `예비 ${reserve}개`, deltaDir: 'up' },
    { label: '주요 수입국', value: top ? `${top.cnty_nm} ${pct(top.share)}` : '—', delta: others, deltaDir: 'up' },
  ];
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
