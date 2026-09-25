import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail, generateCommentNotificationEmail } from "@/lib/mail";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content, isInternal = false, attachments = [] } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Yorum içeriği boş olamaz." }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }

    // Role check: Only SUPER_ADMIN can post internal notes
    const actualIsInternal = user.role === "SUPER_ADMIN" ? !!isInternal : false;

    if (user.role === "USER" && ticket.userId !== user.id) {
      return NextResponse.json({ error: "Bu talebe yorum yapma yetkiniz yok." }, { status: 403 });
    }
    if (user.role === "COMPANY_ADMIN" && ticket.companyId !== user.companyId) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const comment = await prisma.comment.create({
      data: {
        ticketId: id,
        userId: user.id,
        content: content.trim(),
        isInternal: actualIsInternal,
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
              ticketId: id,
            })
          ),
        },
      },
      include: {
        user: {
          select: { id: true, name: true, role: true, email: true },
        },
        attachments: true,
      },
    });

    // Update ticket updatedAt timestamp
    await prisma.ticket.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Send email notification for the new comment
    if (!actualIsInternal) {
      if (user.role === "SUPER_ADMIN") {
        // IT Specialist replied -> Notify the ticket creator (User)
        if (ticket.user?.email && ticket.user.id !== user.id) {
          const emailHtml = generateCommentNotificationEmail({
            ticketNumber: ticket.ticketNumber,
            title: ticket.title,
            authorName: user.name,
            authorRole: user.role,
            commentContent: comment.content,
            recipientName: ticket.user.name,
          });

          sendEmail({
            to: ticket.user.email,
            subject: `[Yeni Yanıt #${ticket.ticketNumber}] ${ticket.title}`,
            html: emailHtml,
          }).catch((e) => console.error("Comment email to user error:", e));
        }
      } else {
        // User replied -> Notify IT Admins & Assigned Specialist
        prisma.user
          .findMany({
            where: { role: "SUPER_ADMIN", isActive: true },
            select: { email: true, name: true },
          })
          .then((admins) => {
            const recipientEmails = new Set<string>();
            admins.forEach((a) => recipientEmails.add(a.email));
            if (ticket.assignedTo?.email) {
              recipientEmails.add(ticket.assignedTo.email);
            }

            for (const adminEmail of recipientEmails) {
              const emailHtml = generateCommentNotificationEmail({
                ticketNumber: ticket.ticketNumber,
                title: ticket.title,
                authorName: user.name,
                authorRole: user.role,
                commentContent: comment.content,
                recipientName: "Teknik Ekip",
              });

              sendEmail({
                to: adminEmail,
                subject: `[Kullanıcı Yanıtı #${ticket.ticketNumber}] ${ticket.title}`,
                html: emailHtml,
              });
            }
          })
          .catch((e) => console.error("Comment email to admins error:", e));
      }
    }

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("[Create Comment Error]:", error);
    return NextResponse.json(
      { error: "Yorum eklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
