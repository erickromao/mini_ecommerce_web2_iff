import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "mini-ecommerce-dev-secret-2024"
);
export const COOKIE_NAME = "session";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

export async function signToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
