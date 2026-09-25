import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    if (user.role === "SUPER_ADMIN") {
      const companies = await prisma.company.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { users: true, tickets: true },
          },
        },
      });
      return NextResponse.json({ companies });
    } else if (user.role === "COMPANY_ADMIN" && user.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: user.companyId },
        include: {
          _count: {
            select: { users: true, tickets: true },
          },
        },
      });
      return NextResponse.json({ companies: company ? [company] : [] });
    }

    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  } catch (error) {
    console.error("[Get Companies Error]:", error);
    return NextResponse.json(
      { error: "Firmalar yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Sadece Bilgi İşlem Yetkilisi yeni firma ekleyebilir." }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, contactEmail, contactPhone, address, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Firma adı zorunludur." }, { status: 400 });
    }

    const cleanCode = (code || name.substring(0, 4).toUpperCase()).trim().replace(/\s+/g, "-");

    // Check duplicate code
    const existing = await prisma.company.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `"${cleanCode}" firma kodu zaten kullanımda.` },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        code: cleanCode,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        address: address || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("[Create Company Error]:", error);
    return NextResponse.json(
      { error: "Firma eklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
