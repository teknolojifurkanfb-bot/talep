import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Veritabanı temizleniyor ve tekil Süper Admin oluşturuluyor...");

  // 1. Temizlik
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticketHistory.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  await prisma.systemSettings.deleteMany();

  // 2. Sistem Ayarları
  await prisma.systemSettings.create({
    data: {
      id: "default",
      systemName: "Novatra Destek Portalı",
      supportPhone: "+90 555 123 45 67",
      notificationEmail: "destek@novatra.com",
    },
  });

  // 3. Tekil Süper Admin (Siz)
  const superAdminPassword = await bcrypt.hash("admin123", 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@novatra.com",
      password: superAdminPassword,
      name: "Furkan (Bilgi İşlem Yöneticisi)",
      phone: "0555 123 45 67",
      role: "SUPER_ADMIN",
      department: "Bilgi Teknolojileri",
    },
  });

  console.log("✅ Süper Admin başarıyla oluşturuldu!");
  console.log("-----------------------------------------");
  console.log("🔑 SÜPER ADMİN GİRİŞ BİLGİLERİNİZ:");
  console.log("   E-Posta : admin@novatra.com");
  console.log("   Şifre   : admin123");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
