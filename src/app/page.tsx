"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchJson } from "@/lib/fetchJson";
import { IconBox, IconUsers, IconPlus, IconArrowLeft } from "@/components/Icons";

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalUsers: number;
  activeUsers: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        type PR = { data: { active: number }[]; total: number };
        const pData = await fetchJson<PR>("/api/products?limit=1000");
        const uData = isAdmin
          ? await fetchJson<PR>("/api/users?limit=1000")
          : { data: [], total: 0 };

        setStats({
          totalProducts: pData.total,
          activeProducts: pData.data.filter((p) => p.active === 1).length,
          totalUsers: uData.total,
          activeUsers: uData.data.filter((u) => u.active === 1).length,
        });
      } catch {
        // fetchJson redirects to /login on 401
      }
    }
    if (user !== null) fetchStats();
  }, [user, isAdmin]);

  const statCards = [
    {
      label: "Total de Produtos",
      value: stats?.totalProducts ?? "—",
      sub: "produtos cadastrados",
      color: "bg-indigo-50 border-indigo-100",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      Icon: IconBox,
      href: "/products",
    },
    {
      label: "Produtos Ativos",
      value: stats?.activeProducts ?? "—",
      sub: "disponíveis no catálogo",
      color: "bg-emerald-50 border-emerald-100",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      Icon: IconBox,
      href: "/products?active=1",
    },
    ...(isAdmin
      ? [
          {
            label: "Total de Usuários",
            value: stats?.totalUsers ?? "—",
            sub: "contas registradas",
            color: "bg-violet-50 border-violet-100",
            iconBg: "bg-violet-100",
            iconColor: "text-violet-600",
            Icon: IconUsers,
            href: "/users",
          },
          {
            label: "Usuários Ativos",
            value: stats?.activeUsers ?? "—",
            sub: "com acesso habilitado",
            color: "bg-amber-50 border-amber-100",
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            Icon: IconUsers,
            href: "/users?active=1",
          },
        ]
      : []),
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
          Romão Store
        </p>
        <h2 className="text-2xl font-bold text-slate-900">
          Olá, {user?.name?.split(" ")[0] ?? "..."}!
        </h2>
        <p className="text-slate-500 text-sm mt-1">Veja o resumo do seu painel administrativo</p>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-2"} gap-4 mb-8`}>
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className={`border rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group ${card.color}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <card.Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <span className="text-xs text-slate-400 group-hover:text-indigo-500 transition-colors">
                  Ver →
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900 tabular-nums">{card.value}</p>
              <p className="text-sm font-medium text-slate-700 mt-0.5">{card.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Ações Rápidas</h3>
          <div className="space-y-2">
            {isAdmin && (
              <>
                <Link
                  href="/products/new"
                  className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-sm text-slate-600 hover:text-indigo-700 group"
                >
                  <span className="w-7 h-7 rounded-md bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <IconPlus className="w-3.5 h-3.5 text-indigo-600" />
                  </span>
                  Cadastrar novo produto
                </Link>
                <Link
                  href="/users/new"
                  className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all text-sm text-slate-600 hover:text-violet-700 group"
                >
                  <span className="w-7 h-7 rounded-md bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                    <IconPlus className="w-3.5 h-3.5 text-violet-600" />
                  </span>
                  Cadastrar novo usuário
                </Link>
              </>
            )}
            <Link
              href="/products"
              className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-sm text-slate-600 hover:text-emerald-700 group"
            >
              <span className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <IconArrowLeft className="w-3.5 h-3.5 text-emerald-600 rotate-180" />
              </span>
              Ver todos os produtos
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Funcionalidades</h3>
          <ul className="space-y-2.5">
            {[
              "CRUD completo de Produtos e Usuários",
              "Autenticação com login (JWT + cookie httpOnly)",
              "Autorização por perfil (admin / usuário)",
              "Busca e filtro server-side",
              "Paginação server-side",
              "Upload de imagem do produto (base64)",
            ].map((feat) => (
              <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
                    <path d="M2 6l3 3 5-5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {feat}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
