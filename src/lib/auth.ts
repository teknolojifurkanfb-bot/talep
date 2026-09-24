import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-homoffice-2026";
const COOKIE_NAME = "it_portal_session";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "COMPANY_ADMIN" | "USER";
  companyId?: string | null;
  companyName?: string | null;
  phone?: string | null;
  department?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(user: SessionUser) {
  const token = signToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
          },
        },
      },
    });

    if (user) {
      if (!user.isActive) return null;
      if (user.company && !user.company.isActive && user.role !== "SUPER_ADMIN") return null;
      return user;
    }
  } catch (err) {
    console.error("[getCurrentUser fallback]:", err);
  }

  // Graceful fallback to verified token session so user is never stuck in a loop
  return {
    id: session.id,
    email: session.email,
    name: session.name,
    role: session.role,
    companyId: session.companyId || null,
    phone: session.phone || null,
    department: session.department || null,
    isActive: true,
    company: session.companyId
      ? { id: session.companyId, name: session.companyName || "", code: "", isActive: true }
      : null,
  };
}
