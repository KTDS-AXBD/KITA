import { describe, it, expect } from 'vitest';
import { executeQuery } from '../chatgivc-executor';
import { ANCHOR_CODE } from '../chatgivc-catalog';

describe('chatgivc-executor', () => {
  describe('L1 매출액 증가율', () => {
    it('mach — columns(period/value/unit), 1행', () => {
      const result = executeQuery('L1', 'mach');
      expect(result).not.toBeNull();
      expect(result!.columns).toEqual(['period', 'value', 'unit']);
      expect(result!.rows.length).toBeGreaterThan(0);
    });

    it('semi — gvc_code=GVC-SEMI-WF001 기준', () => {
      const result = executeQuery('L1', 'semi');
      expect(result).not.toBeNull();
      expect(result!.rows.length).toBeGreaterThan(0);
    });
  });

  describe('L2 총자본투자효율', () => {
    it('mach — 행 존재, value 숫자', () => {
      const result = executeQuery('L2', 'mach');
      expect(result!.rows.length).toBeGreaterThan(0);
      const firstRow = result!.rows.at(0);
      expect(typeof firstRow?.[1]).toBe('number');
    });
  });

  describe('L3 종업원 증감율', () => {
    it('rows 존재', () => {
      expect(executeQuery('L3', 'mach')!.rows.length).toBeGreaterThan(0);
    });
  });

  describe('L4 전후방 가치사슬', () => {
    it('mach — columns(gvc_from/gvc_to/tier_label)', () => {
      const result = executeQuery('L4', 'mach');
      expect(result!.columns).toEqual(['gvc_from', 'gvc_to', 'tier_label']);
    });

    it('mach — 앵커(GVC-MACH-MC001) 포함 엣지만 반환', () => {
      const result = executeQuery('L4', 'mach');
      const anchor = ANCHOR_CODE.mach;
      for (const row of result!.rows) {
        expect(row[0] === anchor || row[1] === anchor).toBe(true);
      }
    });

    it('semi — 앵커(GVC-SEMI-WF001) 포함 엣지', () => {
      const result = executeQuery('L4', 'semi');
      const anchor = ANCHOR_CODE.semi;
      for (const row of result!.rows) {
        expect(row[0] === anchor || row[1] === anchor).toBe(true);
      }
    });
  });

  describe('L5 도메인 평균 비교', () => {
    it('columns(domain/avg_sales_growth), 2행(기계+반도체)', () => {
      const result = executeQuery('L5', 'mach');
      expect(result!.columns).toEqual(['domain', 'avg_sales_growth']);
      expect(result!.rows).toHaveLength(2);
    });

    it('도메인 레이블 포함', () => {
      const result = executeQuery('L5', 'mach');
      const domains = result!.rows.map((r) => r[0]);
      expect(domains.some((d) => String(d).includes('GVC-MACH'))).toBe(true);
      expect(domains.some((d) => String(d).includes('GVC-SEMI'))).toBe(true);
    });

    it('평균값 % 문자열', () => {
      const result = executeQuery('L5', 'mach');
      for (const row of result!.rows) {
        expect(String(row[1])).toMatch(/%$/);
      }
    });
  });

  describe('curated (C1~C3) — null 반환', () => {
    it('C1 null', () => expect(executeQuery('C1', 'mach')).toBeNull());
    it('C2 null', () => expect(executeQuery('C2', 'mach')).toBeNull());
    it('C3 null', () => expect(executeQuery('C3', 'mach')).toBeNull());
  });

  describe('결과 행 virt GVC 코드 포함 여부', () => {
    it('L4 rows — virt 코드(GVC-MACH-*) 포함, 실 코드 미포함', () => {
      const result = executeQuery('L4', 'mach');
      for (const row of result!.rows) {
        for (const cell of row) {
          const s = String(cell);
          // 실GVC코드... 실 코드 포함 금지
          expect(s).not.toMatch(/GVC\d{5}/);
        }
      }
    });
  });
});
