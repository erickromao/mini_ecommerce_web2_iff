"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/components/ProductForm";
import { Product } from "@/lib/types";
import { IconArrowLeft } from "@/components/Icons";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
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

  if (notFound) return (
    <div className="text-center py-20">
      <p className="text-slate-600 font-medium">Produto não encontrado.</p>
      <Link href="/products" className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
        <IconArrowLeft className="w-4 h-4" /> Voltar para produtos
      </Link>
    </div>
  );

  if (!product) return (
    <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
        Carregando...
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/products/${product.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <IconArrowLeft className="w-4 h-4" />
          Voltar para detalhes
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Editar Produto</h2>
        <p className="text-slate-500 text-sm mt-0.5">#{product.id} — {product.name}</p>
      </div>
      <ProductForm initial={product} id={product.id} />
    </div>
  );
}
