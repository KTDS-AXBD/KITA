/**
 * 출처 메타 — ⭐ 실 / △ 추정 / ※ 가상
 * 모든 표·차트·그래프 노드에 출처가 부착되도록 타입으로 강제한다.
 */
export type Provenance = 'real' | 'est' | 'virt';

/**
 * 메트릭별 출처를 가진 엔티티는 `SourceMap<K>`로 강제 — 키 누락 시 컴파일 에러.
 */
export type SourceMap<K extends string> = Record<K, Provenance>;
