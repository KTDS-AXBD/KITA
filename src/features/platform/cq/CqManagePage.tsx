import { Badge } from '@/components/platform';

export function CqManagePage(): JSX.Element {
  return (
    <div className="op-page">
      <div className="op-section-header">
        <h2>CQ 관리</h2>
        <p>Competency Question — 온톨로지가 답해야 할 질문 정의·검증</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Badge variant="verified" />
        <Badge variant="draft" />
        <Badge variant="pending" />
      </div>
      <div className="op-placeholder">CQ 목록·상세·등록 모달 — Sprint 18(F032)에서 구현 예정</div>
    </div>
  );
}
