"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Building2,
  Users,
  LifeBuoy,
  X,
  PhoneCall,
} from "lucide-react";
import { SessionUser } from "@/lib/auth";

interface Props {
  user: SessionUser;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ user, isOpen, onClose }: Props) {
  const pathname = usePathname();

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isCompanyAdmin = user.role === "COMPANY_ADMIN";

  const navigation = [
    {
      name: "Kontrol Paneli",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: isSuperAdmin
        ? "Tüm Destek Talepleri"
        : isCompanyAdmin
        ? "Kurum Talepleri"
        : "Taleplerim",
      href: "/tickets",
      icon: Ticket,
      show: true,
    },
    {
      name: "Yeni Talep Aç",
      href: "/tickets/new",
      icon: PlusCircle,
      highlight: true,
      show: true,
    },
    {
      name: "Kurumlar / Firmalar",
      href: "/companies",
      icon: Building2,
      show: isSuperAdmin,
    },
    {
      name: isSuperAdmin ? "Kullanıcı Yönetimi" : "Personel Hesapları",
      href: "/users",
      icon: Users,
      show: isSuperAdmin || isCompanyAdmin,
    },
  ].filter((item) => item.show);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-2xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
              Bilgi İşlem Sistemi
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Action Button for creating ticket */}
        <div className="p-4">
          <Link
            href="/tickets/new"
            onClick={() => onClose()}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
          >
            <PlusCircle size={17} />
            <span>Yeni Talep Oluştur</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-blue-400" : "text-slate-400"}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Support Direct Contact Box */}
        <div className="p-4 m-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold mb-1">
            <PhoneCall size={14} className="text-emerald-400" />
            <span>Bilgi İşlem Acil Destek</span>
          </div>
          <p className="text-xs text-slate-400">
            Kritik sunucu/ağ kesintilerinde doğrudan arayabilirsiniz:
          </p>
          <div className="mt-2 text-xs font-mono font-bold text-white bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center justify-between">
            <span>+90 555 123 45 67</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Aktif" />
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <LifeBuoy size={14} className="text-blue-400" />
            <span>v1.0 • Multi-Tenant</span>
          </div>
          <span className="text-slate-400">Home-Office</span>
        </div>
      </aside>
    </>
  );
}
