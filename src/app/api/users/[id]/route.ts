import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const db = getDb();
    const user = db
      .prepare("SELECT id, name, email, role, active, created_at, updated_at FROM users WHERE id = ?")
      .get(id);
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, password, role, active } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Nome e email são obrigatórios" }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
    if (!existing) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const emailConflict = db
      .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
      .get(email, id);
    if (emailConflict) {
      return NextResponse.json({ error: "Email já está em uso" }, { status: 409 });
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      db.prepare(`
        UPDATE users SET name = ?, email = ?, password = ?, role = ?, active = ?,
        updated_at = datetime('now') WHERE id = ?
      `).run(name, email, hashed, role ?? "user", Number(active ?? 1), id);
    } else {
      db.prepare(`
        UPDATE users SET name = ?, email = ?, role = ?, active = ?,
        updated_at = datetime('now') WHERE id = ?
      `).run(name, email, role ?? "user", Number(active ?? 1), id);
    }

    const updated = db
      .prepare("SELECT id, name, email, role, active, created_at, updated_at FROM users WHERE id = ?")
      .get(id);
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
    if (!existing) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return NextResponse.json({ message: "Usuário excluído com sucesso" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 });
  }
}
