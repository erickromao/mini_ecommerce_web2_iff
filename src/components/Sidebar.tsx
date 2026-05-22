"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { IconGrid, IconBox, IconUsers, IconLogOut } from "@/components/Icons";

const allLinks = [
  { href: "/", label: "Dashboard", Icon: IconGrid, roles: ["admin", "user"] },
  { href: "/products", label: "Produtos", Icon: IconBox, roles: ["admin", "user"] },
  { href: "/users", label: "Usuários", Icon: IconUsers, roles: ["admin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = allLinks.filter((l) => !user || l.roles.includes(user.role));

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-sm">
            R
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Romão Store</h1>
            <p className="text-xs text-slate-500">Painel Administrativo</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2 mt-1">
          Navegação
        </p>
        {links.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      {user && (
        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-200 truncate leading-tight">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <div className="px-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              user.role === "admin"
                ? "bg-violet-900/50 text-violet-300 border border-violet-700/40"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}>
              {user.role === "admin" ? "Administrador" : "Usuário"}
            </span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 text-xs text-slate-500 hover:text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-800 transition-all"
          >
            <IconLogOut className="w-3.5 h-3.5" />
            Sair da conta
          </button>
        </div>
      )}
    </aside>
  );
}
