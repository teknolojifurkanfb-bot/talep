import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre gereklidir." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        isActive: true,
        phone: true,
        department: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    // Lazy initialization for Super Admin if missing
    if (!user && (cleanEmail === "admin@novatra.com" || cleanEmail === "admin@bilgiislem.com")) {
      const defaultPassword = await hashPassword("admin123");
      const created = await prisma.user.create({
        data: {
          email: cleanEmail,
          password: defaultPassword,
          name: "Furkan (Bilgi İşlem Yöneticisi)",
          phone: "0555 123 45 67",
          role: "SUPER_ADMIN",
          department: "Bilgi Teknolojileri",
        },
      });
      user = {
        ...created,
        company: null,
      };
    }

    if (!user) {
      return NextResponse.json(
        { error: "Geçersiz e-posta veya şifre." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Hesabınız devre dışı bırakılmıştır. Lütfen yöneticinizle görüşün." },
        { status: 403 }
      );
    }

    if (user.company && !user.company.isActive && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Bağlı olduğunuz kurumun destek hesabı pasiftir." },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(cleanPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Geçersiz e-posta veya şifre." },
        { status: 401 }
      );
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "SUPER_ADMIN" | "COMPANY_ADMIN" | "USER",
      companyId: user.companyId,
      companyName: user.company?.name || null,
      phone: user.phone,
      department: user.department,
    };

    await setSessionCookie(sessionPayload);

    return NextResponse.json({
      success: true,
      user: sessionPayload,
    });
  } catch (error: unknown) {
    console.error("[Login Error]:", error);
    const errMessage = error instanceof Error ? error.message : "Veritabanı bağlantı hatası.";
    return NextResponse.json(
      { error: `Giriş hatası: ${errMessage}` },
      { status: 500 }
    );
  }
}
