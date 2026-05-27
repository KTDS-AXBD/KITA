interface Column {
  key: string;
  label: string;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  rows: Record<string, React.ReactNode>[];
}

export function DataTable({ columns, rows }: DataTableProps): JSX.Element {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: 12,
                color: 'var(--op-text-secondary)',
                borderBottom: '2px solid var(--op-border)',
                background: '#FAFBFD',
                whiteSpace: 'nowrap',
                width: col.width,
              }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            style={{ cursor: 'default' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#F8F9FC'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
          >
            {columns.map((col, j) => (
              <td
                key={col.key}
                style={{
                  padding: '10px 12px',
                  borderBottom: i < rows.length - 1 ? '1px solid var(--op-border)' : 'none',
                  verticalAlign: 'top',
                  whiteSpace: j === 0 ? 'nowrap' : undefined,
                }}
              >
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
