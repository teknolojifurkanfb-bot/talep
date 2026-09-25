import nodemailer from "nodemailer";
import { prisma } from "./prisma";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendMailOptions) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = (await prisma.systemSettings.findUnique({
      where: { id: "default" },
    }).catch(() => null)) as any;

    const host = process.env.SMTP_HOST || settings?.smtpHost || "";
    const port = parseInt(process.env.SMTP_PORT || String(settings?.smtpPort || 587));
    const user = process.env.SMTP_USER || settings?.smtpUser || "";
    const pass = process.env.SMTP_PASS || settings?.smtpPassword || "";
    const from = process.env.SMTP_FROM || settings?.smtpFrom || '"Novatra Destek Portalı" <destek@novatra.com>';

    if (!host || !user) {
      console.log(`[E-Posta Simülasyonu - SMTP Yapılandırılmamış]`);
      console.log(`Kime: ${to}`);
      console.log(`Konu: ${subject}`);
      console.log(`İçerik Özeti: ${text || subject}`);
      return { success: true, simulated: true };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: user || undefined,
        pass: pass || undefined,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || subject,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[E-posta Gönderme Hatası]:", error);
    return { success: false, error };
  }
}

// 1. IT Uzmanlarına Yeni Talep Bildirimi
export function generateTicketCreatedAdminEmail({
  ticketNumber,
  title,
  description,
  userName,
  companyName,
  priority,
  category,
  contactPhone,
}: {
  ticketNumber: string;
  title: string;
  description: string;
  userName: string;
  companyName: string;
  priority: string;
  category: string;
  contactPhone?: string | null;
}) {
  const priorityColor =
    priority === "ACIL" ? "#dc2626" : priority === "YUKSEK" ? "#ea580c" : "#2563eb";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 24px; border-radius: 8px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">Yeni Destek Talebi Açıldı</h2>
        <div style="display: inline-block; margin-top: 8px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">
          #${ticketNumber}
        </div>
      </div>
      
      <div style="padding: 24px 8px;">
        <p style="color: #334155; font-size: 15px; margin-top: 0;">
          <strong>${companyName}</strong> firmasından <strong>${userName}</strong> yeni bir destek talebi oluşturdu.
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #0f172a;">${title}</h3>
          <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${description}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 600; width: 35%;">Firma:</td>
            <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${companyName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Talep Sahibi:</td>
            <td style="padding: 10px 0; color: #0f172a;">${userName}</td>
          </tr>
          ${
            contactPhone
              ? `<tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 600;">İletişim Tel:</td>
            <td style="padding: 10px 0; color: #0f172a;">${contactPhone}</td>
          </tr>`
              : ""
          }
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Kategori:</td>
            <td style="padding: 10px 0; color: #0f172a;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Öncelik:</td>
            <td style="padding: 10px 0; font-weight: 700; color: ${priorityColor};">${priority}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://novatradestektalep.vercel.app/tickets" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
            Talebi Görüntüle ve Yanıtla ➔
          </a>
        </div>
      </div>

      <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 10px; color: #94a3b8; font-size: 12px;">
        Novatra IT Destek Portalı &copy; ${new Date().getFullYear()}
      </div>
    </div>
  `;
}

// 2. Talebi Açan Kullanıcıya Teyit Bildirimi ("Talebiniz Alındı")
export function generateTicketConfirmationEmail({
  ticketNumber,
  title,
  userName,
}: {
  ticketNumber: string;
  title: string;
  userName: string;
}) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 24px; border-radius: 8px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Destek Talebiniz Alındı</h2>
        <div style="display: inline-block; margin-top: 8px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">
          Takip No: #${ticketNumber}
        </div>
      </div>
      
      <div style="padding: 24px 8px;">
        <p style="color: #334155; font-size: 15px; margin-top: 0;">Sayın <strong>${userName}</strong>,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          <strong>"${title}"</strong> başlıklı destek talebiniz başarıyla sistemimize kaydedilmiş ve teknik ekibimize iletilmiştir.
        </p>

        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 20px 0; color: #065f46; font-size: 14px; line-height: 1.5;">
          ✓ Talebiniz en kısa sürede incelenecek ve durum değişiklikleri veya teknik uzman yanıtları e-posta adresinize bildirilecektir.
        </div>

        <div style="text-align: center; margin-top: 25px;">
          <a href="https://novatradestektalep.vercel.app/tickets" style="background-color: #059669; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
            Talebinizi Takip Edin ➔
          </a>
        </div>
      </div>

      <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 10px; color: #94a3b8; font-size: 12px;">
        Novatra IT Destek Portalı &copy; ${new Date().getFullYear()}
      </div>
    </div>
  `;
}

// 3. Talep Durum Güncellemesi Bildirimi
export function generateTicketStatusUpdatedEmail({
  ticketNumber,
  title,
  userName,
  oldStatus,
  newStatus,
}: {
  ticketNumber: string;
  title: string;
  userName?: string;
  oldStatus: string;
  newStatus: string;
}) {
  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    ACIK: { label: "Açık / Yeni", color: "#2563eb", bg: "#eff6ff" },
    ISLEMDE: { label: "İşlemde / İnceleniyor", color: "#d97706", bg: "#fffbeb" },
    BEKLEMEDE: { label: "Beklemede", color: "#7c3aed", bg: "#f5f3ff" },
    COZULDU: { label: "Çözüldü", color: "#16a34a", bg: "#f0fdf4" },
    KAPATILDI: { label: "Kapatıldı", color: "#475569", bg: "#f8fafc" },
  };

  const current = statusLabels[newStatus] || { label: newStatus, color: "#2563eb", bg: "#eff6ff" };
  const prev = statusLabels[oldStatus]?.label || oldStatus;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #0f766e, #0d9488); padding: 24px; border-radius: 8px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Talep Durumu Güncellendi</h2>
        <div style="display: inline-block; margin-top: 8px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">
          #${ticketNumber}
        </div>
      </div>
      
      <div style="padding: 24px 8px;">
        <p style="color: #334155; font-size: 15px; margin-top: 0;">Sayın <strong>${userName || "Kullanıcı"}</strong>,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          <strong>"${title}"</strong> başlıklı destek talebinizin durumu teknik uzmanlarımız tarafından güncellendi.
        </p>
        
        <div style="background-color: ${current.bg}; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 24px 0; text-align: center;">
          <div style="color: #94a3b8; font-size: 13px; margin-bottom: 6px; text-decoration: line-through;">Eski Durum: ${prev}</div>
          <div style="color: ${current.color}; font-size: 18px; font-weight: 700;">Yeni Durum: ${current.label}</div>
        </div>

        <div style="text-align: center; margin-top: 25px;">
          <a href="https://novatradestektalep.vercel.app/tickets" style="background-color: #0d9488; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
            Talebi İnceleyin ➔
          </a>
        </div>
      </div>

      <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 10px; color: #94a3b8; font-size: 12px;">
        Novatra IT Destek Portalı &copy; ${new Date().getFullYear()}
      </div>
    </div>
  `;
}

// 4. Yeni Mesaj / Yanıt Bildirimi
export function generateCommentNotificationEmail({
  ticketNumber,
  title,
  authorName,
  authorRole,
  commentContent,
  recipientName,
}: {
  ticketNumber: string;
  title: string;
  authorName: string;
  authorRole: string;
  commentContent: string;
  recipientName: string;
}) {
  const isItSpecialist = authorRole === "SUPER_ADMIN";
  const badgeLabel = isItSpecialist ? "Destek Uzmanı" : "Kullanıcı";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #4338ca, #6366f1); padding: 24px; border-radius: 8px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Talebe Yeni Yanıt Eklendi</h2>
        <div style="display: inline-block; margin-top: 8px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">
          #${ticketNumber}
        </div>
      </div>
      
      <div style="padding: 24px 8px;">
        <p style="color: #334155; font-size: 15px; margin-top: 0;">Sayın <strong>${recipientName}</strong>,</p>
        <p style="color: #334155; font-size: 15px;">
          <strong>"${title}"</strong> başlıklı talebe <strong>${authorName} (${badgeLabel})</strong> tarafından yeni bir mesaj yazıldı:
        </p>

        <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; border-radius: 0 8px 8px 0; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${commentContent}</p>
        </div>

        <div style="text-align: center; margin-top: 25px;">
          <a href="https://novatradestektalep.vercel.app/tickets" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
            Mesajı Cevapla ➔
          </a>
        </div>
      </div>

      <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 10px; color: #94a3b8; font-size: 12px;">
        Novatra IT Destek Portalı &copy; ${new Date().getFullYear()}
      </div>
    </div>
  `;
}

