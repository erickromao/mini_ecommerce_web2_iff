"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { Product } from "@/lib/types";

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

  if (notFound) return <p className="text-red-500">Produto não encontrado.</p>;
  if (!product) return <p className="text-gray-400">Carregando...</p>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Editar Produto</h2>
        <p className="text-gray-500 text-sm mt-1">#{product.id} — {product.name}</p>
      </div>
      <ProductForm initial={product} id={product.id} />
    </div>
  );
}
