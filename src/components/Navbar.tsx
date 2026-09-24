"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Building2,
  ShieldCheck,
  User as UserIcon,
  Headphones,
  Bell,
  Menu,
} from "lucide-react";
import { SessionUser } from "@/lib/auth";

interface Props {
  user: SessionUser;
  onToggleSidebar?: () => void;
}

export default function Navbar({ user, onToggleSidebar }: Props) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const roleLabel = {
    SUPER_ADMIN: "Bilgi İşlem Yetkilisi (Süper Admin)",
    COMPANY_ADMIN: "Firma Yöneticisi",
    USER: "Personel / Kullanıcı",
  }[user.role];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100"
          aria-label="Menüyü Aç"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
              IT Destek Portalı
            </h1>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Bilgi İşlem & Talep Takip Sistemi
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Company Badge if applicable */}
        {user.companyName && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
            <Building2 size={13} className="text-blue-600" />
            <span>{user.companyName}</span>
          </div>
        )}

        {/* User Role Tag */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs font-medium text-blue-700">
          <ShieldCheck size={13} />
          <span>{roleLabel}</span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold ring-2 ring-blue-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-400 leading-none">
              {user.department || user.email}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-all"
          title="Çıkış Yap"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Çıkış</span>
        </button>
      </div>
    </header>
  );
}