// 5. Talep Uzmana Atandığında Bildirim
export function generateTicketAssignedEmail({
  ticketNumber,
  title,
  companyName,
  assignedByName,
  specialistName,
}: {
  ticketNumber: string;
  title: string;
  companyName: string;
  assignedByName: string;
  specialistName: string;
}) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #0284c7, #0ea5e9); padding: 24px; border-radius: 8px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Size Yeni Bir Talep Atandı</h2>
        <div style="display: inline-block; margin-top: 8px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">
          #${ticketNumber}
        </div>
      </div>
      
      <div style="padding: 24px 8px;">
        <p style="color: #334155; font-size: 15px; margin-top: 0;">Merhaba <strong>${specialistName}</strong>,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          <strong>${assignedByName}</strong> tarafından <strong>${companyName}</strong> firmasına ait <strong>"${title}"</strong> başlıklı destek talebi sizin takibinize atandı.
        </p>

        <div style="text-align: center; margin-top: 25px;">
          <a href="https://novatradestektalep.vercel.app/tickets" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
            Talebi İncele ve Başla ➔
          </a>
        </div>
      </div>

      <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 10px; color: #94a3b8; font-size: 12px;">
        Novatra IT Destek Portalı &copy; ${new Date().getFullYear()}
      </div>
    </div>
  `;
}
