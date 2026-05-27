import { useState, useMemo } from 'react';
import type { GvcDomain } from '@/types';
import { Card } from '@/components/primitives';
import { DataMark } from '@/components/DataMark';
import {
  QUERY_CATALOG,
  resolveTemplate,
  type QueryId,
} from '@/data/queries/chatgivc-catalog';
import { executeQuery } from '@/data/queries/chatgivc-executor';

interface Props {
  domain: GvcDomain;
}

const SQL_STYLE_REAL: React.CSSProperties = {
  margin: 0,
  padding: '10px 12px',
  background: 'var(--axis-color-gray-900)',
  color: 'var(--axis-color-green-300)',
  fontFamily: 'var(--axis-font-mono)',
  fontSize: 11,
  borderRadius: 6,
  overflowX: 'auto',
  lineHeight: 1.65,
  whiteSpace: 'pre',
};

const SQL_STYLE_MIRROR: React.CSSProperties = {
  ...SQL_STYLE_REAL,
  background: 'var(--axis-color-blue-950)',
  color: 'var(--axis-color-blue-200)',
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: 'var(--axis-text-tertiary)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: 4,
};

const SUB_STYLE: React.CSSProperties = {
  fontSize: 10,
  color: 'var(--axis-text-tertiary)',
  marginTop: 4,
  fontFamily: 'var(--axis-font-mono)',
};

export function ChatGivcQueryPane({ domain }: Props): JSX.Element {
  const [selectedId, setSelectedId] = useState<QueryId>('L1');

  const entry = QUERY_CATALOG.find((q) => q.id === selectedId)!;
  const realSql = resolveTemplate(entry.realSqlTemplate, domain);
  const mirrorSql = entry.mirrorSqlTemplate
    ? resolveTemplate(entry.mirrorSqlTemplate, domain)
    : undefined;

  const liveResult = useMemo(
    () => (entry.kind === 'live' ? executeQuery(selectedId, domain) : null),
    [selectedId, domain, entry.kind],
  );

  const result = entry.kind === 'live'
    ? liveResult
    : entry.curatedResult
      ? { columns: entry.curatedResult.columns, rows: entry.curatedResult.rows }
      : null;

  const resultProvenance = entry.kind === 'live'
    ? entry.provenance
    : (entry.curatedResult?.provenance ?? 'virt');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ─ 쿼리 선택 버튼 ─ */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {QUERY_CATALOG.map((q) => {
          const qLabel = resolveTemplate(q.label, domain);
          const isSelected = q.id === selectedId;
          return (
            <button
              key={q.id}
              className={`btn btn-sm${isSelected ? ' btn-primary' : ''}`}
              style={{ fontSize: 11 }}
              onClick={() => setSelectedId(q.id)}
            >
              {q.kind === 'live' ? '⭐' : '△'} {qLabel}
            </button>
          );
        })}
      </div>

      {/* ─ SQL 병기 (실 SQL | 미러 SQL) ─ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mirrorSql ? '1fr 1fr' : '1fr',
          gap: 10,
        }}
      >
        {/* 실 ChatGIVC SQL */}
        <div>
          <div style={LABEL_STYLE}>실 ChatGIVC SQL</div>
          <pre style={SQL_STYLE_REAL}>{realSql}</pre>
          <div style={SUB_STYLE}>
            scmm_his_chart · product_network · mart.*
          </div>
        </div>

        {/* 데모 미러 SQL (live만) */}
        {mirrorSql && (
          <div>
            <div style={LABEL_STYLE}>
              데모 미러 SQL{' '}
              <span style={{ color: 'var(--axis-color-blue-400)' }}>↪ 실행</span>
            </div>
            <pre style={SQL_STYLE_MIRROR}>{mirrorSql}</pre>
            <div style={SUB_STYLE}>gvc_metrics · gvc_network (D1 미러)</div>
          </div>
        )}
      </div>

      {/* ─ 결과 ─ */}
      {result && (
        <Card
          title="결과"
          sub={
            entry.kind === 'live'
              ? '⭐ 미러 실행 — 실 결과'
              : '큐레이션 정적 결과'
          }
          flushBody
        >
          {/* 출처 배지 + 메시지 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderBottom: '1px solid var(--axis-line-soft)',
            }}
          >
            <DataMark kind={resultProvenance} withLabel />
            <span style={{ fontSize: 11, color: 'var(--axis-text-tertiary)' }}>
              {entry.kind === 'live'
                ? '"실 GIVC는 이렇게 / 데모는 의미명 미러로 재현" — 본사업화 시 실 SQL이 직결'
                : 'mart.* 의존 — 공개데이터 / 큐레이션 기반'}
            </span>
          </div>

          {/* 결과 테이블 */}
          <table className="dtable">
            <thead>
              <tr>
                {result.columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        fontFamily:
                          typeof cell === 'number'
                            ? 'var(--axis-font-mono)'
                            : undefined,
                      }}
                    >
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
              {result.rows.length === 0 && (
                <tr>
                  <td
                    colSpan={result.columns.length}
                    style={{
                      textAlign: 'center',
                      color: 'var(--axis-text-tertiary)',
                      padding: '12px 0',
                    }}
                  >
                    결과 없음
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
