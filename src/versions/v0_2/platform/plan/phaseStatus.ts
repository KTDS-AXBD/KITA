/**
 * Phase 타임라인 status 자동 계산.
 * F042: PlanPage Phase 0/1이 5/28 기준 stale(Phase 0 done·Phase 1 active로 잘못 표시)이라
 * "today" 시점에서 자동 산출하도록 한다. 일정이 바뀌어도 자동 반영.
 *
 * 경계 처리: start/end 모두 포함(inclusive). end는 23:59:59까지 진행 중으로 본다.
 * 미정(date undefined) Phase는 항상 upcoming(향후 외부 시연일 확정 전 처리용).
 */
import type { TimelineItem } from '@/components/platform';

/** `"5/26~5/30"` 같은 날짜 범위 문자열을 `{start, end}` Date로 파싱. 단일 날짜("5/26")는 start=end. */
export function parseDateRange(range: string, year: number): { start: Date; end: Date } | null {
  const parts = range.split('~').map((s) => s.trim());
  if (parts.length === 0 || parts.length > 2) return null;
  const startStr = parts[0]!;
  const endStr = parts[1] ?? parts[0]!;
  const parse = (s: string): Date | null => {
    const m = s.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (!m) return null;
    const month = Number(m[1]);
    const day = Number(m[2]);
    if (Number.isNaN(month) || Number.isNaN(day)) return null;
    return new Date(year, month - 1, day);
  };
  const start = parse(startStr);
  const end = parse(endStr);
  if (!start || !end) return null;
  // end는 그날 23:59:59까지 active로 본다(인간 직관 일치).
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/** today 기준 단계 status를 산출. date='미정' 또는 파싱 실패 시 upcoming. */
export function computePhaseStatus(
  today: Date,
  range: string | undefined,
  year: number
): TimelineItem['status'] {
  if (!range) return 'upcoming';
  const parsed = parseDateRange(range, year);
  if (!parsed) return 'upcoming';
  if (today < parsed.start) return 'upcoming';
  if (today > parsed.end) return 'done';
  return 'active';
}

/** Phase 정의(status 제외) + today, year → status 부착된 TimelineItem 배열. */
export interface PhaseDef {
  phase: string;
  label: string;
  date: string;
}

export function withComputedStatus(
  phases: PhaseDef[],
  today: Date,
  year: number
): TimelineItem[] {
  return phases.map((p) => ({
    ...p,
    status: computePhaseStatus(today, p.date, year),
  }));
}
