"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import Pagination from "@/components/Pagination";
import { useAuth } from "@/context/AuthContext";
import { fetchJson } from "@/lib/fetchJson";
import { IconSearch, IconPlus, IconEye, IconPencil, IconTrash } from "@/components/Icons";

const CATEGORIES = ["", "Eletrônicos", "Periféricos", "Monitores", "Mobiliário", "Acessórios", "Outros"];

interface ApiResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "8" });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (activeFilter !== "") params.set("active", activeFilter);

    try {
      const data = await fetchJson<ApiResponse>(`/api/products?${params}`);
      setResult(data);
    } catch {
      // fetchJson redirects to /login on 401
    } finally {
      setLoading(false);
    }
  }, [page, search, category, activeFilter]);

  useEffect(() => { load(1); setPage(1); }, [search, category, activeFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Excluir o produto "${name}"?`)) return;
    try {
      await fetchJson(`/api/products/${id}`, { method: "DELETE" });
      load(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  const hasFilters = !!(search || category || activeFilter);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Produtos</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {loading ? "Carregando..." : `${result?.total ?? 0} produto(s) encontrado(s)`}
          </p>
        </div>
        {isAdmin ? (
          <Link
            href="/products/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <IconPlus className="w-4 h-4" />
            Novo Produto
          </Link>
        ) : user !== null ? (
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-2 rounded-lg">
            Somente administradores podem gerenciar produtos
          </span>
        ) : null}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, descrição..."
              className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          >
            <option value="">Todas as categorias</option>
            {CATEGORIES.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          >
            <option value="">Todos os status</option>
            <option value="1">Ativos</option>
            <option value="0">Inativos</option>
          </select>
          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setCategory(""); setActiveFilter(""); }}
              className="text-sm text-slate-400 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Limpar filtros ×
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
              Carregando...
            </div>
          </div>
        ) : !result?.data.length ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <IconSearch className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Nenhum produto encontrado</p>
            <p className="text-slate-400 text-sm mt-1">
              {hasFilters ? "Tente ajustar os filtros" : "Comece cadastrando um produto"}
            </p>
            {isAdmin && !hasFilters && (
              <Link href="/products/new" className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                <IconPlus className="w-4 h-4" /> Cadastrar produto
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Foto</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produto</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preço</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estoque</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {result.data.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-4 py-3.5">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-slate-100 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
                            <IconSearch className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-800">{p.name}</p>
                        {p.description && (
                          <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">{p.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {p.category ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                            {p.category}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-slate-800 tabular-nums">
                        {Number(p.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-600 tabular-nums">
                        <span className={p.stock === 0 ? "text-red-500 font-medium" : ""}>{p.stock}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {p.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/products/${p.id}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all"
                          >
                            <IconEye className="w-3.5 h-3.5" />
                            Ver
                          </Link>
                          {isAdmin && (
                            <>
                              <Link
                                href={`/products/${p.id}/edit`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 transition-all"
                              >
                                <IconPencil className="w-3.5 h-3.5" />
                                Editar
                              </Link>
                              <button
                                onClick={() => handleDelete(p.id, p.name)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all"
                              >
                                <IconTrash className="w-3.5 h-3.5" />
                                Excluir
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
              limit={result.limit}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
