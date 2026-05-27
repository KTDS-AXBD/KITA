import { DataTable } from '@/components/platform';

const CARD_STYLE: React.CSSProperties = {
  background: 'var(--op-bg-card)',
  borderRadius: 'var(--op-radius)',
  border: '1px solid var(--op-border)',
  overflow: 'hidden',
};

const cardHeader = (bg: string): React.CSSProperties => ({
  padding: '14px 20px',
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--op-text-primary)',
  background: bg,
  borderBottom: '1px solid var(--op-border)',
});

function ChatBubble({ role, children }: { role: 'user' | 'ai'; children: React.ReactNode }): JSX.Element {
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        fontSize: 13,
        lineHeight: 1.65,
        marginBottom: 10,
        ...(role === 'user'
          ? { background: '#F4F6FB', color: 'var(--op-text-primary)' }
          : { background: '#FFFFFF', border: '1px solid var(--op-border)', color: 'var(--op-text-primary)' }),
      }}
    >
      {children}
    </div>
  );
}

function Annot({ ok, children }: { ok: boolean; children: React.ReactNode }): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 6,
        fontSize: 12,
        marginBottom: 6,
        ...(ok
          ? { background: '#F0FFF4', color: '#2E7D32' }
          : { background: '#FFF0F0', color: '#D32F2F' }),
      }}
    >
      <span style={{ fontWeight: 700, flexShrink: 0 }}>{ok ? '✓' : '✗'}</span>
      <span>{children}</span>
    </div>
  );
}

function ImpactBar({ label, value, pct }: { label: string; value: string; pct: number }): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, marginBottom: 8 }}>
      <span style={{ fontWeight: 600, width: 140, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#E8ECF1', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--op-accent)', borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--op-text-tertiary)', width: 36, textAlign: 'right', flexShrink: 0 }}>
        {value}
      </span>
    </div>
  );
}

const COMPARE_COLUMNS = [
  { key: 'axis', label: '비교 축', width: '160px' },
  { key: 'llm', label: 'LLM + RAG' },
  { key: 'kg', label: '온톨로지 + KG' },
];

const COMPARE_ROWS = [
  {
    axis: <span style={{ fontWeight: 600 }}>인과관계 추적</span>,
    llm: '문서 기반, 경로 추적 불가',
    kg: <span style={{ color: '#2E7D32', fontWeight: 500 }}>관계 그래프 6단계 자동 추적</span>,
  },
  {
    axis: <span style={{ fontWeight: 600 }}>설명가능성</span>,
    llm: '"이 문서에서 찾았습니다"',
    kg: <span style={{ color: '#2E7D32', fontWeight: 500 }}>"대한정밀감속기 → R&D 26.0% → 특허 44건 → 적합도 94.2점"</span>,
  },
  {
    axis: <span style={{ fontWeight: 600 }}>재현성</span>,
    llm: '같은 질문, 다른 답변 가능',
    kg: <span style={{ color: '#2E7D32', fontWeight: 500 }}>같은 그래프 = 같은 답변</span>,
  },
  {
    axis: <span style={{ fontWeight: 600 }}>시나리오 예측</span>,
    llm: '구조적 답변 불가',
    kg: <span style={{ color: '#2E7D32', fontWeight: 500 }}>조건 변경 → 영향 자동 재계산</span>,
  },
  {
    axis: <span style={{ fontWeight: 600 }}>대응 옵션</span>,
    llm: '일반론 수준',
    kg: <span style={{ color: '#2E7D32', fontWeight: 500 }}>데이터 기반 비교 + 근거</span>,
  },
  {
    axis: <span style={{ fontWeight: 600 }}>데이터 신뢰</span>,
    llm: '출처: "문서 p.23"',
    kg: <span style={{ color: '#2E7D32', fontWeight: 500 }}>출처: NTIS R&D과제 · KIPRIS 특허</span>,
  },
];

export function ComparePage(): JSX.Element {
  return (
    <div className="op-page">
      <div className="op-section-header">
        <h2>비교 검증</h2>
        <p>기존 방식 vs 온톨로지 기반 분석 비교</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* 좌: chatGIVC */}
        <div style={CARD_STYLE}>
          <div style={cardHeader('#FAFBFD')}>chatGIVC (LLM + RAG)</div>
          <div style={{ padding: 20 }}>
            <ChatBubble role="user">
              공작기계 국산화 R&D 기업을 선정하려면 어떤 기업을 봐야 하나요?
            </ChatBubble>
            <ChatBubble role="ai">
              공작기계 국산화를 위한 R&D 기업 선정은 기술력, 특허, 매출 규모 등을
              종합적으로 고려해야 합니다. 감속기, 베어링, 스핀들 등 핵심 부품 분야
              전문 기업을 우선적으로 검토하시기 바랍니다.
              <br /><br />
              <span style={{ fontSize: 11, color: 'var(--op-text-tertiary)' }}>
                출처: GIVC 산업동향 보고서 (2025년 3월호)
              </span>
            </ChatBubble>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--op-border)' }}>
              <Annot ok={false}>구체적 기업명 미제시</Annot>
              <Annot ok={false}>선정 인과 경로/순서 없음</Annot>
              <Annot ok={false}>정량적 근거 없음</Annot>
              <Annot ok={false}>대응 옵션 제시 불가</Annot>
            </div>
          </div>
        </div>

        {/* 우: 온톨로지+KG */}
        <div style={CARD_STYLE}>
          <div style={cardHeader('#F4F6FB')}>온톨로지 + Knowledge Graph</div>
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--op-text-secondary)', marginBottom: 10 }}>
                R&D 적합 기업 Top 3
              </div>
              <ImpactBar label="대한정밀감속기" value="94.2" pct={94} />
              <ImpactBar label="서원베어링테크" value="87.6" pct={88} />
              <ImpactBar label="에스피지" value="72.3" pct={72} />
            </div>
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--op-bg-base)',
                borderRadius: 6,
                fontSize: 11,
                color: 'var(--op-text-secondary)',
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--op-text-primary)' }}>경로: </span>
              Company → R&D집약도(26.0%) → 특허 44건(소재/공법) → 국산화 적합도 → 의존도 감소
            </div>
            <div style={{ borderTop: '1px solid var(--op-border)', paddingTop: 14 }}>
              <Annot ok={true}>감속기·베어링 등 구체적 기업 + 순위 + 점수</Annot>
              <Annot ok={true}>6단계 인과 경로 자동 추적</Annot>
              <Annot ok={true}>투자율/의존도 정량 근거</Annot>
              <Annot ok={true}>대응 옵션 + 근거 + 리스크 제시</Annot>
              <Annot ok={true}>설명가능성 (Explainability) 보장</Annot>
              <Annot ok={true}>동일 질의 = 동일 결과 (재현성)</Annot>
            </div>
          </div>
        </div>
      </div>

      {/* 6축 비교표 */}
      <div style={{ background: 'var(--op-bg-card)', borderRadius: 'var(--op-radius)', border: '1px solid var(--op-border)', overflow: 'hidden' }}>
        <DataTable columns={COMPARE_COLUMNS} rows={COMPARE_ROWS} />
      </div>
    </div>
  );
}
