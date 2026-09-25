import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    let settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: "default",
          systemName: "Novatra Destek Portalı",
          supportPhone: "+90 555 123 45 67",
          notificationEmail: "destek@novatra.com",
          smtpPort: 587,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[Get Settings Error]:", error);
    return NextResponse.json(
      { error: "Ayarlar yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const body = await request.json();
    const {
      systemName,
      supportPhone,
      notificationEmail,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpFrom,
      testEmailTarget,
    } = body;

    // If user clicked "Test Mail Send"
    if (testEmailTarget) {
      const result = await sendEmail({
        to: testEmailTarget,
        subject: "[Novatra Destek Portalı] Test E-postası Başarılı!",
        text: "Tebrikler! SMTP e-posta sunucusu bağlantınız ve bildirim altyapınız başarıyla çalışıyor.",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #16a34a; margin-top: 0;">✓ E-Posta Testi Başarılı</h2>
            <p style="color: #334155;">Bu mesaj Novatra Destek Portalı SMTP yapılandırmanızı doğrulamak için gönderildi.</p>
            <p style="color: #64748b; font-size: 13px;">Artık talep açılışları, durum güncellemeleri ve personel yanıtları anında e-posta ile iletilecektir.</p>
          </div>
        `,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: "Test e-postası gönderilemedi. Lütfen SMTP bilgilerinizi kontrol ediniz." },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, message: "Test e-postası başarıyla gönderildi!" });
    }

    const updated = await prisma.systemSettings.upsert({
      where: { id: "default" },
      update: {
        systemName: systemName || "Novatra Destek Portalı",
        supportPhone: supportPhone || null,
        notificationEmail: notificationEmail || null,
        smtpHost: smtpHost || null,
        smtpPort: smtpPort ? parseInt(String(smtpPort)) : 587,
        smtpUser: smtpUser || null,
        smtpPassword: smtpPassword || null,
        smtpFrom: smtpFrom || null,
      },
      create: {
        id: "default",
        systemName: systemName || "Novatra Destek Portalı",
        supportPhone: supportPhone || null,
        notificationEmail: notificationEmail || null,
        smtpHost: smtpHost || null,
        smtpPort: smtpPort ? parseInt(String(smtpPort)) : 587,
        smtpUser: smtpUser || null,
        smtpPassword: smtpPassword || null,
        smtpFrom: smtpFrom || null,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("[Update Settings Error]:", error);
    return NextResponse.json(
      { error: "Ayarlar kaydedilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
