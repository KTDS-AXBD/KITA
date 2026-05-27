import { useState } from 'react';
import { KpiCard, EntityCard, Modal } from '@/components/platform';
import { ONTOLOGY_ENTITIES, ONTOLOGY_RELATIONS, ONTOLOGY_CONSTRAINTS, OntologyRelation } from './ontologyData';

const KPI_DATA = [
  { label: '엔티티 타입', value: 13, sub: '공급망 개체 분류 체계', tooltip: '온톨로지에서 정의하는 개체(Class)의 종류. 실세계 사물·개념을 추상화한 단위' },
  { label: '관계 타입', value: 8, sub: '엔티티 간 의미적 연결', tooltip: '엔티티 간 연결(Property/Predicate)의 종류. 투입된다·수출한다 등 의미적 관계' },
  { label: '총 인스턴스', value: 161, sub: '실제 데이터 건수 합', tooltip: '각 엔티티 타입에 속하는 실제 데이터 건수의 합. 예: Country 타입에 24개 국가 인스턴스' },
  { label: '총 관계', value: 331, sub: '그래프 엣지 총 수', tooltip: 'Knowledge Graph에 적재된 엣지(연결)의 총 수' },
];

function RelAttrTooltip({ name, tooltip }: { name: string; tooltip: string }): JSX.Element {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{ padding: '1px 7px', borderRadius: 3, background: 'var(--op-bg-base)', fontSize: 11, cursor: 'default', border: '1px solid var(--op-border)' }}>
        {name}
        <span style={{ marginLeft: 3, color: 'var(--op-text-tertiary)', fontSize: 10 }}>i</span>
      </span>
      {show && (
        <span style={{
          position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)',
          background: '#111', color: '#fff', fontSize: 11, padding: '6px 10px', borderRadius: 6,
          whiteSpace: 'nowrap', zIndex: 10, maxWidth: 240, lineHeight: 1.5,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          {tooltip}
        </span>
      )}
    </span>
  );
}

