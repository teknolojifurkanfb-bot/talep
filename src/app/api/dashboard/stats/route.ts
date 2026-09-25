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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (user.role === "USER") {
      where.userId = user.id;
    } else if (user.role === "COMPANY_ADMIN") {
      where.companyId = user.companyId;
    }

    // Fetch recent tickets and stats in single parallel queries
    const [allTickets, recentTickets, companies] = await Promise.all([
      prisma.ticket.findMany({
        where,
        select: {
          id: true,
          status: true,
          priority: true,
          companyId: true,
        },
      }),
      prisma.ticket.findMany({
        where,
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          company: { select: { name: true, code: true } },
          user: { select: { name: true, phone: true } },
        },
      }),
      user.role === "SUPER_ADMIN"
        ? prisma.company.findMany({
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
          })
        : Promise.resolve([]),
    ]);

    // In-memory instant counts (0ms database overhead)
    let open = 0;
    let inProgress = 0;
    let waiting = 0;
    let resolved = 0;
    let closed = 0;
    let urgent = 0;

    const companyOpenMap: Record<string, number> = {};

    for (const t of allTickets) {
      if (t.status === "ACIK") open++;
      else if (t.status === "ISLEMDE") inProgress++;
      else if (t.status === "BEKLEMEDE") waiting++;
      else if (t.status === "COZULDU") resolved++;
      else if (t.status === "KAPATILDI") closed++;

      if (t.priority === "ACIL" && (t.status === "ACIK" || t.status === "ISLEMDE" || t.status === "BEKLEMEDE")) {
        urgent++;
      }

      if (t.status === "ACIK" || t.status === "ISLEMDE") {
        companyOpenMap[t.companyId] = (companyOpenMap[t.companyId] || 0) + 1;
      }
    }

    const companyStats = companies.map((c) => ({
      ...c,
      openTickets: companyOpenMap[c.id] || 0,
    }));

    return NextResponse.json({
      counts: {
        total: allTickets.length,
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
