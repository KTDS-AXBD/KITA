import { EntityCard } from '@/components/platform';

const SAMPLE_ENTITIES = [
  { title: '사건 (Event)', subtitle: '지정학·공급망 충격 이벤트', colorBlock: 'var(--op-color-event)', attrs: ['eventId', 'type', 'date', 'severity'], count: 12 },
  { title: '기업 (Company)', subtitle: '공급망 참여 기업체', colorBlock: 'var(--op-color-company)', attrs: ['corpCode', 'name', 'tier', 'country'], count: 48 },
  { title: '제품 (Product)', subtitle: '소부장 부품·소재', colorBlock: 'var(--op-color-product)', attrs: ['hsCode', 'name', 'category', 'unit'], count: 35 },
];

export function OntologyPage(): JSX.Element {
  return (
    <div className="op-page">
      <div className="op-section-header">
        <h2>온톨로지 정의</h2>
        <p>엔티티 13종 · 관계 8종 · 속성·제약 정의</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {SAMPLE_ENTITIES.map((e) => <EntityCard key={e.title} {...e} />)}
      </div>
      <div className="op-placeholder">전체 엔티티 카드·관계 정의·제약 블록 — Sprint 18(F033)에서 구현 예정</div>
    </div>
  );
}
