"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import UserForm from "@/components/UserForm";
import { User } from "@/lib/types";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => data && setUser(data));
  }, [id]);

  if (notFound) return <p className="text-red-500">Usuário não encontrado.</p>;
  if (!user) return <p className="text-gray-400">Carregando...</p>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Editar Usuário</h2>
        <p className="text-gray-500 text-sm mt-1">#{user.id} — {user.name}</p>
      </div>
      <UserForm initial={user} id={user.id} />
    </div>
  );
}
