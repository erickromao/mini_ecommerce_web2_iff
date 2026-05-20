"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { User } from "@/lib/types";
import Pagination from "@/components/Pagination";

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

    const res = await fetch(`/api/users?${params}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }, [page, search, roleFilter, activeFilter]);

  useEffect(() => { load(1); setPage(1); }, [search, roleFilter, activeFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Excluir o usuário "${name}"?`)) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    load(page);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Usuários</h2>
          <p className="text-gray-500 text-sm mt-1">{result?.total ?? "..."} usuário(s) encontrado(s)</p>
        </div>
        <Link href="/users/new" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Novo Usuário
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">Todos os perfis</option>
          <option value="admin">Admin</option>
          <option value="user">Usuário</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">Todos os status</option>
          <option value="1">Ativos</option>
          <option value="0">Inativos</option>
        </select>
        {(search || roleFilter || activeFilter) && (
          <button onClick={() => { setSearch(""); setRoleFilter(""); setActiveFilter(""); }} className="text-sm text-gray-400 hover:text-gray-600 px-2">
            Limpar ×
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Carregando...</div>
        ) : !result?.data.length ? (
          <div className="text-center py-16 text-gray-400">
            Nenhum usuário encontrado.{" "}
            <Link href="/users/new" className="text-purple-600 underline">Cadastrar agora</Link>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">ID</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Nome</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Email</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-medium">Perfil</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {result.data.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-400">#{u.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{u.name}</td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                        {u.role === "admin" ? "Admin" : "Usuário"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {u.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/users/${u.id}/edit`} className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                          Editar
                        </Link>
                        <button onClick={() => handleDelete(u.id, u.name)} className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
