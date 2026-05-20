import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "";
    const active = searchParams.get("active") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "8")));

    const db = getDb();

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (search) {
      conditions.push("(name LIKE ? OR description LIKE ? OR category LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) { conditions.push("category = ?"); params.push(category); }
    if (active !== "") { conditions.push("active = ?"); params.push(Number(active)); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const total = (db.prepare(`SELECT COUNT(*) as n FROM products ${where}`).get(...params) as { n: number }).n;
    const data = db
      .prepare(`SELECT * FROM products ${where} ORDER BY id DESC LIMIT ? OFFSET ?`)
      .all(...params, limit, (page - 1) * limit);

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const body = await req.json();
    const { name, description, price, stock, category, active, image } = body;

    if (!name || price == null) {
      return NextResponse.json({ error: "Nome e preço são obrigatórios" }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO products (name, description, price, stock, category, active, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, description ?? "", Number(price), Number(stock ?? 0), category ?? "", Number(active ?? 1), image ?? "");

    const created = db.prepare("SELECT * FROM products WHERE id = ?").get(result.lastInsertRowid);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
