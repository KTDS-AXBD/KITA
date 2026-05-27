import { gvcRepository } from '@/data/repository';
import {
  adaptGvcGraph,
  adaptGvcLayout,
  adaptGvcKpis,
  anchorCode,
  DOMAIN_LABEL,
} from '@/data/repository/adapters/gvcS6Adapter';
import type { GvcDomain } from '@/types';
import { Card, KpiStrip } from '@/components/primitives';
import { KGraph } from '@/components/KGraph';
import { DataMark } from '@/components/DataMark';

interface Props {
  domain: GvcDomain;
}

export function GvcPane({ domain }: Props): JSX.Element {
  const products = gvcRepository.listProducts(domain);
  const edges = gvcRepository.getNetwork(domain);
  const graph = adaptGvcGraph(products, edges);
  const positioned = adaptGvcLayout(graph);
  const anchor = anchorCode(products);
  const allMetrics = gvcRepository.listMetrics(anchor);
  const kpis = adaptGvcKpis(anchor, allMetrics);

  const anchorProduct = products.find((p) => p.gvcCode === anchor);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingBottom: 10,
          borderBottom: '1px solid var(--axis-line-soft)',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--axis-text-primary)' }}>
          {DOMAIN_LABEL[domain]}
        </span>
        {anchorProduct && (
          <span
            style={{
              fontSize: 11,
              color: 'var(--axis-text-tertiary)',
              fontFamily: 'var(--axis-font-mono)',
            }}
          >
            anchor: {anchorProduct.label}
          </span>
        )}
        <DataMark kind="virt" withLabel />
      </div>

      <KpiStrip items={kpis} />

      <Card
        title={`가치사슬 구조 — ${DOMAIN_LABEL[domain]}`}
        sub="소재 → 부품 → 장비 (※ 가상 가치사슬)"
        flushBody
      >
        <KGraph graph={positioned} highlightFrom={null} />
      </Card>

      <Card title="제품 목록" sub="tier 별">
        <table className="dtable">
          <thead>
            <tr>
              <th>제품</th>
              <th>tier</th>
              <th>HS</th>
              <th>출처</th>
            </tr>
          </thead>
          <tbody>
            {products
              .slice()
              .sort((a, b) => (b.sort ?? 0) - (a.sort ?? 0))
              .map((p) => (
                <tr key={p.gvcCode}>
                  <td className="col-name">{p.label}</td>
                  <td>{p.tier ?? '—'}</td>
                  <td style={{ fontFamily: 'var(--axis-font-mono)', fontSize: 11 }}>
                    {p.hsCodes.join(', ')}
                  </td>
                  <td>
                    <DataMark kind={p.provenance} withLabel={false} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
