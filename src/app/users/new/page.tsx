import Link from "next/link";
import UserForm from "@/components/UserForm";
import { IconArrowLeft } from "@/components/Icons";

export default function NewUserPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <IconArrowLeft className="w-4 h-4" />
          Voltar para usuários
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Novo Usuário</h2>
        <p className="text-slate-500 text-sm mt-0.5">Preencha os dados para cadastrar um usuário</p>
      </div>
      <UserForm />
    </div>
  );
}
