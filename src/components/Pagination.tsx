"use client";

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

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
      <span>
        {from}–{to} de {total} registro(s)
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          ‹
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | "…")[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="px-2">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p as number)}
                className={`px-3 py-1 rounded border transition-colors ${
                  p === page
                    ? "bg-slate-800 text-white border-slate-800"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            )
          )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  );
}
