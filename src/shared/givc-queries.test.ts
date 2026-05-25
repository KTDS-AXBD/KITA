import { describe, it, expect } from 'vitest';
import {
  clampDepth,
  clampLimit,
  sanitizeHs,
  sanitizeId,
  sanitizeMatch,
  tradeSeriesSql,
  companiesSql,
  graphReachSql,
  nodesByIdsSql,
  edgesWithinSql,
  entitySearchSql,
} from './givc-queries.mjs';

describe('clampDepth (재귀 폭주 방어)', () => {
  it('1~4로 클램프', () => {
    expect(clampDepth(0)).toBe(1);
    expect(clampDepth(5)).toBe(4);
    expect(clampDepth(2.7)).toBe(2);
    expect(clampDepth(-3)).toBe(1);
  });
  it('비숫자는 기본 2', () => {
    expect(clampDepth('x')).toBe(2);
    expect(clampDepth(undefined)).toBe(2);
  });
});

describe('clampLimit', () => {
  it('0/음수는 기본, 50 상한', () => {
    expect(clampLimit(0)).toBe(20);
    expect(clampLimit(100)).toBe(50);
    expect(clampLimit(5)).toBe(5);
  });
});

describe('sanitize (injection 안전)', () => {
  it('sanitizeHs: 숫자만, 빈값 기본', () => {
    expect(sanitizeHs('HS 290230')).toBe('290230');
    expect(sanitizeHs("29;DROP TABLE")).toBe('29');
    expect(sanitizeHs('')).toBe('845710'); // F023: 기본 앵커 머시닝센터
  });
  it('sanitizeId: 영숫자·언더스코어만', () => {
    expect(sanitizeId('C_JP')).toBe('C_JP');
    expect(sanitizeId("a'b")).toBe('ab');
    expect(sanitizeId('')).toBe('MC'); // F023: 기본 그래프 anchor
  });
  it('sanitizeMatch: 특수문자 제거 + 토큰 따옴표', () => {
    expect(sanitizeMatch('a*"b c')).toBe('"a" "b" "c"');
    expect(sanitizeMatch('롯데')).toBe('"롯데"');
    expect(sanitizeMatch('  ')).toBe('');
  });
});

describe('정형 SQL', () => {
  it('tradeSeriesSql: hs 인라인 + ORDER BY', () => {
    const s = tradeSeriesSql('290230');
    expect(s).toContain("hs_code='290230'");
    expect(s).toContain('ORDER BY period');
  });
  it('tradeSeriesSql: injection 무력화', () => {
    expect(tradeSeriesSql("290230'; DROP")).toContain("hs_code='290230'");
  });
  it('companiesSql: core_type 정렬 + source 별칭', () => {
    const s = companiesSql();
    expect(s).toContain('provenance AS source');
    expect(s).toContain('ORDER BY core_type, name');
  });
});

describe('그래프 재귀 CTE', () => {
  it('루트·깊이 인라인', () => {
    const s = graphReachSql('TOL', 2);
    expect(s).toContain("SELECT 'TOL', 0");
    expect(s).toContain('r.depth < 2');
    expect(s).toContain('WITH RECURSIVE reach');
  });
  it('injection·깊이 폭주 방어', () => {
    const s = graphReachSql("x'; DROP--", 9);
    expect(s).toContain("'xDROP'");
    expect(s).toContain('r.depth < 4');
  });
  it('nodesByIdsSql / edgesWithinSql: IN 절 + src<dst dedup + 결정적 ORDER BY', () => {
    expect(nodesByIdsSql(['TOL', 'C_JP'])).toContain("IN ('TOL','C_JP')");
    expect(nodesByIdsSql(['TOL'])).toContain('ORDER BY CASE type');
    expect(nodesByIdsSql([])).toContain("IN ('')");
    expect(edgesWithinSql(['a', 'b'])).toContain('src < dst');
    expect(edgesWithinSql(['a', 'b'])).toContain('ORDER BY src, dst');
  });
});

describe('FTS5 전문검색', () => {
  it('MATCH 식 + LIMIT', () => {
    const s = entitySearchSql('롯데', 5);
    expect(s).toContain('entity_fts MATCH');
    expect(s).toContain('"롯데"');
    expect(s).toContain('LIMIT 5');
  });
  it("작은따옴표 escape(injection 안전)", () => {
    expect(entitySearchSql("a'b")).toContain("a''b");
  });
});
