"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@/lib/types";
import { fetchJson } from "@/lib/fetchJson";
import { IconArrowLeft, IconPencil, IconTrash, IconMail, IconShield, IconCalendar, IconUsers } from "@/components/Icons";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm text-slate-800">{children}</dd>
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchJson<User>(`/api/users/${id}`)
      .then(setUser)
      .catch((err) => {
        if (err.message?.includes("404") || err.status === 404) setNotFound(true);
      });
  }, [id]);

  async function handleDelete() {
    if (!user) return;
    if (!confirm(`Excluir o usuário "${user.name}"?`)) return;
    try {
      await fetchJson(`/api/users/${id}`, { method: "DELETE" });
      router.push("/users");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  if (notFound) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600 font-medium">Usuário não encontrado.</p>
        <Link href="/users" className="mt-4 inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium">
          <IconArrowLeft className="w-4 h-4" /> Voltar para usuários
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-violet-500 rounded-full animate-spin" />
          Carregando...
        </div>
      </div>
    );
  }

  const formattedDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const permissions =
    user.role === "admin"
      ? [
          "Gerenciar produtos (criar, editar, excluir)",
          "Gerenciar usuários (criar, editar, excluir)",
          "Visualizar painel e estatísticas",
          "Acesso total ao sistema",
        ]
      : [
          "Visualizar catálogo de produtos",
          "Acesso ao painel básico",
        ];

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");

  return (
    <div>
      {/* Breadcrumb / back */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/users"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          Usuários
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-700 font-medium truncate">{user.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: avatar + status */}
        <div className="lg:col-span-1 space-y-4">
          {/* Avatar card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-violet-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-sm">
              {initials}
            </div>
            <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                user.role === "admin"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-slate-100 text-slate-600"
              }`}>
                <IconShield className="w-3 h-3" />
                {user.role === "admin" ? "Administrador" : "Usuário"}
              </span>
            </div>
          </div>

          {/* Status card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                user.active
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${user.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                {user.active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</span>
              <span className="text-sm font-mono text-slate-600">#{user.id}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Ações</p>
            <Link
              href={`/users/${user.id}/edit`}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <IconPencil className="w-4 h-4" />
              Editar usuário
            </Link>
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <IconTrash className="w-4 h-4" />
              Excluir usuário
            </button>
          </div>
        </div>

        {/* Right: details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                <IconUsers className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Informações da Conta</h3>
                <p className="text-xs text-slate-500">Dados do usuário cadastrado</p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DetailRow label="Nome completo">{user.name}</DetailRow>
              <DetailRow label="Email">
                <span className="flex items-center gap-1.5">
                  <IconMail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                </span>
              </DetailRow>
              <DetailRow label="Perfil">
                <span className={`inline-flex items-center gap-1 font-medium ${
                  user.role === "admin" ? "text-violet-700" : "text-slate-600"
                }`}>
                  <IconShield className="w-3.5 h-3.5" />
                  {user.role === "admin" ? "Administrador" : "Usuário comum"}
                </span>
              </DetailRow>
              <DetailRow label="Status">
                <span className={user.active ? "text-emerald-700 font-medium" : "text-slate-500"}>
                  {user.active ? "Conta ativa" : "Conta inativa"}
                </span>
              </DetailRow>
            </dl>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Histórico</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {user.created_at && (
                <DetailRow label="Cadastrado em">
                  <span className="flex items-center gap-1.5">
                    <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
                    {formattedDate(user.created_at)}
                  </span>
                </DetailRow>
              )}
              {user.updated_at && (
                <DetailRow label="Atualizado em">
                  <span className="flex items-center gap-1.5">
                    <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
                    {formattedDate(user.updated_at)}
                  </span>
                </DetailRow>
              )}
            </dl>
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Permissões</p>
            <ul className="space-y-2">
              {permissions.map((perm) => (
                <li key={perm} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
                      <path d="M2 6l3 3 5-5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {perm}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
