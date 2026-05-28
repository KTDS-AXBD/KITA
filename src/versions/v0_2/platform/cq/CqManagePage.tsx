import { useState, useCallback } from 'react';
import { Badge, Modal, CypherBlock, Timeline } from '@/components/platform';
import type { TimelineItem } from '@/components/platform';
import {
  CQ_ITEMS,
  CqItem,
  CqStatus,
  CqProvenance,
  ProvenanceKind,
  SURVEY_SCENARIOS,
  DATA_INTENT_ITEMS,
  DATA_INTENT_LABEL,
  CUSTOMER_INTENT_LABEL,
} from './cqData';

type FilterKey = 'all' | 'tier1' | 'tier2' | 'verified' | 'unverified';

const FILTER_LABELS: Record<FilterKey, string> = {
  all: '전체',
  tier1: 'Tier 1',
  tier2: 'Tier 2',
  verified: '검증완료',
  unverified: '미검증',
};

const STATUS_LABEL: Record<CqStatus, string> = {
  verified: '검증완료',
  draft: '초안',
  pending: '대기',
};

const STATUS_BADGE_VARIANT: Record<CqStatus, 'verified' | 'draft' | 'pending'> = {
  verified: 'verified',
  draft: 'draft',
  pending: 'pending',
};

const DATA_STATUS_STYLE: Record<string, React.CSSProperties> = {
  confirmed: { background: '#111', color: '#fff', padding: '1px 7px', borderRadius: 3, fontSize: 11, fontWeight: 600 },
  partial: { background: '#F9E2AF', color: '#8B6914', padding: '1px 7px', borderRadius: 3, fontSize: 11, fontWeight: 600 },
  pending: { background: '#E8ECF1', color: '#666', padding: '1px 7px', borderRadius: 3, fontSize: 11, fontWeight: 600 },
};

const DATA_STATUS_LABEL: Record<string, string> = {
  confirmed: '확보',
  partial: '부분확보',
  pending: '미확보',
};

// ── 빌드업 이력(provenance) → Timeline 매핑 ──
const PROV_KIND_LABEL: Record<ProvenanceKind, string> = {
  registered: '등록',
  survey: '질의서',
  data: '데이터',
  verified: '검증',
  report: '보고',
};

const PROV_KIND_STATUS: Record<ProvenanceKind, TimelineItem['status']> = {
  registered: 'done',
  survey: 'active',
  data: 'active',
  verified: 'done',
  report: 'upcoming',
};

function provenanceToTimeline(prov: CqProvenance[]): TimelineItem[] {
  return prov.map((p) => ({
    phase: `[${PROV_KIND_LABEL[p.kind]}] ${p.round}`,
    label: p.note,
    date: p.date,
    status: PROV_KIND_STATUS[p.kind],
  }));
}

const SCENARIO_BY_SID = Object.fromEntries(SURVEY_SCENARIOS.map((s) => [s.sid, s]));
const DATA_INTENT_RESPONSE = Object.fromEntries(DATA_INTENT_ITEMS.map((d) => [d.key, d.response]));

const SUBHEAD: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--op-text-secondary)',
  marginBottom: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

function matchFilter(cq: CqItem, filter: FilterKey): boolean {
  if (filter === 'all') return true;
  if (filter === 'tier1') return cq.tier === 1;
  if (filter === 'tier2') return cq.tier === 2;
  if (filter === 'verified') return cq.status === 'verified';
  if (filter === 'unverified') return cq.status !== 'verified';
  return true;
}

