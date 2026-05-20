import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? "";
    const role = searchParams.get("role") ?? "";
    const active = searchParams.get("active") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "8")));

    const db = getDb();
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (search) {
      conditions.push("(name LIKE ? OR email LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) { conditions.push("role = ?"); params.push(role); }
    if (active !== "") { conditions.push("active = ?"); params.push(Number(active)); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const total = (db.prepare(`SELECT COUNT(*) as n FROM users ${where}`).get(...params) as { n: number }).n;
    const data = db
      .prepare(`SELECT id, name, email, role, active, created_at, updated_at FROM users ${where} ORDER BY id DESC LIMIT ? OFFSET ?`)
      .all(...params, limit, (page - 1) * limit);

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const body = await req.json();
    const { name, email, password, role, active } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 });
    }

    const db = getDb();
    const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (exists) return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, active) VALUES (?, ?, ?, ?, ?)
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
