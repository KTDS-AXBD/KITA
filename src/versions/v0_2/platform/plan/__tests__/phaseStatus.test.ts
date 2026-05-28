import { describe, it, expect } from 'vitest';
import { parseDateRange, computePhaseStatus, withComputedStatus } from '../phaseStatus';

describe('parseDateRange', () => {
  it('정상 범위 "5/26~5/30"를 파싱', () => {
    const r = parseDateRange('5/26~5/30', 2026);
    expect(r).not.toBeNull();
    expect(r!.start.getMonth()).toBe(4); // 5월=index 4
    expect(r!.start.getDate()).toBe(26);
    expect(r!.end.getDate()).toBe(30);
    expect(r!.end.getHours()).toBe(23); // end-of-day
  });

  it('단일 날짜 "5/26"를 start=end로', () => {
    const r = parseDateRange('5/26', 2026);
    expect(r).not.toBeNull();
    expect(r!.start.getDate()).toBe(26);
    expect(r!.end.getDate()).toBe(26);
  });

  it('잘못된 형식은 null', () => {
    expect(parseDateRange('미정', 2026)).toBeNull();
    expect(parseDateRange('5/26~6/2~6/6', 2026)).toBeNull();
    expect(parseDateRange('abc/de', 2026)).toBeNull();
  });
});

describe('computePhaseStatus', () => {
  const year = 2026;

  it('오늘 5/28 → Phase 0(5/26~5/30) = active (stale 차단)', () => {
    const today = new Date(2026, 4, 28);
    expect(computePhaseStatus(today, '5/26~5/30', year)).toBe('active');
  });

  it('오늘 5/28 → Phase 1(6/2~6/6) = upcoming (stale active 차단)', () => {
    const today = new Date(2026, 4, 28);
    expect(computePhaseStatus(today, '6/2~6/6', year)).toBe('upcoming');
  });

  it('오늘 6/3 → Phase 0(5/26~5/30) = done, Phase 1(6/2~6/6) = active', () => {
    const today = new Date(2026, 5, 3); // 6월=index 5
    expect(computePhaseStatus(today, '5/26~5/30', year)).toBe('done');
    expect(computePhaseStatus(today, '6/2~6/6', year)).toBe('active');
  });

  it('end 당일도 active (5/30 같은 날 = active)', () => {
    const today = new Date(2026, 4, 30, 12, 0, 0);
    expect(computePhaseStatus(today, '5/26~5/30', year)).toBe('active');
  });

  it('start 당일도 active (5/26 같은 날 = active)', () => {
    const today = new Date(2026, 4, 26, 9, 0, 0);
    expect(computePhaseStatus(today, '5/26~5/30', year)).toBe('active');
  });

  it('미정/undefined → upcoming', () => {
    const today = new Date(2026, 4, 28);
    expect(computePhaseStatus(today, undefined, year)).toBe('upcoming');
    expect(computePhaseStatus(today, '미정', year)).toBe('upcoming');
  });
});

describe('withComputedStatus', () => {
  it('5/28 오늘 기준 Phase 0=active, 1~4=upcoming', () => {
    const today = new Date(2026, 4, 28);
    const result = withComputedStatus(
      [
        { phase: 'Phase 0', label: '준비', date: '5/26~5/30' },
        { phase: 'Phase 1', label: '시나리오', date: '6/2~6/6' },
        { phase: 'Phase 2', label: 'KG', date: '6/9~6/13' },
        { phase: 'Phase 3', label: '시연', date: '6/16~6/20' },
        { phase: 'Phase 4', label: '리뷰', date: '6/23~6/27' },
      ],
      today,
      2026
    );
    expect(result.map((r) => r.status)).toEqual(['active', 'upcoming', 'upcoming', 'upcoming', 'upcoming']);
  });
});