function CqDetailPanel({ cq }: { cq: CqItem }): JSX.Element {
  return (
    <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
      {/* 질문 정의 */}
      <section style={{ borderBottom: '1px solid var(--op-border)', paddingBottom: 16, marginBottom: 16 }}>
        <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--op-text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>질문 정의</h4>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-tertiary)', marginBottom: 3 }}>CQ ID</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{cq.id}</div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-tertiary)', marginBottom: 3 }}>Tier</div>
          <span style={{ padding: '2px 8px', borderRadius: 4, background: 'var(--op-accent-light)', color: 'var(--op-accent)', fontSize: 12, fontWeight: 600 }}>
            Tier {cq.tier} {cq.tier === 1 ? '(필수 시연)' : '(고객 확인)'}
          </span>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-tertiary)', marginBottom: 3 }}>상태</div>
          <Badge variant={STATUS_BADGE_VARIANT[cq.status]} label={STATUS_LABEL[cq.status]} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-tertiary)', marginBottom: 3 }}>질문</div>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.6 }}>{cq.question}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-tertiary)', marginBottom: 3 }}>배경</div>
          <div style={{ fontSize: 12, color: 'var(--op-text-secondary)', lineHeight: 1.6 }}>{cq.background}</div>
        </div>
      </section>

      {/* 질의서 연결: 고객 질의 (일회성 아님: 우선순위·데이터의향 회신으로 빌드업) */}
      {(cq.scenarioSid || cq.customerAsk) && (
        <section style={{ borderBottom: '1px solid var(--op-border)', paddingBottom: 16, marginBottom: 16 }}>
          <h4 style={SUBHEAD}>질의서 연결 · 고객 질의</h4>
          {cq.scenarioSid && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-tertiary)', marginBottom: 4 }}>시나리오 매핑</div>
              <span style={{ padding: '2px 9px', borderRadius: 4, background: '#111', color: '#fff', fontSize: 12, fontWeight: 700, marginRight: 6 }}>
                {cq.scenarioSid}
              </span>
              <span style={{ fontSize: 12, color: 'var(--op-text-secondary)' }}>
                {SCENARIO_BY_SID[cq.scenarioSid]?.title ?? ''}
                {SCENARIO_BY_SID[cq.scenarioSid]?.role === 'main' && ' · 🥇 MAIN'}
                {SCENARIO_BY_SID[cq.scenarioSid]?.role === 'sub' && ' · 🥈 SUB'}
              </span>
            </div>
          )}
          {cq.customerAsk && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-tertiary)', marginBottom: 4 }}>고객에게 묻는 것</div>
              <div style={{ fontSize: 12, color: 'var(--op-text-secondary)', lineHeight: 1.6, padding: '8px 12px', background: 'var(--op-bg-base)', borderRadius: 'var(--op-radius-sm)' }}>
                {cq.customerAsk}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 관련 엔티티/관계 */}
      <section style={{ borderBottom: '1px solid var(--op-border)', paddingBottom: 16, marginBottom: 16 }}>
        <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--op-text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>관련 엔티티 / 관계</h4>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-tertiary)', marginBottom: 6 }}>엔티티</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {cq.entities.map((e) => (
              <span
                key={e.name}
                style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                  background: `${e.color}22`, color: e.color,
                }}
              >
                {e.name}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-tertiary)', marginBottom: 6 }}>관계</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {cq.relations.map((r) => (
              <span key={r} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: '#F5F5F5', color: '#333' }}>{r}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 그래프 쿼리 */}
      <section style={{ borderBottom: '1px solid var(--op-border)', paddingBottom: 16, marginBottom: 16 }}>
        <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--op-text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>그래프 쿼리</h4>
        <CypherBlock code={cq.cypher} />
      </section>

      {/* 검증 결과 */}
      {cq.status === 'verified' && (
        <section style={{ borderBottom: '1px solid var(--op-border)', paddingBottom: 16, marginBottom: 16 }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--op-text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>검증 결과</h4>
          {/* F045: 1fr 1fr -> auto-fit minmax(140, 1fr) 반응형. 4 메트릭 좁은 폭에서 1컬럼 stack. */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 12 }}>
            {[
              { label: '검증일', value: cq.verifiedAt ?? '' },
              { label: '탐색 노드', value: `${cq.statsNodes} / 161` },
              { label: '탐색 엣지', value: `${cq.statsEdges} / 331` },
              { label: '응답 시간', value: `${cq.statsTime}초` },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '10px 14px', background: 'var(--op-bg-base)', borderRadius: 'var(--op-radius-sm)' }}>
                <div style={{ fontSize: 11, color: 'var(--op-text-tertiary)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
          {cq.resultItems && (
            <div style={{ padding: '10px 14px', background: 'var(--op-bg-base)', borderRadius: 'var(--op-radius-sm)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-secondary)', marginBottom: 6 }}>결과 품목</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {cq.resultItems.map((item) => (
                  <span key={item} style={{ padding: '3px 8px', borderRadius: 4, background: '#111', color: '#fff', fontSize: 12, fontWeight: 600 }}>{item}</span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 데이터 요구사항 (고객 회신 = 질의서 B 데이터의향 폐루프) */}
      {cq.dataRequirements && (
        <section style={{ borderBottom: '1px solid var(--op-border)', paddingBottom: 16, marginBottom: 16 }}>
          <h4 style={SUBHEAD}>데이터 요구사항 · 고객 회신</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--op-border)' }}>
                {['필요 데이터', '출처', '상태', '고객 회신'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--op-text-tertiary)', fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cq.dataRequirements.map((dr) => {
                const intent = dr.surveyKey ? DATA_INTENT_RESPONSE[dr.surveyKey] : undefined;
                return (
                  <tr key={dr.data} style={{ borderBottom: '1px solid var(--op-border)' }}>
                    <td style={{ padding: '7px 8px' }}>{dr.data}</td>
                    <td style={{ padding: '7px 8px', color: 'var(--op-text-secondary)' }}>{dr.source}</td>
                    <td style={{ padding: '7px 8px' }}>
                      <span style={DATA_STATUS_STYLE[dr.status]}>{DATA_STATUS_LABEL[dr.status]}</span>
                    </td>
                    <td style={{ padding: '7px 8px' }}>
                      {intent ? (
                        <span
                          title={dr.surveyKey ? `질의서 B: ${DATA_INTENT_LABEL[dr.surveyKey]}` : undefined}
                          style={{
                            fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 3,
                            background: intent === 'pending' ? '#E8ECF1' : '#111',
                            color: intent === 'pending' ? '#666' : '#fff',
                          }}
                        >
                          {CUSTOMER_INTENT_LABEL[intent]}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--op-text-tertiary)' }}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: 'var(--op-text-tertiary)', marginTop: 8, lineHeight: 1.6 }}>
            고객 회신은 질의서(Google Form) B 데이터의향과 연동됩니다. 폼 활성화·회신 수집 후 미회신에서 즉시/일부/추후/불가로 갱신되며 상태(확보)를 끌어올립니다.
          </div>
        </section>
      )}

      {/* 산업부 보고 연결 */}
      {cq.reportRef && (
        <section style={{ borderBottom: '1px solid var(--op-border)', paddingBottom: 16, marginBottom: 16 }}>
          <h4 style={SUBHEAD}>산업부 보고 연결</h4>
          <div style={{ fontSize: 12, color: 'var(--op-text-secondary)', lineHeight: 1.6, padding: '10px 14px', background: 'var(--op-bg-base)', borderRadius: 'var(--op-radius-sm)', borderLeft: '3px solid #111' }}>
            {cq.reportRef}
          </div>
        </section>
      )}

      {/* 빌드업 이력: 일회성 아님 (기진회 PoC -> 산업부 보고로 누적) */}
      {cq.provenance && cq.provenance.length > 0 && (
        <section>
          <h4 style={SUBHEAD}>빌드업 이력 · 기진회 PoC -&gt; 산업부 보고</h4>
          <Timeline items={provenanceToTimeline(cq.provenance)} />
        </section>
      )}
    </div>
  );
}

// ── 시나리오 커버리지 (질의서 S1~S7 ↔ CQ 매핑, backlog 표기) ──
function ScenarioCoverage({ onSelect, activeSid }: { onSelect: (cqId: string) => void; activeSid?: string }): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
      {SURVEY_SCENARIOS.map((s) => {
        const mapped = s.cqIds.length > 0;
        const isActive = activeSid === s.sid;
        return (
          <button
            key={s.sid}
            onClick={() => { const first = s.cqIds[0]; if (first) onSelect(first); }}
            disabled={!mapped}
            title={mapped ? `${s.cqIds.join(', ')} 보기` : '대응 CQ 미등록 (우선순위 회신 대기)'}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
              borderRadius: 6, fontSize: 11, cursor: mapped ? 'pointer' : 'default',
              border: isActive ? '1px solid #111' : '1px solid var(--op-border)',
              background: mapped ? 'var(--op-bg-card)' : 'var(--op-bg-base)',
              opacity: mapped ? 1 : 0.7,
            }}
          >
            <span style={{ fontWeight: 700, color: mapped ? 'var(--op-text-primary)' : 'var(--op-text-tertiary)' }}>
              {s.sid}
            </span>
            <span style={{ color: 'var(--op-text-secondary)' }}>{s.title}</span>
            {s.role === 'main' && <span title="MAIN">🥇</span>}
            {s.role === 'sub' && <span title="SUB">🥈</span>}
            <span
              style={{
                fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 3,
                background: mapped ? '#111' : '#E8ECF1',
                color: mapped ? '#fff' : '#888',
              }}
            >
              {mapped ? `CQ ${s.cqIds.length}` : 'backlog'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface AddCqForm {
  tier: '1' | '2';
  question: string;
  background: string;
  scenarioSid: string;
  customerAsk: string;
}

export function CqManagePage(): JSX.Element {
  const [items, setItems] = useState<CqItem[]>(CQ_ITEMS);
  const [selectedId, setSelectedId] = useState<string>('CQ-001');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<AddCqForm>({ tier: '1', question: '', background: '', scenarioSid: '', customerAsk: '' });

  const filtered = items.filter((cq) => matchFilter(cq, filter));
  const selected = items.find((cq) => cq.id === selectedId) ?? items[0];

  const handleAdd = useCallback(() => {
    if (!form.question.trim()) return;
    const nextId = `CQ-${String(items.length + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().slice(0, 10);
    const newCq: CqItem = {
      id: nextId,
      tier: Number(form.tier) as 1 | 2,
      status: 'draft',
      question: form.question.trim(),
      background: form.background.trim(),
      entityCount: 0,
      relationCount: 0,
      entities: [],
      relations: [],
      cypher: `// ${nextId} 쿼리를 입력하세요\nMATCH (n) RETURN n LIMIT 10`,
      scenarioSid: form.scenarioSid || undefined,
      customerAsk: form.customerAsk.trim() || undefined,
      // 신규 CQ도 빌드업 자산: 등록 시점을 이력 첫 항목으로 기록(일회성 아님)
      provenance: [
        { round: '신규 등록', date: today, kind: 'registered', note: form.background.trim() || '신규 CQ 등록' },
      ],
    };
    setItems((prev) => [...prev, newCq]);
    setSelectedId(nextId);
    setFilter('all');
    setAddOpen(false);
    setForm({ tier: '1', question: '', background: '', scenarioSid: '', customerAsk: '' });
  }, [form, items.length]);

  return (
    <div className="op-page" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* 페이지 헤더 */}
      <div style={{ padding: '20px 28px 12px', flexShrink: 0, borderBottom: '1px solid var(--op-border)' }}>
        <div className="op-section-header" style={{ marginBottom: 0 }}>
          <h2>CQ 관리</h2>
          <p>Competency Question · 질의서 시나리오 ↔ CQ ↔ 산업부 보고 빌드업 추적</p>
        </div>
        <ScenarioCoverage onSelect={setSelectedId} activeSid={selected?.scenarioSid} />
      </div>

      {/* 2패널 레이아웃 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 좌 — CQ 목록 */}
        <div style={{ width: 300, flexShrink: 0, borderRight: '1px solid var(--op-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--op-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Competency Questions</span>
            <button
              data-tour-id="new-cq-btn"
              onClick={() => setAddOpen(true)}
              style={{ padding: '4px 10px', border: '1px solid var(--op-border)', borderRadius: 'var(--op-radius-sm)', background: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--op-text-primary)' }}
            >
              + CQ 추가
            </button>
          </div>

          {/* 필터 pills */}
          <div data-tour-id="cq-filter" style={{ padding: '8px 12px', display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--op-border)', flexShrink: 0 }}>
            {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: '1px solid transparent',
                  background: filter === key ? '#111' : 'var(--op-bg-base)',
                  color: filter === key ? '#fff' : 'var(--op-text-secondary)',
                  transition: 'all 0.1s',
                }}
              >
                {FILTER_LABELS[key]}
              </button>
            ))}
          </div>

          {/* CQ 카드 목록 */}
          <div data-tour-id="cq-list" style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {filtered.map((cq) => (
              <div
                key={cq.id}
                onClick={() => setSelectedId(cq.id)}
                style={{
                  padding: '10px 12px', borderRadius: 'var(--op-radius-sm)', marginBottom: 4, cursor: 'pointer',
                  border: selectedId === cq.id ? '2px solid #111' : '1px solid var(--op-border)',
                  background: selectedId === cq.id ? '#F5F5F7' : 'var(--op-bg-card)',
                  transition: 'all 0.1s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{cq.id}</span>
                  <Badge variant={STATUS_BADGE_VARIANT[cq.status]} label={STATUS_LABEL[cq.status]} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--op-text-secondary)', lineHeight: 1.5, marginBottom: 5 }}>
                  {cq.question.length > 60 ? cq.question.slice(0, 60) + '…' : cq.question}
                </div>
                <div style={{ fontSize: 11, color: 'var(--op-text-tertiary)' }}>
                  Tier {cq.tier} · 엔티티 {cq.entityCount}개 · 관계 {cq.relationCount}개
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--op-text-tertiary)', fontSize: 13 }}>
                해당 필터 결과 없음
              </div>
            )}
          </div>
        </div>

        {/* 우 - CQ 상세 */}
        {selected ? (
          <div data-tour-id="cq-detail" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <CqDetailPanel key={selected.id} cq={selected} />
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--op-text-tertiary)' }}>
            CQ를 선택하세요
          </div>
        )}
      </div>

      {/* CQ 추가 모달 */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="신규 CQ 등록" width={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--op-text-secondary)', marginBottom: 6 }}>Tier</label>
            <select
              value={form.tier}
              onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value as '1' | '2' }))}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--op-border)', borderRadius: 'var(--op-radius-sm)', fontSize: 13, background: 'white' }}
            >
              <option value="1">Tier 1 (필수 시연)</option>
              <option value="2">Tier 2 (고객 확인)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--op-text-secondary)', marginBottom: 6 }}>질의서 시나리오 (선택)</label>
            <select
              value={form.scenarioSid}
              onChange={(e) => setForm((f) => ({ ...f, scenarioSid: e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--op-border)', borderRadius: 'var(--op-radius-sm)', fontSize: 13, background: 'white' }}
            >
              <option value="">- 미지정 -</option>
              {SURVEY_SCENARIOS.map((s) => (
                <option key={s.sid} value={s.sid}>{s.sid} · {s.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--op-text-secondary)', marginBottom: 6 }}>질문 *</label>
            <textarea
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              placeholder="온톨로지가 답해야 할 핵심 질문을 입력하세요"
              rows={3}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--op-border)', borderRadius: 'var(--op-radius-sm)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--op-text-secondary)', marginBottom: 6 }}>배경 (선택)</label>
            <textarea
              value={form.background}
              onChange={(e) => setForm((f) => ({ ...f, background: e.target.value }))}
              placeholder="질문 등록 배경, 고객 니즈, 활용 시나리오 등"
              rows={2}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--op-border)', borderRadius: 'var(--op-radius-sm)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--op-text-secondary)', marginBottom: 6 }}>고객 질의 (선택)</label>
            <textarea
              value={form.customerAsk}
              onChange={(e) => setForm((f) => ({ ...f, customerAsk: e.target.value }))}
              placeholder="이 CQ로 고객에게 확인할 우선순위·데이터 의향 (질의서 연동)"
              rows={2}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--op-border)', borderRadius: 'var(--op-radius-sm)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
            <button
              onClick={() => setAddOpen(false)}
              style={{ padding: '8px 16px', border: '1px solid var(--op-border)', borderRadius: 'var(--op-radius-sm)', background: 'white', fontSize: 13, cursor: 'pointer' }}
            >
              취소
            </button>
            <button
              onClick={handleAdd}
              disabled={!form.question.trim()}
              style={{ padding: '8px 16px', border: 'none', borderRadius: 'var(--op-radius-sm)', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, cursor: form.question.trim() ? 'pointer' : 'not-allowed', opacity: form.question.trim() ? 1 : 0.5 }}
            >
              등록
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
