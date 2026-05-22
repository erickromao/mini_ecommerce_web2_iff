import { NextRequest, NextResponse } from "next/server";
import { sql, ensureDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await ensureDb();
    const { id } = await params;
    const [product] = await sql`SELECT * FROM products WHERE id = ${id}`;
    if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await ensureDb();
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const { name, description, price, stock, category, active, image } = body;

    if (!name || price == null) {
      return NextResponse.json({ error: "Nome e preço são obrigatórios" }, { status: 400 });
    }

    const [existing] = await sql`SELECT id FROM products WHERE id = ${id}`;
    if (!existing) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    const [updated] = await sql`
      UPDATE products
      SET name=${name}, description=${description ?? ""}, price=${Number(price)},
          stock=${Number(stock ?? 0)}, category=${category ?? ""}, active=${Number(active ?? 1)},
          image=${image ?? ""}, updated_at=NOW()
      WHERE id=${id}
      RETURNING *
    `;
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await ensureDb();
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const { id } = await params;
    const [existing] = await sql`SELECT id FROM products WHERE id = ${id}`;
    if (!existing) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    await sql`DELETE FROM products WHERE id = ${id}`;
    return NextResponse.json({ message: "Produto excluído com sucesso" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
  }
}
