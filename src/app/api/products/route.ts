import { NextRequest, NextResponse } from "next/server";
import { sql, ensureDb, rawSql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await ensureDb();
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "";
    const active = searchParams.get("active") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "8")));

    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let i = 1;

    if (search) {
      conditions.push(`(name ILIKE $${i} OR description ILIKE $${i + 1} OR category ILIKE $${i + 2})`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      i += 3;
    }
    if (category) { conditions.push(`category = $${i++}`); params.push(category); }
    if (active !== "") { conditions.push(`active = $${i++}`); params.push(Number(active)); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [{ n }] = await rawSql<{ n: number }>(`SELECT COUNT(*)::int AS n FROM products ${where}`, params);
    const total = n;

    const data = await rawSql(
      `SELECT * FROM products ${where} ORDER BY id DESC LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, (page - 1) * limit]
    );

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDb();
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const body = await req.json();
    const { name, description, price, stock, category, active, image } = body;

    if (!name || price == null) {
      return NextResponse.json({ error: "Nome e preço são obrigatórios" }, { status: 400 });
    }

    const [created] = await sql`
      INSERT INTO products (name, description, price, stock, category, active, image)
      VALUES (${name}, ${description ?? ""}, ${Number(price)}, ${Number(stock ?? 0)}, ${category ?? ""}, ${Number(active ?? 1)}, ${image ?? ""})
      RETURNING *
    `;
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
