interface Column {
  key: string;
  label: string;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  rows: Record<string, React.ReactNode>[];
}

/**
 * 데이터 테이블. 헤더(mono 대문자 라벨)·hover·sticky·헤어라인은
 * 디자인 시스템(app.css `.op-table`)에서 관리. 여기선 구조와 col width만.
 */
export function DataTable({ columns, rows }: DataTableProps): JSX.Element {
  return (
    <table className="op-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} style={col.width ? { width: col.width } : undefined}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((col, j) => (
              <td key={col.key} style={j === 0 ? { whiteSpace: 'nowrap' } : undefined}>
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
