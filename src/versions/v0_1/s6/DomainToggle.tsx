import { useGvcDomainStore } from '@/store';
import type { GvcDomain } from '@/types';
import { DOMAIN_LABEL } from '@/data/repository/adapters/gvcS6Adapter';

const DOMAINS: GvcDomain[] = ['mach', 'semi'];

export function DomainToggle(): JSX.Element {
  const activeDomain = useGvcDomainStore((s) => s.activeDomain);
  const setDomain = useGvcDomainStore((s) => s.setDomain);

  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 4,
        padding: '3px 4px',
        background: 'var(--axis-color-gray-100)',
        borderRadius: 8,
      }}
    >
      {DOMAINS.map((d) => {
        const active = d === activeDomain;
        return (
          <button
            key={d}
            onClick={() => setDomain(d)}
            style={{
              padding: '5px 14px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              background: active ? 'var(--axis-color-blue-600)' : 'transparent',
              color: active ? '#fff' : 'var(--axis-text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            {DOMAIN_LABEL[d]}
          </button>
        );
      })}
    </div>
  );
}
