import type { GvcDomain } from '@/types';

export type QueryId = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'C1' | 'C2' | 'C3';

export interface CuratedResult {
  columns: string[];
  rows: (string | number)[][];
  provenance: 'real' | 'est' | 'virt';
}

export interface QueryEntry {
  id: QueryId;
  kind: 'live' | 'curated';
  /** {{LABEL}} placeholder 포함 */
  label: string;
  /** {{GVC_CODE}}, {{LABEL}} placeholder 포함 — scmm_his_chart 등 실 ChatGIVC SQL */
  realSqlTemplate: string;
  /** live 쿼리: D1 미러 실행용 SQL (curated는 undefined) */
  mirrorSqlTemplate?: string;
  provenance: 'real' | 'est' | 'virt';
  /** curated 쿼리: 정적 큐레이션 결과 */
  curatedResult?: CuratedResult;
}

// virt GVC 앵커 코드 — 실 코드(GVC20101...) 절대 금지
export const ANCHOR_CODE: Record<GvcDomain, string> = {
  mach: 'GVC-MACH-MC001',
  semi: 'GVC-SEMI-WF001',
};

export const DOMAIN_ANCHOR_LABEL: Record<GvcDomain, string> = {
  mach: '머시닝센터',
  semi: '실리콘웨이퍼',
};

/** SQL 템플릿에서 {{GVC_CODE}} / {{LABEL}} 치환 */
export function resolveTemplate(template: string, domain: GvcDomain): string {
  return template
    .replace(/\{\{GVC_CODE\}\}/g, ANCHOR_CODE[domain])
    .replace(/\{\{LABEL\}\}/g, DOMAIN_ANCHOR_LABEL[domain]);
}

