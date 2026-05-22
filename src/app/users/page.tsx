"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { User } from "@/lib/types";
import Pagination from "@/components/Pagination";
import { fetchJson } from "@/lib/fetchJson";
import { IconSearch, IconPlus, IconEye, IconPencil, IconTrash, IconShield } from "@/components/Icons";

interface ApiResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UsersPage() {
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "8" });
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    if (activeFilter !== "") params.set("active", activeFilter);

    try {
      const data = await fetchJson<ApiResponse>(`/api/users?${params}`);
      setResult(data);
    } catch {
      // fetchJson redirects to /login on 401
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, activeFilter]);

  useEffect(() => { load(1); setPage(1); }, [search, roleFilter, activeFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Excluir o usuário "${name}"?`)) return;
    try {
      await fetchJson(`/api/users/${id}`, { method: "DELETE" });
      load(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  const hasFilters = !!(search || roleFilter || activeFilter);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Usuários</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {loading ? "Carregando..." : `${result?.total ?? 0} usuário(s) encontrado(s)`}
          </p>
        </div>
        <Link
          href="/users/new"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <IconPlus className="w-4 h-4" />
          Novo Usuário
        </Link>
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
              placeholder="Buscar por nome ou email..."
              className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
          >
            <option value="">Todos os perfis</option>
            <option value="admin">Admin</option>
            <option value="user">Usuário</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
          >
            <option value="">Todos os status</option>
            <option value="1">Ativos</option>
            <option value="0">Inativos</option>
          </select>
          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setRoleFilter(""); setActiveFilter(""); }}
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
              <div className="w-4 h-4 border-2 border-slate-300 border-t-violet-500 rounded-full animate-spin" />
              Carregando...
            </div>
          </div>
        ) : !result?.data.length ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <IconSearch className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Nenhum usuário encontrado</p>
            <p className="text-slate-400 text-sm mt-1">
              {hasFilters ? "Tente ajustar os filtros" : "Comece cadastrando um usuário"}
            </p>
            {!hasFilters && (
              <Link href="/users/new" className="mt-4 inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium">
                <IconPlus className="w-4 h-4" /> Cadastrar usuário
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuário</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Perfil</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {result.data.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-sm font-semibold text-violet-700 shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400">#{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-sm">{u.email}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {u.role === "admin" && <IconShield className="w-3 h-3" />}
                          {u.role === "admin" ? "Admin" : "Usuário"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {u.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/users/${u.id}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-violet-700 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 transition-all"
                          >
                            <IconEye className="w-3.5 h-3.5" />
                            Ver
                          </Link>
                          <Link
                            href={`/users/${u.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 transition-all"
                          >
                            <IconPencil className="w-3.5 h-3.5" />
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                            Excluir
                          </button>
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
