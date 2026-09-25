import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (user.role === "USER") {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }

    if (user.role === "COMPANY_ADMIN") {
      where.companyId = user.companyId;
    } else if (user.role === "SUPER_ADMIN") {
      if (companyId) where.companyId = companyId;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        companyId: true,
        company: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { ticketsCreated: true },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[Get Users Error]:", error);
    return NextResponse.json(
      { error: "Kullanıcılar alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getSession();
    if (!currentUser || currentUser.role === "USER") {
      return NextResponse.json(
        { error: "Kullanıcı oluşturma yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name, phone, department, role = "USER", companyId } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "E-posta, şifre ve isim alanları zorunludur." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanımda." },
        { status: 400 }
      );
    }

    // Role & Company assignment logic
    let finalCompanyId = companyId;
    let finalRole = role;

    if (currentUser.role === "COMPANY_ADMIN") {
      finalCompanyId = currentUser.companyId;
      finalRole = "USER";
    } else if (currentUser.role === "SUPER_ADMIN") {
      if (finalRole !== "SUPER_ADMIN" && !finalCompanyId) {
        return NextResponse.json(
          { error: "Kullanıcı için bir kurum seçmelisiniz." },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: name.trim(),
        phone: phone || null,
        department: department || null,
        role: finalRole,
        companyId: finalCompanyId || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        department: true,
        isActive: true,
        company: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.error("[Create User Error]:", error);
    return NextResponse.json(
      { error: "Kullanıcı oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