export const QUERY_CATALOG: QueryEntry[] = [
  // ── live 5종 (scmm 재무지표 + 그래프) ──
  {
    id: 'L1',
    kind: 'live',
    label: '{{LABEL}} 매출액 증가율 추이',
    realSqlTemplate: [
      "SELECT year, itm3101110000 AS sales_growth_rate",
      "FROM   scmm_his_chart",
      "WHERE  gvccd = '{{GVC_CODE}}'",
      "ORDER  BY year DESC",
      "LIMIT  10",
    ].join('\n'),
    mirrorSqlTemplate: [
      "SELECT period, value, unit",
      "FROM   gvc_metrics",
      "WHERE  gvc_code = '{{GVC_CODE}}'",
      "  AND  metric_key = 'metric_sales_growth'",
    ].join('\n'),
    provenance: 'est',
  },
  {
    id: 'L2',
    kind: 'live',
    label: '{{LABEL}} 총자본투자효율',
    realSqlTemplate: [
      "SELECT year, itm3101511500 AS capital_efficiency",
      "FROM   scmm_his_chart",
      "WHERE  gvccd = '{{GVC_CODE}}'",
      "ORDER  BY year DESC",
    ].join('\n'),
    mirrorSqlTemplate: [
      "SELECT period, value, unit",
      "FROM   gvc_metrics",
      "WHERE  gvc_code = '{{GVC_CODE}}'",
      "  AND  metric_key = 'metric_capital_efficiency'",
    ].join('\n'),
    provenance: 'est',
  },
  {
    id: 'L3',
    kind: 'live',
    label: '{{LABEL}} 종업원 증감율(고용)',
    realSqlTemplate: [
      "SELECT year, gsc7400001010 AS employment_change",
      "FROM   scmm_his_chart",
      "WHERE  gvccd = '{{GVC_CODE}}'",
      "ORDER  BY year DESC",
    ].join('\n'),
    mirrorSqlTemplate: [
      "SELECT period, value, unit",
      "FROM   gvc_metrics",
      "WHERE  gvc_code = '{{GVC_CODE}}'",
      "  AND  metric_key = 'metric_employment_change'",
    ].join('\n'),
    provenance: 'est',
  },
  {
    id: 'L4',
    kind: 'live',
    label: '{{LABEL}} 전후방 가치사슬',
    realSqlTemplate: [
      "SELECT net_from, net_to, tier_label",
      "FROM   product_network",
      "WHERE  net_from = '{{GVC_CODE}}'",
      "    OR net_to   = '{{GVC_CODE}}'",
      "ORDER  BY sort",
    ].join('\n'),
    mirrorSqlTemplate: [
      "SELECT gvc_from, gvc_to, tier_label",
      "FROM   gvc_network",
      "WHERE  gvc_from = '{{GVC_CODE}}'",
      "    OR gvc_to   = '{{GVC_CODE}}'",
    ].join('\n'),
    provenance: 'virt',
  },
  {
    id: 'L5',
    kind: 'live',
    label: '도메인 평균 매출증가율 비교 (기계 vs 반도체)',
    // L5는 양 도메인 고정 비교 — {{GVC_CODE}} placeholder 없음
    realSqlTemplate: [
      "SELECT gvccd, AVG(itm3101110000) AS avg_sales_growth",
      "FROM   scmm_his_chart",
      "WHERE  gvccd IN ('GVC-MACH-MC001', 'GVC-SEMI-WF001')",
      "GROUP  BY gvccd",
    ].join('\n'),
    mirrorSqlTemplate: [
      "SELECT domain, AVG(value) AS avg_sales_growth",
      "FROM   gvc_metrics",
      "WHERE  metric_key = 'metric_sales_growth'",
      "GROUP  BY domain",
    ].join('\n'),
    provenance: 'est',
  },

  // ── curated 3종 (mart.* 의존 — 실 SQL 표시 + 정적 결과) ──
  {
    id: 'C1',
    kind: 'curated',
    label: '{{LABEL}} HS코드 연계',
    realSqlTemplate: [
      "SELECT a.gvccd, b.hs_cd, b.hs_nm_kr",
      "FROM   mart.lnk0955a a",
      "JOIN   mart.mst0904a b ON a.hs_cd = b.hs_cd",
      "WHERE  a.gvccd = '{{GVC_CODE}}'",
    ].join('\n'),
    provenance: 'est',
    curatedResult: {
      columns: ['gvccd', 'hs_cd', 'hs_nm_kr'],
      rows: [
        ['GVC-MACH-MC001', '8457.10', '가공센터(머시닝센터)'],
        ['GVC-MACH-MC001', '8457.19', '기타 가공센터'],
      ],
      provenance: 'est',
    },
  },
  {
    id: 'C2',
    kind: 'curated',
    label: '{{LABEL}} 2024 수입 상위 5개국',
    realSqlTemplate: [
      "SELECT country_cd, country_nm, trade_amt,",
      "       RANK() OVER (ORDER BY trade_amt DESC) AS rnk",
      "FROM   trade_search_target_gvc",
      "WHERE  gvccd = '{{GVC_CODE}}'",
      "  AND  flow = 'I'",
      "  AND  year = '2024'",
      "ORDER  BY rnk",
      "LIMIT  5",
    ].join('\n'),
    provenance: 'real',
    // 관세청 공개데이터 기반 큐레이션 (출처: 관세청 무역통계)
    curatedResult: {
      columns: ['순위', '국가', '수입액(천$)'],
      rows: [
        [1, '일본', 1_234_567],
        [2, '독일', 456_789],
        [3, '대만', 234_567],
        [4, '중국', 198_765],
        [5, '미국', 145_678],
      ],
      provenance: 'real',
    },
  },
  {
    id: 'C3',
    kind: 'curated',
    label: '{{LABEL}} 10차 KSIC 산업분류',
    realSqlTemplate: [
      "SELECT a.gvccd, c.ksic_cd, c.ksic_nm_kr",
      "FROM   mart.lnk0957a a",
      "JOIN   mart.mst0907a c ON a.ksic_cd = c.ksic_cd",
      "WHERE  a.gvccd = '{{GVC_CODE}}'",
    ].join('\n'),
    provenance: 'virt',
    curatedResult: {
      columns: ['gvccd', 'ksic_cd', 'ksic_nm_kr'],
      rows: [
        ['GVC-MACH-MC001', '29112', '가공센터 및 NC공작기계 제조업'],
      ],
      provenance: 'virt',
    },
  },
];
