/** F016 — givc-queries.mjs 타입 선언 (Worker TS · vitest 공유) */
export function esc(s: unknown): string;
export function sanitizeHs(hs: unknown): string;
export function sanitizeId(id: unknown): string;
export function clampDepth(d: unknown): number;
export function clampLimit(n: unknown, max?: number): number;
export function sanitizeMatch(q: unknown): string;
export function tradeSeriesSql(hs?: string): string;
export function tradeByCountrySql(hs?: string): string;
export function companiesSql(): string;
export function graphReachSql(root?: string, depth?: number): string;
export function nodesByIdsSql(ids: string[]): string;
export function edgesWithinSql(ids: string[]): string;
export function entitySearchSql(q: string, limit?: number): string;
