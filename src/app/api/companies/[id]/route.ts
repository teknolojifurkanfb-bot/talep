import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const { id } = await params;

    // Only SUPER_ADMIN or that company's COMPANY_ADMIN can edit
    if (user.role !== "SUPER_ADMIN" && (user.role !== "COMPANY_ADMIN" || user.companyId !== id)) {
      return NextResponse.json({ error: "Bu firmayı düzenleme yetkiniz yok." }, { status: 403 });
    }

    const body = await request.json();
    const { name, contactEmail, contactPhone, address, notes, isActive } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (address !== undefined) updateData.address = address;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined && user.role === "SUPER_ADMIN") updateData.isActive = isActive;

    const company = await prisma.company.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("[Update Company Error]:", error);
    return NextResponse.json(
      { error: "Firma güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Sadece Süper Admin firma silebilir." }, { status: 403 });
    }

    const { id } = await params;
    await prisma.company.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Delete Company Error]:", error);
    return NextResponse.json(
      { error: "Firma silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
