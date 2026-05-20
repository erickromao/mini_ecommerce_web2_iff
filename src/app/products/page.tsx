"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import Pagination from "@/components/Pagination";
import { useAuth } from "@/context/AuthContext";
import { fetchJson } from "@/lib/fetchJson";

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Produtos</h2>
          <p className="text-gray-500 text-sm mt-1">{result?.total ?? "..."} produto(s) encontrado(s)</p>
        </div>
        {isAdmin && (
          <Link href="/products/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Novo Produto
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, descrição..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIES.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Todos os status</option>
          <option value="1">Ativos</option>
          <option value="0">Inativos</option>
        </select>
        {(search || category || activeFilter) && (
          <button onClick={() => { setSearch(""); setCategory(""); setActiveFilter(""); }} className="text-sm text-gray-400 hover:text-gray-600 px-2">
            Limpar ×
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Carregando...</div>
        ) : !result?.data.length ? (
          <div className="text-center py-16 text-gray-400">
            Nenhum produto encontrado.{" "}
            {isAdmin && <Link href="/products/new" className="text-blue-600 underline">Cadastrar agora</Link>}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium w-16">Foto</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Categoria</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Preço</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Estoque</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
                  {isAdmin && <th className="text-center px-4 py-3 text-gray-500 font-medium">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {result.data.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-lg">📦</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      <div>{p.name}</div>
                      {p.description && <div className="text-xs text-gray-400 truncate max-w-xs">{p.description}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {Number(p.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{p.stock}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {p.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/products/${p.id}/edit`} className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                            Editar
                          </Link>
                          <button onClick={() => handleDelete(p.id, p.name)} className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors">
                            Excluir
                          </button>
                        </div>
                      </td>
                    )}
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
