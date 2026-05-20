import UserForm from "@/components/UserForm";

export default function NewUserPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Novo Usuário</h2>
        <p className="text-gray-500 text-sm mt-1">Preencha os dados para cadastrar um usuário</p>
      </div>
      <UserForm />
    </div>
  );
}
