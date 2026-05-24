import type { Provenance } from '@/types';

interface DataMarkProps {
  kind: Provenance;
  /** false 시 첫 글자(⭐/△/※)만 노출 */
  withLabel?: boolean;
}

const CONFIG: Record<Provenance, { cls: string; label: string; tip: string }> = {
  real: { cls: 'dchip-real', label: '⭐ 실', tip: '실데이터' },
  est: { cls: 'dchip-est', label: '△ 추정', tip: '추정' },
  virt: { cls: 'dchip-virt', label: '※ 가상', tip: '시연용 가상' },
};

export function DataMark({ kind, withLabel = true }: DataMarkProps): JSX.Element {
  const cfg = CONFIG[kind];
  const text = withLabel ? cfg.label : cfg.label.split(' ')[0];
  return (
    <span className={`dchip ${cfg.cls}`} title={cfg.tip}>
      {text}
    </span>
  );
}
