"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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
      const [pRes, uRes] = await Promise.all([
        fetch("/api/products?limit=1000"),
        isAdmin ? fetch("/api/users?limit=1000") : Promise.resolve(null),
      ]);
      const pData = await pRes.json();
      const uData = uRes ? await uRes.json() : { data: [], total: 0 };

      const products: { active: number }[] = pData.data ?? [];
      const users: { active: number }[] = uData.data ?? [];

      setStats({
        totalProducts: pData.total ?? 0,
        activeProducts: products.filter((p) => p.active === 1).length,
        totalUsers: uData.total ?? 0,
        activeUsers: users.filter((u) => u.active === 1).length,
      });
    }
    if (user !== null) fetchStats();
  }, [user, isAdmin]);

  const cards = [
    { label: "Total de Produtos", value: stats?.totalProducts ?? "—", color: "bg-blue-500", icon: "📦", href: "/products" },
    { label: "Produtos Ativos", value: stats?.activeProducts ?? "—", color: "bg-green-500", icon: "✅", href: "/products" },
    ...(isAdmin ? [
      { label: "Total de Usuários", value: stats?.totalUsers ?? "—", color: "bg-purple-500", icon: "👥", href: "/users" },
      { label: "Usuários Ativos", value: stats?.activeUsers ?? "—", color: "bg-orange-500", icon: "🔑", href: "/users" },
    ] : []),
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Olá, {user?.name ?? "..."}!
        </h2>
        <p className="text-gray-500 text-sm mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-4`}>
                {card.icon}
              </div>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            {isAdmin && (
              <>
                <Link href="/products/new" className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-gray-200 hover:bg-gray-50 transition-colors text-sm text-gray-600">
                  <span className="text-blue-500 text-lg">+</span> Cadastrar novo produto
                </Link>
                <Link href="/users/new" className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-gray-200 hover:bg-gray-50 transition-colors text-sm text-gray-600">
                  <span className="text-purple-500 text-lg">+</span> Cadastrar novo usuário
                </Link>
              </>
            )}
            <Link href="/products" className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-gray-200 hover:bg-gray-50 transition-colors text-sm text-gray-600">
              <span className="text-green-500 text-lg">→</span> Ver todos os produtos
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Funcionalidades</h3>
          <ul className="text-sm text-gray-500 space-y-2">
            <li>✅ CRUD completo de Produtos e Usuários</li>
            <li>✅ Autenticação com login (JWT + cookie)</li>
            <li>✅ Autorização por perfil (admin / usuário)</li>
            <li>✅ Busca e filtro em tempo real</li>
            <li>✅ Paginação server-side</li>
            <li>✅ Upload de imagem do produto (base64)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
