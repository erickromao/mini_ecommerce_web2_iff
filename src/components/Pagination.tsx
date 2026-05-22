"use client";

import { IconChevronLeft, IconChevronRight } from "@/components/Icons";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, limit, onChange }: Props) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "…")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 text-sm">
      <span className="text-slate-500 text-xs">
        {from}–{to} de <span className="font-medium text-slate-700">{total}</span> registro(s)
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50 hover:text-slate-800 transition-all"
        >
          <IconChevronLeft className="w-3.5 h-3.5" />
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                p === page
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50 hover:text-slate-800 transition-all"
        >
          <IconChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
