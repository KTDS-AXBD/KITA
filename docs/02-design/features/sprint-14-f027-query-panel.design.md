# Sprint 14 Design — F027: 실 질의 데모 패널 (ChatGIVC Query)

**Sprint:** 14 | **F-item:** F027 | **일자:** 2026-05-25

> 상세 설계 원본: `docs/req/chatgivc-align/f027-query-panel-design.md` (로컬전용)

## §1 아키텍처

```
S6Page.tsx
  └── [탭 📊 분석 | 💬 ChatGIVC 질의]
        ├── 분석 탭: GvcPane + GvcIntegration (F026, 무변경)
        └── 질의 탭: ChatGivcQueryPane (F027, 신규)
                       ├── 쿼리 선택 버튼 (L1~L5, C1~C3)
                       ├── SQL 병기 (실 SQL | 데모 미러 SQL)
                       └── 결과 테이블 (⭐live/△※큐레이션)
```

## §2 데이터 계층

```
chatgivc-catalog.ts
  QUERY_CATALOG[8]   — id, kind(live|curated), label, realSqlTemplate,
                         mirrorSqlTemplate, provenance, curatedResult?
  ANCHOR_CODE        — { mach: 'GVC-MACH-MC001', semi: 'GVC-SEMI-WF001' }
  resolveTemplate()  — {{GVC_CODE}}/{{LABEL}} 치환

chatgivc-executor.ts
  executeQuery(id, domain) → { columns, rows } | null
    L1: gvcRepository.listMetrics(anchor) → metric_sales_growth
    L2: listMetrics → metric_capital_efficiency
    L3: listMetrics → metric_employment_change
    L4: gvcRepository.getNetwork(domain) → 앵커 연결 엣지
    L5: listMetricsByDomain('mach'|'semi', metric_sales_growth) → 평균 비교
    C1~C3: null (카탈로그 curatedResult 사용)
```

## §3 쿼리 카탈로그 (8종)

| ID | 종류 | 레이블 | 출처 |
|----|------|--------|------|
| L1 | live ⭐ | {{LABEL}} 매출액 증가율 추이 | est |
| L2 | live ⭐ | {{LABEL}} 총자본투자효율 | est |
| L3 | live ⭐ | {{LABEL}} 종업원 증감율(고용) | est |
| L4 | live ⭐ | {{LABEL}} 전후방 가치사슬 | virt |
| L5 | live ⭐ | 도메인 평균 매출증가율 비교 | est |
| C1 | curated △ | {{LABEL}} HS코드 연계 | est |
| C2 | curated ⭐ | {{LABEL}} 2024 수입 상위 5개국 | real |
| C3 | curated ※ | {{LABEL}} KSIC 산업분류 | virt |

## §4 SQL 예시 (mach, GVC-MACH-MC001)

**L1 실 SQL:**
```sql
SELECT year, itm3101110000 AS sales_growth_rate
FROM   scmm_his_chart
WHERE  gvccd = 'GVC-MACH-MC001'
ORDER  BY year DESC
LIMIT  10
```

**L1 미러 SQL (D1 실행):**
```sql
SELECT period, value, unit
FROM   gvc_metrics
WHERE  gvc_code = 'GVC-MACH-MC001'
  AND  metric_key = 'metric_sales_growth'
```

**C1 실 SQL (mart.* 의존 — 표시만):**
```sql
SELECT a.gvccd, b.hs_cd, b.hs_nm_kr
FROM   mart.lnk0955a a
JOIN   mart.mst0904a b ON a.hs_cd = b.hs_cd
WHERE  a.gvccd = 'GVC-MACH-MC001'
```

## §5 컴포넌트 UX

```
┌────────────────────────────────────────────────────────────┐
│ [L1 ⭐ 매출액..] [L2 ⭐ 총자본..] [L3 ⭐ 종업원..] ... [C3 △]  │  ← 선택 버튼
│                                                             │
│ ┌── 실 ChatGIVC SQL ─────┐  ┌── 데모 미러 SQL ↪ 실행 ────┐  │
│ │ SELECT year,            │  │ SELECT period, value,      │  │
│ │ itm3101110000 AS ...    │  │ FROM   gvc_metrics WHERE   │  │
│ └─────────────────────────┘  └────────────────────────────┘  │
│ scmm_his_chart · mart.*       gvc_metrics · gvc_network       │
│                                                             │
│ ┌── 결과 ─────────────────────────────────────────────────┐  │
│ │ △ 추정  "실 GIVC는 이렇게 / 데모는 미러로 재현"           │  │
│ │ period │ value │ unit                                   │  │
│ │ 2023   │ 4.2   │ %                                     │  │
│ └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## §6 공개 경계 검증

- 모든 SQL 템플릿: `실GVC코드…` 없음 확인 → `GVC-MACH-*`/`GVC-SEMI-*`만
- 테스트로 강제: `expect(sql).not.toMatch(/GVC\d{5}/)`
