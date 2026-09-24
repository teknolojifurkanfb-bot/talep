import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bilgi İşlem Destek Portalı | Home-Office IT Ticket Sistemi",
  description: "Müşteri kurumlar ve personeller için çoklu firma destek, uzaktan bağlantı ve talep takip sistemi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
