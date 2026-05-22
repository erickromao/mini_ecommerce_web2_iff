"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { fetchJson } from "@/lib/fetchJson";

interface Props {
  initial?: Partial<User>;
  id?: number;
}

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white";

const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

export default function UserForm({ initial, id }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    password: "",
    role: initial?.role ?? "user",
    active: initial?.active != null ? String(initial.active) : "1",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEdit = id != null;

  function change(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isEdit && !form.password) {
      setError("Senha é obrigatória para novo usuário");
      return;
    }

    setSaving(true);
    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      role: form.role,
      active: parseInt(form.active),
    };
    if (form.password) payload.password = form.password;

    try {
      await fetchJson(isEdit ? `/api/users/${id}` : "/api/users", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Erro ao salvar usuário");
      return;
    }

    setSaving(false);
    router.push("/users");
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

      {/* Personal info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
          Informações Pessoais
        </h3>

        <div>
          <label className={labelClass}>Nome completo *</label>
          <input
            name="name"
            value={form.name}
            onChange={change}
            required
            className={inputClass}
            placeholder="Nome completo"
          />
        </div>

        <div>
          <label className={labelClass}>Email *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={change}
            required
            className={inputClass}
            placeholder="email@exemplo.com"
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
          Segurança
        </h3>

        <div>
          <label className={labelClass}>
            Senha {isEdit ? <span className="text-slate-400 font-normal">(deixe em branco para manter atual)</span> : "*"}
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={change}
            required={!isEdit}
            className={inputClass}
            placeholder={isEdit ? "Nova senha (opcional)" : "Senha"}
          />
        </div>
      </div>

      {/* Role & status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
          Permissões
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Perfil</label>
            <select name="role" value={form.role} onChange={change} className={inputClass}>
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
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
          className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          {saving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Usuário"}
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
