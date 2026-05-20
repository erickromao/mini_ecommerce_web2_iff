import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const db = getDb();
    const users = db
      .prepare("SELECT id, name, email, role, active, created_at, updated_at FROM users ORDER BY id DESC")
      .all();
    return NextResponse.json(users);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, active } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 });
    }

    const db = getDb();
    const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (exists) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, active)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email, hashed, role ?? "user", active != null ? Number(active) : 1);

    const created = db
      .prepare("SELECT id, name, email, role, active, created_at, updated_at FROM users WHERE id = ?")
      .get(result.lastInsertRowid);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 });
  }
}
