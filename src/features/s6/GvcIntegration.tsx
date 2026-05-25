import { gvcRepository } from '@/data/repository';
import { tierSummary, DOMAIN_LABEL } from '@/data/repository/adapters/gvcS6Adapter';
import type { GvcDomain } from '@/types';
import { Card } from '@/components/primitives';

const TIERS = ['소재', '부품', '장비'] as const;
const DOMAINS: GvcDomain[] = ['mach', 'semi'];

const SELF_SUFFICIENCY: Record<GvcDomain, { label: string; status: 'dependent' | 'balanced' }> = {
  mach: { label: '감속기·베어링 수입의존 (수입 > 수출)', status: 'dependent' },
  semi: { label: '실리콘웨이퍼·포토레지스트 수입의존', status: 'dependent' },
};

export function GvcIntegration(): JSX.Element {
  const summaries = Object.fromEntries(
    DOMAINS.map((d) => [d, tierSummary(gvcRepository.listProducts(d))]),
  ) as Record<GvcDomain, ReturnType<typeof tierSummary>>;

  return (
    <Card title="통합 시나리오 — 기계 × 반도체 GVC 교차 비교" sub="공통 가치사슬 단계 + 자립화 지표">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 공통 tier 교차 비교 */}
        <table className="dtable">
          <thead>
            <tr>
              <th>가치사슬 단계</th>
              {DOMAINS.map((d) => (
                <th key={d}>{DOMAIN_LABEL[d]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIERS.map((tier) => (
              <tr key={tier}>
                <td>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '1px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      background:
                        tier === '장비'
                          ? 'var(--axis-color-blue-100)'
                          : tier === '부품'
                            ? 'var(--axis-color-gray-100)'
                            : 'var(--axis-color-green-50)',
                      color:
                        tier === '장비'
                          ? 'var(--axis-color-blue-700)'
                          : 'var(--axis-text-secondary)',
                    }}
                  >
                    {tier}
                  </span>
                </td>
                {DOMAINS.map((d) => {
                  const items = summaries[d][tier];
                  return (
                    <td key={d} style={{ fontSize: 11.5 }}>
                      {items.length > 0 ? (
                        <span>{items.map((p) => p.label).join(' · ')}</span>
                      ) : (
                        <span style={{ color: 'var(--axis-text-tertiary)' }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* 자립화 지표 대조 */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--axis-text-secondary)',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            자립화 현황 (※ 가상 추정)
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {DOMAINS.map((d) => {
              const info = SELF_SUFFICIENCY[d];
              return (
                <div
                  key={d}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background:
                      info.status === 'dependent'
                        ? 'var(--axis-color-red-50)'
                        : 'var(--axis-color-green-50)',
                    border: `1px solid ${info.status === 'dependent' ? 'var(--axis-color-red-200)' : 'var(--axis-color-green-200)'}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--axis-text-primary)',
                      marginBottom: 4,
                    }}
                  >
                    {DOMAIN_LABEL[d]}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--axis-text-secondary)', lineHeight: 1.5 }}>
                    {info.status === 'dependent' && (
                      <span
                        style={{
                          color: 'var(--axis-color-red-600)',
                          fontWeight: 600,
                          marginRight: 4,
                        }}
                      >
                        ⚠
                      </span>
                    )}
                    {info.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            fontSize: 11,
            color: 'var(--axis-text-tertiary)',
            paddingTop: 8,
            borderTop: '1px solid var(--axis-line-soft)',
          }}
        >
          ※ 가치사슬 구조·자립화 현황은 산업보고서 기반 추정치(virt). 실 GIVC 연동 시 교체.
        </div>
      </div>
    </Card>
  );
}
