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
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });

    const host = process.env.SMTP_HOST || settings?.smtpHost || "";
    const port = parseInt(process.env.SMTP_PORT || String(settings?.smtpPort || 587));
    const user = process.env.SMTP_USER || settings?.smtpUser || "";
    const pass = process.env.SMTP_PASS || settings?.smtpPassword || "";
    const from = process.env.SMTP_FROM || settings?.smtpFrom || '"Bilgi İşlem Destek Portalı" <destek@bilgiislem.com>';

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

export function generateTicketCreatedEmail({
  ticketNumber,
  title,
  userName,
  companyName,
  priority,
  category,
}: {
  ticketNumber: string;
  title: string;
  userName: string;
  companyName: string;
  priority: string;
  category: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 20px; border-radius: 6px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 22px;">Yeni Destek Talebi Açıldı</h2>
        <p style="margin: 5px 0 0; opacity: 0.9;">Talep No: <strong>#${ticketNumber}</strong></p>
      </div>
      <div style="padding: 20px 10px;">
        <p style="color: #334155; font-size: 15px;">Merhaba,</p>
        <p style="color: #334155; font-size: 15px;"><strong>${companyName}</strong> firmasından <strong>${userName}</strong> tarafından yeni bir destek talebi iletildi.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Talep Başlığı:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${title}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Kategori:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${category}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Öncelik:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${priority}</td>
          </tr>
        </table>

        <p style="color: #64748b; font-size: 13px;">Talebi incelemek ve yanıtlamak için portala giriş yapabilirsiniz.</p>
      </div>
      <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 15px; color: #94a3b8; font-size: 12px;">
        Bilgi İşlem Destek Portalı &copy; ${new Date().getFullYear()}
      </div>
    </div>
  `;
}

export function generateTicketStatusUpdatedEmail({
  ticketNumber,
  title,
  oldStatus,
  newStatus,
}: {
  ticketNumber: string;
  title: string;
  oldStatus: string;
  newStatus: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #0f766e, #0d9488); padding: 20px; border-radius: 6px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 22px;">Destek Talebi Güncellendi</h2>
        <p style="margin: 5px 0 0; opacity: 0.9;">Talep No: <strong>#${ticketNumber}</strong></p>
      </div>
      <div style="padding: 20px 10px;">
        <p style="color: #334155; font-size: 15px;">Merhaba,</p>
        <p style="color: #334155; font-size: 15px;"><strong>"${title}"</strong> başlıklı destek talebinizin durumu güncellendi.</p>
        
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: center;">
          <span style="color: #64748b; text-decoration: line-through; margin-right: 10px;">${oldStatus}</span>
          <span style="color: #15803d; font-size: 18px; font-weight: bold;">➜ ${newStatus}</span>
        </div>

        <p style="color: #64748b; font-size: 13px;">Gelişmeleri ve varsa eklenen yanıtları portal üzerinden takip edebilirsiniz.</p>
      </div>
      <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 15px; color: #94a3b8; font-size: 12px;">
        Bilgi İşlem Destek Portalı &copy; ${new Date().getFullYear()}
      </div>
    </div>
  `;
}
