"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { IconArrowLeft, IconPencil, IconTrash, IconTag, IconCalendar, IconBox } from "@/components/Icons";
import { fetchJson } from "@/lib/fetchJson";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm text-slate-800">{children}</dd>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => data && setProduct(data));
  }, [id]);

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`Excluir o produto "${product.name}"?`)) return;
    try {
      await fetchJson(`/api/products/${id}`, { method: "DELETE" });
      router.push("/products");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  if (notFound) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600 font-medium">Produto não encontrado.</p>
        <Link href="/products" className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          <IconArrowLeft className="w-4 h-4" /> Voltar para produtos
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
          Carregando...
        </div>
      </div>
    );
  }

  const formattedDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div>
      {/* Breadcrumb / back */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          Produtos
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-700 font-medium truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: image + status */}
        <div className="lg:col-span-1 space-y-4">
          {/* Image */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="w-full aspect-square bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-300">
                <IconBox className="w-16 h-16" />
                <p className="text-xs text-slate-400">Sem imagem</p>
              </div>
            )}
          </div>

          {/* Status card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                product.active
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${product.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                {product.active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</span>
              <span className="text-sm font-mono text-slate-600">#{product.id}</span>
            </div>
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Ações</p>
              <Link
                href={`/products/${product.id}/edit`}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                <IconPencil className="w-4 h-4" />
                Editar produto
              </Link>
              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                <IconTrash className="w-4 h-4" />
                Excluir produto
              </button>
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                <IconBox className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
                {product.category && (
                  <div className="flex items-center gap-1 mt-1">
                    <IconTag className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm text-slate-500">{product.category}</span>
                  </div>
                )}
              </div>
            </div>

            {product.description && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Descrição</p>
                <p className="text-sm text-slate-700 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>

          {/* Pricing & stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preço</p>
              <p className="text-2xl font-bold text-indigo-600 tabular-nums">
                {Number(product.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
            <div className={`bg-white rounded-xl border shadow-sm p-5 ${product.stock === 0 ? "border-red-200" : "border-slate-200"}`}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Estoque</p>
              <p className={`text-2xl font-bold tabular-nums ${product.stock === 0 ? "text-red-500" : "text-slate-900"}`}>
                {product.stock}
                <span className="text-sm font-normal text-slate-400 ml-1">un.</span>
              </p>
              {product.stock === 0 && (
                <p className="text-xs text-red-500 mt-1 font-medium">Sem estoque</p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Informações</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailRow label="Categoria">{product.category || "—"}</DetailRow>
              <DetailRow label="Status">{product.active ? "Ativo" : "Inativo"}</DetailRow>
              {product.created_at && (
                <DetailRow label="Criado em">
                  <span className="flex items-center gap-1.5">
                    <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
                    {formattedDate(product.created_at)}
                  </span>
                </DetailRow>
              )}
              {product.updated_at && (
                <DetailRow label="Atualizado em">
                  <span className="flex items-center gap-1.5">
                    <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
                    {formattedDate(product.updated_at)}
                  </span>
                </DetailRow>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
