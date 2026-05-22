"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { fetchJson } from "@/lib/fetchJson";
import { IconImage, IconBox } from "@/components/Icons";

interface Props {
  initial?: Partial<Product>;
  id?: number;
}

const CATEGORIES = ["Eletrônicos", "Periféricos", "Monitores", "Mobiliário", "Acessórios", "Outros"];

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white";

const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

export default function ProductForm({ initial, id }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price?.toString() ?? "",
    stock: initial?.stock?.toString() ?? "0",
    category: initial?.category ?? "",
    active: initial?.active != null ? String(initial.active) : "1",
    image: initial?.image ?? "",
  });
  const [imagePreview, setImagePreview] = useState<string>(initial?.image ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEdit = id != null;

  function change(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError("Imagem muito grande. Máximo: 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImagePreview(base64);
      setForm((f) => ({ ...f, image: base64 }));
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImagePreview("");
    setForm((f) => ({ ...f, image: "" }));
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category: form.category,
      active: parseInt(form.active),
      image: form.image,
    };

    try {
      await fetchJson(isEdit ? `/api/products/${id}` : "/api/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Erro ao salvar produto");
      return;
    }

    setSaving(false);
    router.push("/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <span className="shrink-0 mt-0.5">⚠</span>
          {error}
        </div>
      )}

      {/* Image upload */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <label className={labelClass}>Imagem do Produto</label>
        <div className="flex items-center gap-5">
          <div className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-300">
                <IconBox className="w-8 h-8" />
                <span className="text-xs">Sem foto</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 px-3.5 py-2 rounded-lg hover:bg-indigo-50 transition-all font-medium"
            >
              <IconImage className="w-4 h-4" />
              Escolher imagem
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={removeImage}
                className="block text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                Remover imagem
              </button>
            )}
            <p className="text-xs text-slate-400">PNG, JPG, WebP — máx. 1MB</p>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
          Informações Básicas
        </h3>

        <div>
          <label className={labelClass}>Nome *</label>
          <input
            name="name"
            value={form.name}
            onChange={change}
            required
            className={inputClass}
            placeholder="Nome do produto"
          />
        </div>

        <div>
          <label className={labelClass}>Descrição</label>
          <textarea
            name="description"
            value={form.description}
            onChange={change}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Descrição detalhada do produto"
          />
        </div>
      </div>

      {/* Pricing & stock */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
          Preço e Estoque
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Preço (R$) *</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={change}
              required
              className={inputClass}
              placeholder="0,00"
            />
          </div>
          <div>
            <label className={labelClass}>Estoque (un.)</label>
            <input
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={change}
              className={inputClass}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Category & status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
          Classificação
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Categoria</label>
            <select name="category" value={form.category} onChange={change} className={inputClass}>
              <option value="">Selecione...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="active" value={form.active} onChange={change} className={inputClass}>
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          {saving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Produto"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
