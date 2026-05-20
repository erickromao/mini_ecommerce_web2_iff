"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalUsers: number;
  activeUsers: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const [productsRes, usersRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/users"),
      ]);
      const products = await productsRes.json();
      const users = await usersRes.json();

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter((p: { active: number }) => p.active === 1).length,
        totalUsers: users.length,
        activeUsers: users.filter((u: { active: number }) => u.active === 1).length,
      });
    }
    fetchStats();
  }, []);

  const cards = [
    { label: "Total de Produtos", value: stats?.totalProducts ?? "—", color: "bg-blue-500", icon: "📦", href: "/products" },
    { label: "Produtos Ativos", value: stats?.activeProducts ?? "—", color: "bg-green-500", icon: "✅", href: "/products" },
    { label: "Total de Usuários", value: stats?.totalUsers ?? "—", color: "bg-purple-500", icon: "👥", href: "/users" },
    { label: "Usuários Ativos", value: stats?.activeUsers ?? "—", color: "bg-orange-500", icon: "🔑", href: "/users" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
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
            <Link href="/products/new" className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-gray-200 hover:bg-gray-50 transition-colors text-sm text-gray-600">
              <span className="text-blue-500 text-lg">+</span> Cadastrar novo produto
            </Link>
            <Link href="/users/new" className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-gray-200 hover:bg-gray-50 transition-colors text-sm text-gray-600">
              <span className="text-purple-500 text-lg">+</span> Cadastrar novo usuário
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Sobre o Sistema</h3>
          <ul className="text-sm text-gray-500 space-y-2">
            <li>• CRUD completo de Produtos</li>
            <li>• CRUD completo de Usuários</li>
            <li>• Backend com API Routes (Next.js)</li>
            <li>• Banco de dados SQLite</li>
            <li>• Deploy na Vercel</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
