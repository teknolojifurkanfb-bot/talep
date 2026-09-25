import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail, generateTicketCreatedEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";
    const category = searchParams.get("category") || "";
    const companyId = searchParams.get("companyId") || "";

    // Base filter depending on Role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (user.role === "USER") {
      where.userId = user.id;
    } else if (user.role === "COMPANY_ADMIN") {
      where.companyId = user.companyId;
    } else if (user.role === "SUPER_ADMIN") {
      if (companyId) {
        where.companyId = companyId;
      }
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (priority && priority !== "ALL") {
      where.priority = priority;
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (search.trim()) {
      where.OR = [
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { company: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: { id: true, name: true, code: true },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true, department: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { comments: true, attachments: true },
        },
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("[Get Tickets Error]:", error);
    return NextResponse.json(
      { error: "Talepler alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category = "YAZILIM",
      priority = "NORMAL",
      contactPhone,
      remoteApp,
      remoteId,
      remotePassword,
      deviceInfo,
      companyId: explicitCompanyId,
      attachments = [],
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Başlık ve açıklama alanları zorunludur." },
        { status: 400 }
      );
    }

    const targetCompanyId =
      user.role === "SUPER_ADMIN" ? explicitCompanyId || user.companyId : user.companyId;

    if (!targetCompanyId) {
      return NextResponse.json(
        { error: "Talep için bir firma belirlenmelidir." },
        { status: 400 }
      );
    }

    // Generate readable Ticket number
    const count = await prisma.ticket.count();
    const currentYear = new Date().getFullYear();
    const ticketNumber = `TK-${currentYear}-${String(count + 1).padStart(4, "0")}`;

    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title,
        description,
        category,
        priority,
        status: "ACIK",
        contactPhone: contactPhone || user.phone,
        remoteApp: remoteApp || null,
        remoteId: remoteId || null,
        remotePassword: remotePassword || null,
        deviceInfo: deviceInfo || null,
        companyId: targetCompanyId,
        userId: user.id,
        history: {
          create: {
            actorName: user.name,
            action: "TALEP_OLUSTURULDU",
            newValue: "ACIK",
          },
        },
        attachments: {
          create: attachments.map(
            (att: {
              fileName: string;
              fileUrl: string;
              fileType: string;
              mimeType?: string;
              fileSize: number;
            }) => ({
              fileName: att.fileName,
              fileUrl: att.fileUrl,
              fileType: att.fileType,
              mimeType: att.mimeType,
              fileSize: att.fileSize,
            })
          ),
        },
      },
      include: {
        company: true,
        user: true,
        attachments: true,
      },
    });

    // Notify IT Specialist / Admin via Email (fire and forget for speed)
    prisma.user
      .findMany({
        where: { role: "SUPER_ADMIN", isActive: true },
        select: { email: true },
      })
      .then((itAdmins) => {
        const emailHtml = generateTicketCreatedEmail({
          ticketNumber: newTicket.ticketNumber,
          title: newTicket.title,
          userName: user.name,
          companyName: newTicket.company.name,
          priority: newTicket.priority,
          category: newTicket.category,
        });

        for (const admin of itAdmins) {
          sendEmail({
            to: admin.email,
            subject: `[Yeni Destek Talebi #${newTicket.ticketNumber}] ${newTicket.title}`,
            html: emailHtml,
          });
        }
      })
      .catch((e) => console.error("Email notification async error:", e));

    return NextResponse.json({
      success: true,
      ticket: newTicket,
    });
  } catch (error) {
    console.error("[Create Ticket Error]:", error);
    return NextResponse.json(
      { error: "Talep oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
