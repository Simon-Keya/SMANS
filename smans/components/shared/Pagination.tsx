// components/shared/Pagination.tsx
"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showSummary?: boolean;
  showFirstLast?: boolean;
  siblingCount?: number;
  className?: string;
}

function getPageRange(
  current: number,
  total: number,
  siblings: number
): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const left = Math.max(2, current - siblings);
  const right = Math.min(total - 1, current + siblings);

  const showLeftDots = left > 2;
  const showRightDots = right < total - 1;

  const pages: (number | "...")[] = [1];

  if (showLeftDots) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (showRightDots) pages.push("...");
  pages.push(total);

  return pages;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showSummary = true,
  showFirstLast = true,
  siblingCount = 1,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1 && !onPageSizeChange) return null;

  const pages = getPageRange(page, totalPages, siblingCount);

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems ?? page * pageSize);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Summary / page size selector */}
      <div className="flex items-center gap-4 text-sm text-base-content/60">
        {showSummary && totalItems != null && (
          <span>
            Showing <span className="font-medium text-base-content">{start}–{end}</span>{" "}
            of <span className="font-medium text-base-content">{totalItems}</span>
          </span>
        )}

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs whitespace-nowrap">Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1); // reset to first page on size change
              }}
              className="bg-base-200 border border-neutral/30 rounded-lg px-2 py-1 text-xs text-base-content focus:outline-none focus:border-primary"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First page */}
          {showFirstLast && (
            <button
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-base-content/40 hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}

          {/* Previous */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-base-content/40 hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          {pages.map((p, i) =>
            p === "..." ? (
              <span
                key={`dots-${i}`}
                className="px-1.5 py-1 text-base-content/30 text-sm select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`min-w-[2rem] h-8 rounded-lg text-sm font-medium transition-all ${
                  p === page
                    ? "bg-primary text-primary-content shadow-sm shadow-primary/30"
                    : "text-base-content/60 hover:text-primary hover:bg-primary/10"
                }`}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg text-base-content/40 hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last page */}
          {showFirstLast && (
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-base-content/40 hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── usePagination hook (can live in hooks/usePagination.ts too) ──────────────

export function usePagination<T>(items: T[], defaultPageSize = 10) {
  const [page, setPage] = require("react").useState(1);
  const [pageSize, setPageSize] = require("react").useState(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const paginated = items.slice((page - 1) * pageSize, page * pageSize);

  function changePage(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  function changePageSize(s: number) {
    setPageSize(s);
    setPage(1);
  }

  return {
    page,
    pageSize,
    totalPages,
    totalItems: items.length,
    paginated,
    changePage,
    changePageSize,
  };
}