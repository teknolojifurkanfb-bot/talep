import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail, generateTicketStatusUpdatedEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        company: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            department: true,
          },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        attachments: {
          orderBy: { uploadedAt: "desc" },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: { id: true, name: true, role: true, email: true },
            },
            attachments: true,
          },
        },
        history: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }

    // Role-based access check
    if (user.role === "USER" && ticket.userId !== user.id) {
      return NextResponse.json({ error: "Bu talebi görüntüleme yetkiniz yok." }, { status: 403 });
    }
    if (user.role === "COMPANY_ADMIN" && ticket.companyId !== user.companyId) {
      return NextResponse.json({ error: "Firma talepleriniz dışındaki talepleri görüntüleyemezsiniz." }, { status: 403 });
    }

    // Filter out internal comments if user is not SUPER_ADMIN
    if (user.role !== "SUPER_ADMIN") {
      ticket.comments = ticket.comments.filter((c) => !c.isInternal);
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("[Get Single Ticket Error]:", error);
    return NextResponse.json(
      { error: "Talep detayları alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
      include: { user: true, company: true },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }

    // Authorization checks
    if (user.role === "USER" && existingTicket.userId !== user.id) {
      return NextResponse.json({ error: "Bu talebi güncelleme yetkiniz yok." }, { status: 403 });
    }
    if (user.role === "COMPANY_ADMIN" && existingTicket.companyId !== user.companyId) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const {
      status,
      priority,
      category,
      assignedToId,
      contactPhone,
      remoteApp,
      remoteId,
      remotePassword,
      deviceInfo,
    } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    const historyLogs = [];

    if (status && status !== existingTicket.status) {
      updateData.status = status;
      if (status === "COZULDU" || status === "KAPATILDI") {
        updateData.resolvedAt = new Date();
      }
      historyLogs.push({
        actorName: user.name,
        action: "DURUM_DEGISTI",
        oldValue: existingTicket.status,
        newValue: status,
      });

      // Send status change email to ticket creator (async)
      if (existingTicket.user?.email) {
        const emailHtml = generateTicketStatusUpdatedEmail({
          ticketNumber: existingTicket.ticketNumber,
          title: existingTicket.title,
          oldStatus: existingTicket.status,
          newStatus: status,
        });
        sendEmail({
          to: existingTicket.user.email,
          subject: `[Talep #${existingTicket.ticketNumber} Güncellendi] ${status}`,
          html: emailHtml,
        }).catch((e) => console.error("Async email error:", e));
      }
    }

    if (priority && priority !== existingTicket.priority && user.role === "SUPER_ADMIN") {
      updateData.priority = priority;
      historyLogs.push({
        actorName: user.name,
        action: "ONCELIK_DEGISTI",
        oldValue: existingTicket.priority,
        newValue: priority,
      });
    }

    if (category && category !== existingTicket.category) {
      updateData.category = category;
    }

    if (assignedToId !== undefined && user.role === "SUPER_ADMIN") {
      updateData.assignedToId = assignedToId || null;
      historyLogs.push({
        actorName: user.name,
        action: "ATAMA_YAPILDI",
        newValue: assignedToId ? "Atandı" : "Atama Kaldırıldı",
      });
    }

    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (remoteApp !== undefined) updateData.remoteApp = remoteApp;
    if (remoteId !== undefined) updateData.remoteId = remoteId;
    if (remotePassword !== undefined) updateData.remotePassword = remotePassword;
    if (deviceInfo !== undefined) updateData.deviceInfo = deviceInfo;

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        ...updateData,
        history: {
          create: historyLogs,
        },
      },
      include: {
        company: true,
        user: true,
        assignedTo: true,
        attachments: true,
        history: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("[Update Ticket Error]:", error);
    return NextResponse.json(
      { error: "Talep güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Sadece Süper Admin talep silebilir." }, { status: 403 });
    }

    const { id } = await params;
    await prisma.ticket.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Delete Ticket Error]:", error);
    return NextResponse.json(
      { error: "Talep silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
