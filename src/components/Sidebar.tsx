"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const allLinks = [
  { href: "/", label: "Dashboard", icon: "🏠", roles: ["admin", "user"] },
  { href: "/products", label: "Produtos", icon: "📦", roles: ["admin", "user"] },
  { href: "/users", label: "Usuários", icon: "👥", roles: ["admin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (pathname === "/login") return null;

  const links = allLinks.filter((l) => !user || l.roles.includes(user.role));

  return (
    <aside className="w-56 bg-slate-800 text-white flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-lg font-bold tracking-tight">Mini E-commerce</h1>
        <p className="text-xs text-slate-400 mt-0.5">Painel Administrativo</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-slate-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="px-4 py-4 border-t border-slate-700">
          <div className="mb-2">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block font-medium ${user.role === "admin" ? "bg-purple-700 text-purple-100" : "bg-slate-600 text-slate-200"}`}>
              {user.role === "admin" ? "Admin" : "Usuário"}
            </span>
          </div>
          <button
            onClick={logout}
            className="w-full text-left text-xs text-slate-400 hover:text-white px-2 py-1.5 rounded hover:bg-slate-700 transition-colors"
          >
            Sair →
          </button>
        </div>
      )}
    </aside>
  );
}
