import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const products = db.prepare("SELECT * FROM products ORDER BY id DESC").all();
    return NextResponse.json(products);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, price, stock, category, active } = body;

    if (!name || price == null) {
      return NextResponse.json({ error: "Nome e preço são obrigatórios" }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO products (name, description, price, stock, category, active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      name,
      description ?? "",
      Number(price),
      Number(stock ?? 0),
      category ?? "",
      active != null ? Number(active) : 1
    );

    const created = db.prepare("SELECT * FROM products WHERE id = ?").get(result.lastInsertRowid);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
