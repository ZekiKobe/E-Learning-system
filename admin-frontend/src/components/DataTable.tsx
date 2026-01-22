import { useMemo, useState } from 'react';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  sortable?: boolean;
  className?: string;
  alignRight?: boolean;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  emptyMessage?: string;
  initialPageSize?: number;
}

type SortDirection = 'asc' | 'desc';

export function DataTable<T>({
  rows,
  columns,
  emptyMessage = 'No records found.',
  initialPageSize = 10
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedRows = useMemo(() => {
    if (!sortColumn) return rows;
    const column = columns.find((c) => c.id === sortColumn);
    if (!column || !column.sortable) return rows;

    const getVal = column.sortValue ?? ((row: any) => row[column.id]);

    return [...rows].sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (va == null && vb == null) return 0;
      if (va == null) return sortDirection === 'asc' ? -1 : 1;
      if (vb == null) return sortDirection === 'asc' ? 1 : -1;
      if (va < vb) return sortDirection === 'asc' ? -1 : 1;
      if (va > vb) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, columns, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageRows = sortedRows.slice(startIndex, endIndex);

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;
    if (sortColumn === column.id) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column.id);
      setSortDirection('asc');
    }
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/5">
            <tr className="text-xs uppercase tracking-wide admin-text-muted">
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={`px-4 py-3 font-semibold ${
                    col.alignRight ? 'text-right' : ''
                  } ${col.className ?? ''}`}
                  onClick={() => handleSort(col)}
                >
                  <span
                    className={`inline-flex items-center gap-1 ${
                      col.sortable ? 'cursor-pointer select-none' : ''
                    }`}
                  >
                    {col.header}
                    {sortColumn === col.id && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, idx) => (
              <tr
                key={idx}
                className="border-t admin-border-subtle hover:bg-slate-900/5 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`px-4 py-3 ${
                      col.alignRight ? 'text-right' : ''
                    } ${col.className ?? ''}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="text-center py-6 text-sm admin-text-muted">
          {emptyMessage}
        </p>
      )}

      {rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs admin-text-muted">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border admin-border-subtle bg-transparent"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>
              Showing {startIndex + 1}-{Math.min(endIndex, sortedRows.length)} of{' '}
              {sortedRows.length}
            </span>
          </div>
          <div className="inline-flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border admin-border-subtle disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border admin-border-subtle disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


