import { describe, it, expect } from 'vitest';
import {
  QUERY_CATALOG,
  ANCHOR_CODE,
  DOMAIN_ANCHOR_LABEL,
  resolveTemplate,
} from '../chatgivc-catalog';

describe('chatgivc-catalog', () => {
  it('총 8개 (live 5 + curated 3)', () => {
    expect(QUERY_CATALOG).toHaveLength(8);
    expect(QUERY_CATALOG.filter((q) => q.kind === 'live')).toHaveLength(5);
    expect(QUERY_CATALOG.filter((q) => q.kind === 'curated')).toHaveLength(3);
  });

  it('ID 순서 L1~L5 C1~C3', () => {
    const ids = QUERY_CATALOG.map((q) => q.id);
    expect(ids).toEqual(['L1', 'L2', 'L3', 'L4', 'L5', 'C1', 'C2', 'C3']);
  });

  it('ANCHOR_CODE — virt 포맷(GVC-MACH-* / GVC-SEMI-*), 실 코드 미포함', () => {
    expect(ANCHOR_CODE.mach).toMatch(/^GVC-MACH-/);
    expect(ANCHOR_CODE.semi).toMatch(/^GVC-SEMI-/);
    // 실 GVC 코드(GVC20101...) 절대 금지
    expect(ANCHOR_CODE.mach).not.toMatch(/^GVC\d/);
    expect(ANCHOR_CODE.semi).not.toMatch(/^GVC\d/);
  });

  it('모든 SQL 템플릿에 실 GVC 코드 미포함', () => {
    for (const entry of QUERY_CATALOG) {
      expect(entry.realSqlTemplate, `${entry.id} realSql`).not.toMatch(/GVC\d{5}/);
      if (entry.mirrorSqlTemplate) {
        expect(entry.mirrorSqlTemplate, `${entry.id} mirrorSql`).not.toMatch(/GVC\d{5}/);
      }
    }
  });

  it('resolveTemplate — {{GVC_CODE}} / {{LABEL}} 치환', () => {
    const tpl = "WHERE gvccd = '{{GVC_CODE}}' -- {{LABEL}}";
    const result = resolveTemplate(tpl, 'mach');
    expect(result).toContain(ANCHOR_CODE.mach);
    expect(result).toContain(DOMAIN_ANCHOR_LABEL.mach);
    expect(result).not.toContain('{{GVC_CODE}}');
    expect(result).not.toContain('{{LABEL}}');
  });

  it('resolveTemplate semi 도메인', () => {
    const result = resolveTemplate("'{{GVC_CODE}}'", 'semi');
    expect(result).toContain(ANCHOR_CODE.semi);
  });

  it('live 5종 모두 mirrorSqlTemplate 보유', () => {
    for (const entry of QUERY_CATALOG.filter((q) => q.kind === 'live')) {
      expect(entry.mirrorSqlTemplate, `${entry.id} mirrorSql`).toBeDefined();
      expect(entry.mirrorSqlTemplate!.length).toBeGreaterThan(0);
    }
  });

  it('curated 3종 모두 curatedResult 보유', () => {
    for (const entry of QUERY_CATALOG.filter((q) => q.kind === 'curated')) {
      expect(entry.curatedResult, `${entry.id} curatedResult`).toBeDefined();
      expect(entry.curatedResult!.columns.length).toBeGreaterThan(0);
      expect(entry.curatedResult!.rows.length).toBeGreaterThan(0);
    }
  });

  it('L5 — {{GVC_CODE}} placeholder 없음 (양 도메인 고정)', () => {
    const l5 = QUERY_CATALOG.find((q) => q.id === 'L5')!;
    expect(l5.realSqlTemplate).not.toContain('{{GVC_CODE}}');
    expect(l5.mirrorSqlTemplate).not.toContain('{{GVC_CODE}}');
    // 대신 virt 코드 양쪽 모두 포함
    expect(l5.realSqlTemplate).toContain('GVC-MACH-MC001');
    expect(l5.realSqlTemplate).toContain('GVC-SEMI-WF001');
  });

  it('L4 realSql — product_network, mirrorSql — gvc_network', () => {
    const l4 = QUERY_CATALOG.find((q) => q.id === 'L4')!;
    expect(l4.realSqlTemplate).toContain('product_network');
    expect(l4.mirrorSqlTemplate).toContain('gvc_network');
  });

  it('C2 — real 출처, C1 — est 출처', () => {
    const c2 = QUERY_CATALOG.find((q) => q.id === 'C2')!;
    const c1 = QUERY_CATALOG.find((q) => q.id === 'C1')!;
    expect(c2.provenance).toBe('real');
    expect(c2.curatedResult?.provenance).toBe('real');
    expect(c1.provenance).toBe('est');
  });

  it('C1 realSql — mart.lnk0955a, C3 — mart.lnk0957a', () => {
    const c1 = QUERY_CATALOG.find((q) => q.id === 'C1')!;
    const c3 = QUERY_CATALOG.find((q) => q.id === 'C3')!;
    expect(c1.realSqlTemplate).toContain('mart.lnk0955a');
    expect(c3.realSqlTemplate).toContain('mart.lnk0957a');
  });
});