function RelationModal({ rel, onClose }: { rel: OntologyRelation; onClose: () => void }): JSX.Element {
  return (
    <Modal open onClose={onClose} title={`관계: ${rel.name}`} width={480}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-tertiary)', marginBottom: 4 }}>설명</div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--op-text-secondary)' }}>{rel.tooltip}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-tertiary)', marginBottom: 4 }}>출발 엔티티</div>
            <span style={{ padding: '3px 10px', borderRadius: 4, background: '#F5F5F5', fontSize: 13, fontWeight: 600 }}>{rel.from}</span>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-tertiary)', marginBottom: 4 }}>도착 엔티티</div>
            <span style={{ padding: '3px 10px', borderRadius: 4, background: '#F5F5F5', fontSize: 13, fontWeight: 600 }}>{rel.to}</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-tertiary)', marginBottom: 6 }}>관계 속성</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {rel.attrs.map((a) => (
              <RelAttrTooltip key={a.name} name={a.name} tooltip={a.tooltip} />
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--op-text-tertiary)', marginBottom: 4 }}>데이터 출처</div>
          <div style={{ fontSize: 13 }}>{rel.source}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 20px', border: 'none', borderRadius: 'var(--op-radius-sm)', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function OntologyPage(): JSX.Element {
  const [selectedRel, setSelectedRel] = useState<OntologyRelation | null>(null);

  return (
    <div className="op-page">
      <div className="op-section-header">
        <h2>온톨로지 모델 정의</h2>
        <p>소부장·호르무즈 공통 스키마 · 엔티티 13종 · 관계 8종 · 속성 정의 · 속성에 마우스를 올리면 설명이 표시됩니다</p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {KPI_DATA.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} sub={kpi.sub} />
        ))}
      </div>

      {/* 엔티티 카드 grid */}
      <div style={{ background: 'var(--op-bg-card)', borderRadius: 'var(--op-radius)', border: '1px solid var(--op-border)', padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>엔티티 정의</h3>
          <span style={{ fontSize: 12, color: 'var(--op-text-tertiary)' }}>13종 · 총 인스턴스 161</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {ONTOLOGY_ENTITIES.map((e) => (
            <EntityCard
              key={e.label}
              title={`${e.label} (${e.labelKr})`}
              subtitle={e.subtitle}
              colorBlock={e.colorHex}
              attrs={e.attrs.map((a) => a.name)}
              count={e.count}
            />
          ))}
        </div>
      </div>

      {/* 관계 정의 테이블 */}
      <div style={{ background: 'var(--op-bg-card)', borderRadius: 'var(--op-radius)', border: '1px solid var(--op-border)', marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--op-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700 }}>관계 정의</span>
            <span style={{ fontSize: 12, color: 'var(--op-text-tertiary)', marginLeft: 8 }}>엔티티 간 의미적 연결(Object Property) · 행 클릭 시 상세</span>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--op-bg-base)' }}>
              {['관계', '출발', '도착', '속성', '데이터 출처'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--op-text-tertiary)', fontWeight: 600, fontSize: 11, borderBottom: '1px solid var(--op-border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ONTOLOGY_RELATIONS.map((rel) => (
              <tr
                key={rel.name}
                onClick={() => setSelectedRel(rel)}
                style={{ cursor: 'pointer', borderBottom: '1px solid var(--op-border)', transition: 'background 0.1s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--op-bg-base)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
              >
                <td style={{ padding: '10px 16px', fontWeight: 600 }}>{rel.name}</td>
                <td style={{ padding: '10px 16px', color: 'var(--op-text-secondary)' }}>{rel.from}</td>
                <td style={{ padding: '10px 16px', color: 'var(--op-text-secondary)' }}>{rel.to}</td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {rel.attrs.map((a) => (
                      <RelAttrTooltip key={a.name} name={a.name} tooltip={a.tooltip} />
                    ))}
                  </div>
                </td>
                <td style={{ padding: '10px 16px', color: 'var(--op-text-secondary)', fontSize: 12 }}>{rel.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 제약 정의 (다크 블록) */}
      <div style={{ background: 'var(--op-bg-card)', borderRadius: 'var(--op-radius)', border: '1px solid var(--op-border)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--op-border)' }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>온톨로지 제약 (Constraints)</span>
          <span style={{ fontSize: 12, color: 'var(--op-text-tertiary)', marginLeft: 8 }}>Neo4j 5.x+ · 데이터 정합성 보장</span>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {ONTOLOGY_CONSTRAINTS.map((c) => (
            <div key={c.label}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--op-text-secondary)', marginBottom: 8 }}>{c.label}</div>
              <pre style={{
                background: '#1E1E2E',
                color: '#CDD6F4',
                borderRadius: 'var(--op-radius-sm)',
                padding: '16px 20px',
                fontFamily: "'JetBrains Mono','Fira Code',monospace",
                fontSize: 11,
                lineHeight: 1.8,
                overflowX: 'auto',
                margin: 0,
              }}>
                {c.cypher.split('\n').map((line, i) => {
                  const isComment = line.trim().startsWith('//');
                  const keywords = ['CREATE', 'CONSTRAINT', 'IF', 'NOT', 'EXISTS', 'FOR', 'REQUIRE', 'IS', 'NULL', 'AND', 'OR'];
                  if (isComment) {
                    return <span key={i} style={{ color: '#6C7086', fontStyle: 'italic' }}>{line + '\n'}</span>;
                  }
                  const parts = line.split(/\b/);
                  return (
                    <span key={i}>
                      {parts.map((part, j) => (
                        <span key={j} style={{ color: keywords.includes(part.toUpperCase()) ? '#89B4FA' : '#CDD6F4' }}>
                          {part}
                        </span>
                      ))}
                      {'\n'}
                    </span>
                  );
                })}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* 관계 상세 모달 */}
      {selectedRel && (
        <RelationModal rel={selectedRel} onClose={() => setSelectedRel(null)} />
      )}
    </div>
  );
}
