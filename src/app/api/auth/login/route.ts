import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signToken, COOKIE_NAME, SessionUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatórios" }, { status: 400 });
    }

    const db = getDb();
    const user = db
      .prepare("SELECT id, name, email, password, role, active FROM users WHERE email = ?")
      .get(email) as (SessionUser & { password: string; active: number }) | undefined;

    if (!user || !user.active) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const token = await signToken({ id: user.id, name: user.name, email: user.email, role: user.role });

    const res = NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
