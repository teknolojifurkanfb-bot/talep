import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre gereklidir." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        company: true,
      },
    });

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

    const isMatch = await comparePassword(password, user.password);
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
  } catch (error) {
    console.error("[Login Error]:", error);
    return NextResponse.json(
      { error: "Giriş yapılırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
