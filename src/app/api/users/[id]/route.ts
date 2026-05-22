import { NextRequest, NextResponse } from "next/server";
import { sql, ensureDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  return null;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await ensureDb();
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const { id } = await params;
    const [user] = await sql`
      SELECT id, name, email, role, active, created_at, updated_at FROM users WHERE id = ${id}
    `;
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await ensureDb();
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const { id } = await params;
    const body = await req.json();
    const { name, email, password, role, active } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Nome e email são obrigatórios" }, { status: 400 });
    }

    const [existing] = await sql`SELECT id FROM users WHERE id = ${id}`;
    if (!existing) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const [conflict] = await sql`SELECT id FROM users WHERE email = ${email} AND id != ${id}`;
    if (conflict) return NextResponse.json({ error: "Email já está em uso" }, { status: 409 });

    let updated;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      [updated] = await sql`
        UPDATE users SET name=${name}, email=${email}, password=${hashed}, role=${role ?? "user"},
          active=${Number(active ?? 1)}, updated_at=NOW()
        WHERE id=${id}
        RETURNING id, name, email, role, active, created_at, updated_at
      `;
    } else {
      [updated] = await sql`
        UPDATE users SET name=${name}, email=${email}, role=${role ?? "user"},
          active=${Number(active ?? 1)}, updated_at=NOW()
        WHERE id=${id}
        RETURNING id, name, email, role, active, created_at, updated_at
      `;
    }
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await ensureDb();
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const { id } = await params;
    const [existing] = await sql`SELECT id FROM users WHERE id = ${id}`;
    if (!existing) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    await sql`DELETE FROM users WHERE id = ${id}`;
    return NextResponse.json({ message: "Usuário excluído com sucesso" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 });
  }
}
