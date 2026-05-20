import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Novo Produto</h2>
        <p className="text-gray-500 text-sm mt-1">Preencha os dados para cadastrar um produto</p>
      </div>
      <ProductForm />
    </div>
  );
}
