import { NextRequest, NextResponse } from "next/server";
import { sql, ensureDb, rawSql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    await ensureDb();
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? "";
    const role = searchParams.get("role") ?? "";
    const active = searchParams.get("active") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "8")));

    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let i = 1;

    if (search) {
      conditions.push(`(name ILIKE $${i} OR email ILIKE $${i + 1})`);
      params.push(`%${search}%`, `%${search}%`);
      i += 2;
    }
    if (role) { conditions.push(`role = $${i++}`); params.push(role); }
    if (active !== "") { conditions.push(`active = $${i++}`); params.push(Number(active)); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [{ n }] = await rawSql<{ n: number }>(`SELECT COUNT(*)::int AS n FROM users ${where}`, params);
    const total = n;

    const data = await rawSql(
      `SELECT id, name, email, role, active, created_at, updated_at FROM users ${where} ORDER BY id DESC LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, (page - 1) * limit]
    );

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDb();
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const body = await req.json();
    const { name, email, password, role, active } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 });
    }

    const [exists] = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (exists) return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const [created] = await sql`
      INSERT INTO users (name, email, password, role, active)
      VALUES (${name}, ${email}, ${hashed}, ${role ?? "user"}, ${active != null ? Number(active) : 1})
      RETURNING id, name, email, role, active, created_at, updated_at
    `;
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 });
  }
}
