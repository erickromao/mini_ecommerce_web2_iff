import Link from "next/link";
import ProductForm from "@/components/ProductForm";
import { IconArrowLeft } from "@/components/Icons";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <IconArrowLeft className="w-4 h-4" />
          Voltar para produtos
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Novo Produto</h2>
        <p className="text-slate-500 text-sm mt-0.5">Preencha os dados para cadastrar um produto</p>
      </div>
      <ProductForm />
    </div>
  );
}
