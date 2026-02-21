"use client";

import { pt } from "@/shared/i18n/pt";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100] as const;

export interface TablePaginationProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
  pageSizeOptions?: number[];
  /** Optional: current data page from API (for display); defaults to `page` */
  currentPageFromApi?: number;
}

export const TablePagination = ({
  total,
  page,
  limit,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [...DEFAULT_PAGE_SIZE_OPTIONS],
  currentPageFromApi,
}: TablePaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const displayPage = currentPageFromApi ?? page;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span>{pt.itemsPerPage}</span>
          <select
            value={limit}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm bg-white"
            aria-label={pt.itemsPerPage}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-gray-500">
          {pt.resultsCount(total)} · {pt.pageOf(displayPage, totalPages)}
        </span>
      </div>
      <nav
        role="navigation"
        aria-label="Paginação"
        className="flex items-center gap-1"
      >
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
          aria-label={pt.previous}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {pt.previous}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
          aria-label={pt.next}
        >
          {pt.next}
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </nav>
    </div>
  );
};
