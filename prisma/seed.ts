import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Veritabanı tohumlanıyor (Seed)...");

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
      systemName: "Bilgi İşlem Destek Portalı",
      supportPhone: "+90 555 123 45 67",
      notificationEmail: "destek@bilgiislem.com",
    },
  });

  const superAdminPassword = await bcrypt.hash("admin123", 10);
  const companyAdminPassword = await bcrypt.hash("yonetici123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  // 3. Super Admin (Siz - Bilgi İşlem / IT Sorumlusu)
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@bilgiislem.com",
      password: superAdminPassword,
      name: "Furkan (Bilgi İşlem Uzmanı)",
      phone: "0555 000 00 00",
      role: "SUPER_ADMIN",
      department: "Bilgi Teknolojileri",
    },
  });

  // 4. Firma 1: Atlas Lojistik A.Ş.
  const company1 = await prisma.company.create({
    data: {
      name: "Atlas Lojistik A.Ş.",
      code: "ATLAS-01",
      contactEmail: "info@atlaslojistik.com",
      contactPhone: "0212 555 01 01",
      address: "Büyükdere Cad. No:123 Levent / İstanbul",
      notes: "Aylık 20 saat uzaktan + yerinde destek sözleşmesi mevcut.",
    },
  });

  // Firma 1 Admin
  const company1Admin = await prisma.user.create({
    data: {
      email: "ahmet@atlaslojistik.com",
      password: companyAdminPassword,
      name: "Ahmet Yılmaz (Firma Yöneticisi)",
      phone: "0532 111 22 33",
      role: "COMPANY_ADMIN",
      companyId: company1.id,
      department: "Genel Müdürlük",
    },
  });

  // Firma 1 Personelleri
  const user1 = await prisma.user.create({
    data: {
      email: "mehmet@atlaslojistik.com",
      password: userPassword,
      name: "Mehmet Demir",
      phone: "0533 222 33 44",
      role: "USER",
      companyId: company1.id,
      department: "Muhasebe & Finans",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "ayse@atlaslojistik.com",
      password: userPassword,
      name: "Ayşe Kaya",
      phone: "0534 333 44 55",
      role: "USER",
      companyId: company1.id,
      department: "Operasyon & Sevkiyat",
    },
  });

  // 5. Firma 2: Nova Mimarlık & Tasarım
  const company2 = await prisma.company.create({
    data: {
      name: "Nova Mimarlık & Tasarım",
      code: "NOVA-02",
      contactEmail: "destek@novamimarlik.com",
      contactPhone: "0216 444 02 02",
      address: "Bağdat Cad. No:45 Kadıköy / İstanbul",
      notes: "AutoCAD ve Render sunucusu bakımı yapılıyor.",
    },
  });

  const company2Admin = await prisma.user.create({
    data: {
      email: "zeynep@novamimarlik.com",
      password: companyAdminPassword,
      name: "Zeynep Çelik (Firma Yöneticisi)",
      phone: "0535 444 55 66",
      role: "COMPANY_ADMIN",
      companyId: company2.id,
      department: "Yönetim",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "can@novamimarlik.com",
      password: userPassword,
      name: "Can Öztürk",
      phone: "0536 555 66 77",
      role: "USER",
      companyId: company2.id,
      department: "3D Render & Görselleştirme",
    },
  });

  // 6. Örnek Ticketlar (Talepler)
  const ticket1 = await prisma.ticket.create({
    data: {
      ticketNumber: "TK-2026-0001",
      title: "Logo Tiger Muhasebe Programı Açılmıyor (Hata: SQL Server Connection)",
      description: "Sabah bilgisayarı açtığımda Logo Tiger simgesine tıkladığımda 'Veritabanı bağlantısı sağlanamadı' hatası alıyorum. Faturaları kesmem gerekiyor acil destek rica ederim.",
      category: "YAZILIM",
      priority: "ACIL",
      status: "ISLEMDE",
      contactPhone: "0533 222 33 44 (Dahili: 104)",
      remoteApp: "AnyDesk",
      remoteId: "847 291 039",
      remotePassword: "123",
      deviceInfo: "MUHASEBE-PC02 / IP: 192.168.1.45",
      companyId: company1.id,
      userId: user1.id,
      assignedToId: superAdmin.id,
      comments: {
        create: [
          {
            userId: superAdmin.id,
            content: "Merhaba Mehmet Bey, AnyDesk üzerinden bağlandım. SQL Server servisinin durduğunu gördüm, servisi yeniden başlatıp tablo indekslerini kontrol ediyorum.",
            isInternal: false,
          },
        ],
      },
      history: {
        create: [
          {
            actorName: "Mehmet Demir",
            action: "TALEP_ACILDI",
            oldValue: null,
            newValue: "ACIK",
          },
          {
            actorName: "Furkan (Bilgi İşlem)",
            action: "DURUM_DEGISTI",
            oldValue: "ACIK",
            newValue: "ISLEMDE",
          },
        ],
      },
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      ticketNumber: "TK-2026-0002",
      title: "Barkod ve Etiket Yazıcısı Ağda Çevrimdışı Görünüyor",
      description: "Sevkiyat deposundaki Zebra ZT410 barkod yazıcısına etiket gönderemiyoruz. Yazıcı açık ancak bilgisayarlarda çevrimdışı uyarısı veriyor.",
      category: "YAZICI",
      priority: "YUKSEK",
      status: "ACIK",
      contactPhone: "0534 333 44 55",
      remoteApp: "RustDesk",
      remoteId: "938 102 441",
      deviceInfo: "DEPO-ZEBRA-01 / IP: 192.168.1.200",
      companyId: company1.id,
      userId: user2.id,
      history: {
        create: [
          {
            actorName: "Ayşe Kaya",
            action: "TALEP_ACILDI",
            oldValue: null,
            newValue: "ACIK",
          },
        ],
      },
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      ticketNumber: "TK-2026-0003",
      title: "3ds Max V-Ray Lisans Sunucusu Bağlantı Hatası",
      description: "Render alırken V-Ray lisans hatası veriyor. Ağ lisans sunucusuna ping atabiliyorum ancak lisansı çekemiyor.",
      category: "YAZILIM",
      priority: "NORMAL",
      status: "COZULDU",
      contactPhone: "0536 555 66 77",
      remoteApp: "TeamViewer",
      remoteId: "1 234 567 890",
      remotePassword: "pass",
      deviceInfo: "RENDER-WORKSTATION-01",
      companyId: company2.id,
      userId: user3.id,
      assignedToId: superAdmin.id,
      resolvedAt: new Date(),
      comments: {
        create: [
          {
            userId: superAdmin.id,
            content: "Lisans dongle servisi sunucuda takılmıştı, Chaos Group lisans servisi restart edildi ve güvenlik duvarı 30304 port kuralı güncellendi. Test edildi, render çalışıyor.",
            isInternal: false,
          },
        ],
      },
      history: {
        create: [
          {
            actorName: "Can Öztürk",
            action: "TALEP_ACILDI",
            newValue: "ACIK",
          },
          {
            actorName: "Furkan (Bilgi İşlem)",
            action: "DURUM_DEGISTI",
            oldValue: "ISLEMDE",
            newValue: "COZULDU",
          },
        ],
      },
    },
  });

  console.log("✅ Seed işlemi başarıyla tamamlandı!");
  console.log("-----------------------------------------");
  console.log("🔑 GİRİŞ BİLGİLERİ:");
  console.log("1. Süper Admin (Siz - Bilgi İşlem):");
  console.log("   E-posta: admin@bilgiislem.com | Şifre: admin123");
  console.log("2. Firma 1 Admin (Atlas Lojistik):");
  console.log("   E-posta: ahmet@atlaslojistik.com | Şifre: yonetici123");
  console.log("3. Firma 1 Personel (Atlas Lojistik):");
  console.log("   E-posta: mehmet@atlaslojistik.com | Şifre: user123");
  console.log("4. Firma 2 Admin (Nova Mimarlık):");
  console.log("   E-posta: zeynep@novamimarlik.com | Şifre: yonetici123");
  console.log("5. Firma 2 Personel (Nova Mimarlık):");
  console.log("   E-posta: can@novamimarlik.com | Şifre: user123");
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
