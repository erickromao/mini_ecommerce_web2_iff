import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const db = getDb();
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, price, stock, category, active } = body;

    if (!name || price == null) {
      return NextResponse.json({ error: "Nome e preço são obrigatórios" }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
    if (!existing) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    db.prepare(`
      UPDATE products
      SET name = ?, description = ?, price = ?, stock = ?, category = ?, active = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name,
      description ?? "",
      Number(price),
      Number(stock ?? 0),
      category ?? "",
      Number(active ?? 1),
      id
    );

    const updated = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const db = getDb();
    const existing = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
    if (!existing) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    return NextResponse.json({ message: "Produto excluído com sucesso" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
  }
}
