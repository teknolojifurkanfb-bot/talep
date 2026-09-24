import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role === "USER") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    // Permission check
    if (currentUser.role === "COMPANY_ADMIN" && targetUser.companyId !== currentUser.companyId) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const { name, phone, department, isActive, password, role } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone;
    if (department !== undefined) updateData.department = department;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password && password.trim()) {
      updateData.password = await hashPassword(password.trim());
    }
    if (role && currentUser.role === "SUPER_ADMIN") {
      updateData.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        department: true,
        role: true,
        isActive: true,
        company: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("[Update User Error]:", error);
    return NextResponse.json(
      { error: "Kullanıcı güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role === "USER") {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const { id } = await params;
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    if (currentUser.role === "COMPANY_ADMIN" && targetUser.companyId !== currentUser.companyId) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    // Don't allow deleting oneself
    if (currentUser.id === id) {
      return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz." }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Delete User Error]:", error);
    return NextResponse.json(
      { error: "Kullanıcı silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
