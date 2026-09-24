import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (user.role === "USER") {
      where.userId = user.id;
    } else if (user.role === "COMPANY_ADMIN") {
      where.companyId = user.companyId;
    }

    const [total, open, inProgress, waiting, resolved, closed, urgent] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.count({ where: { ...where, status: "ACIK" } }),
      prisma.ticket.count({ where: { ...where, status: "ISLEMDE" } }),
      prisma.ticket.count({ where: { ...where, status: "BEKLEMEDE" } }),
      prisma.ticket.count({ where: { ...where, status: "COZULDU" } }),
      prisma.ticket.count({ where: { ...where, status: "KAPATILDI" } }),
      prisma.ticket.count({
        where: {
          ...where,
          priority: "ACIL",
          status: { in: ["ACIK", "ISLEMDE", "BEKLEMEDE"] },
        },
      }),
    ]);

    const recentTickets = await prisma.ticket.findMany({
      where,
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true, code: true } },
        user: { select: { name: true, phone: true } },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let companyStats: any[] = [];
    if (user.role === "SUPER_ADMIN") {
      const companies = await prisma.company.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          _count: {
            select: {
              tickets: true,
              users: true,
            },
          },
        },
      });

      companyStats = await Promise.all(
        companies.map(async (c) => {
          const openCount = await prisma.ticket.count({
            where: { companyId: c.id, status: { in: ["ACIK", "ISLEMDE"] } },
          });
          return {
            ...c,
            openTickets: openCount,
          };
        })
      );
    }

    return NextResponse.json({
      counts: {
        total,
        open,
        inProgress,
        waiting,
        resolved,
        closed,
        urgent,
      },
      recentTickets,
      companyStats,
    });
  } catch (error) {
    console.error("[Dashboard Stats Error]:", error);
    return NextResponse.json(
      { error: "İstatistikler alınırken hata oluştu." },
      { status: 500 }
    );
  }
}
