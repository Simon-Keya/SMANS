// components/shared/DataTable.tsx
"use client";

import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Input } from "@/components/ui/Input";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { useMemo, useState } from "react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  caption?: string;
  rowKey?: keyof T | ((row: T) => string);
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  actionsLabel?: string;
}

type SortDirection = "asc" | "desc" | null;

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = false,
  searchPlaceholder = "Search...",
  searchKeys,
  emptyTitle = "No records found",
  emptyDescription = "There is nothing to display here yet.",
  emptyIcon,
  caption,
  rowKey = "id",
  onRowClick,
  actions,
  actionsLabel = "Actions",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  // ── Search ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return data;

    const q = search.toLowerCase();
    const keys = searchKeys ?? (columns.map((c) => c.key) as (keyof T)[]);

    return data.filter((row) =>
      keys.some((k) => {
        const val = row[k as keyof T];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, searchKeys, columns]);

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;

    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  }

  function getRowKey(row: T, index: number): string {
    if (typeof rowKey === "function") return rowKey(row);
    return String(row[rowKey as keyof T] ?? index);
  }

  function SortIcon({ col }: { col: Column<T> }) {
    if (!col.sortable) return null;
    const key = String(col.key);
    if (sortKey !== key) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
    if (sortDir === "asc") return <ChevronUp className="h-3.5 w-3.5 text-primary" />;
    return <ChevronDown className="h-3.5 w-3.5 text-primary" />;
  }

  return (
    <div className="w-full space-y-4">
      {/* Search bar */}
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 bg-base-200 border-neutral/40 rounded-xl focus:border-primary"
          />
        </div>
      )}

      {/* Table container */}
      <div className="rounded-xl border border-neutral/30 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 flex items-center justify-center bg-base-100">
            <LoadingSpinner size="lg" label="Loading data..." />
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 bg-base-100">
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              icon={emptyIcon}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {caption && (
                <caption className="px-4 py-2 text-xs text-base-content/50 text-left bg-base-200 border-b border-neutral/20">
                  {caption}
                </caption>
              )}
              <thead>
                <tr className="bg-base-200 border-b border-neutral/30">
                  {columns.map((col) => (
                    <th
                      key={String(col.key)}
                      className={`px-4 py-3 text-left font-semibold text-base-content/70 text-xs uppercase tracking-wider whitespace-nowrap ${col.className ?? ""} ${
                        col.sortable ? "cursor-pointer select-none hover:text-primary transition-colors" : ""
                      }`}
                      onClick={col.sortable ? () => toggleSort(String(col.key)) : undefined}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {col.label}
                        <SortIcon col={col} />
                      </span>
                    </th>
                  ))}
                  {actions && (
                    <th className="px-4 py-3 text-right font-semibold text-base-content/70 text-xs uppercase tracking-wider">
                      {actionsLabel}
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral/20 bg-base-100">
                {sorted.map((row, index) => (
                  <tr
                    key={getRowKey(row, index)}
                    className={`transition-colors ${
                      onRowClick
                        ? "cursor-pointer hover:bg-base-200/70"
                        : "hover:bg-base-200/40"
                    }`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className={`px-4 py-3 text-base-content whitespace-nowrap ${col.className ?? ""}`}
                      >
                        {col.render
                          ? col.render(row)
                          : String(row[col.key as keyof T] ?? "—")}
                      </td>
                    ))}
                    {actions && (
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Row count */}
      {!loading && sorted.length > 0 && (
        <p className="text-xs text-base-content/50 pl-1">
          Showing {sorted.length} of {data.length} record{data.length !== 1 ? "s" : ""}
          {search && ` matching "${search}"`}
        </p>
      )}
    </div>
  );
}