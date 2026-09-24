"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  AlertCircle,
  Clock,
  CheckCircle2,
  Flame,
  PlusCircle,
  Building2,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Loader2,
  Users,
} from "lucide-react";
import TicketStatusBadge from "@/components/TicketStatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CategoryBadge from "@/components/CategoryBadge";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface DashboardData {
  counts: {
    total: number;
    open: number;
    inProgress: number;
    waiting: number;
    resolved: number;
    closed: number;
    urgent: number;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentTickets: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  companyStats: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);

  const fetchDashboard = async () => {
    try {
      const [statsRes, userRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/auth/me"),
      ]);
      const statsJson = await statsRes.json();
      const userJson = await userRes.json();
      setData(statsJson);
      setUser(userJson.user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">İstatistikler yükleniyor...</p>
      </div>
    );
  }

  const counts = data?.counts || {
    total: 0,
    open: 0,
    inProgress: 0,
    waiting: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
  };

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isCompanyAdmin = user?.role === "COMPANY_ADMIN";

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md mb-3 border border-white/15">
            <TrendingUp size={13} className="text-emerald-400" />
            <span>
              {isSuperAdmin
                ? "Bilgi İşlem Merkezi • Canlı Durum"
                : isCompanyAdmin
                ? `${user?.company?.name || "Kurum"} Destek Paneli`
                : "Personel Destek Masası"}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Merhaba, {user?.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">
            {isSuperAdmin
              ? "Tüm müşteri kurumlarınızdan gelen destek taleplerini, uzaktan bağlantı bilgilerini ve çözümleri buradan yönetebilirsiniz."
              : isCompanyAdmin
              ? "Şirketinizin açtığı destek taleplerini, personel hesaplarını ve çözüm durumlarını takip edebilirsiniz."
              : "Karşılaştığınız bilgisayar, yazılım, yazıcı veya ağ problemlerinde hızlıca yeni destek talebi oluşturabilirsiniz."}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md border border-white/15 transition-all"
            title="Yenile"
          >
            <RefreshCw size={17} />
          </button>

          <Link
            href="/tickets/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 text-sm transition-all active:scale-[0.98]"
          >
            <PlusCircle size={18} />
            <span>Yeni Destek Talebi Aç</span>
          </Link>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Urgent Ticket Alert if any */}
      {counts.urgent > 0 && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300/80 rounded-2xl flex items-center justify-between gap-4 shadow-sm animate-soft-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                {counts.urgent} Adet Acil Müdahale Bekleyen Talep Var!
              </h4>
              <p className="text-xs text-rose-700">
                İşleyişi durduran veya kritik önceliğe sahip talepleri öncelikli olarak inceleyin.
              </p>
            </div>
          </div>
          <Link
            href="/tickets?priority=ACIL"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-all shrink-0 shadow-sm"
          >
            Acil Talepleri Gör
          </Link>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Link
          href="/tickets"
          className="p-4 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl shadow-2xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Toplam Talep</span>
            <Ticket size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{counts.total}</p>
          <span className="text-[11px] text-slate-400">Kayıtlı tüm işler</span>
        </Link>

        <Link
          href="/tickets?status=ACIK"
          className="p-4 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl shadow-2xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-blue-700">Yeni / Açık</span>
            <AlertCircle size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{counts.open}</p>
          <span className="text-[11px] text-slate-400">İnceleme bekleyen</span>
        </Link>

        <Link
          href="/tickets?status=ISLEMDE"
          className="p-4 bg-white border border-slate-200 hover:border-amber-400 rounded-2xl shadow-2xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-amber-700">İşlemde</span>
            <Clock size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{counts.inProgress}</p>
          <span className="text-[11px] text-slate-400">Üzerinde çalışılan</span>
        </Link>

        <Link
          href="/tickets?status=BEKLEMEDE"
          className="p-4 bg-white border border-slate-200 hover:border-purple-400 rounded-2xl shadow-2xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-purple-700">Beklemede</span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{counts.waiting}</p>
          <span className="text-[11px] text-slate-400">Kullanıcı yanıtı / Parça</span>
        </Link>

        <Link
          href="/tickets?status=COZULDU"
          className="p-4 bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl shadow-2xs hover:shadow-md transition-all group col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-emerald-700">Çözülenler</span>
            <CheckCircle2 size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{counts.resolved}</p>
          <span className="text-[11px] text-slate-400">Tamamlanan destekler</span>
        </Link>
      </div>

      {/* Grid: Recent Tickets & Company Health (if Super Admin) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Tickets List */}
        <div className={`space-y-4 ${isSuperAdmin ? "lg:col-span-7" : "lg:col-span-12"}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Ticket size={18} className="text-blue-600" />
              <span>Son Destek Talepleri</span>
            </h3>
            <Link
              href="/tickets"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Tümünü Gör</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden divide-y divide-slate-100">
            {data?.recentTickets && data.recentTickets.length > 0 ? (
              data.recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-all block group"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        #{ticket.ticketNumber}
                      </span>
                      <CategoryBadge category={ticket.category} />
                      <PriorityBadge priority={ticket.priority} size="sm" />
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {ticket.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      {ticket.company && (
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Building2 size={12} className="text-slate-400" />
                          {ticket.company.name}
                        </span>
                      )}
                      <span>Talep Eden: {ticket.user?.name}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(ticket.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="sm:shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <TicketStatusBadge status={ticket.status} size="sm" />
                    <span className="text-[11px] text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Detay <ArrowUpRight size={12} />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                <Ticket className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Henüz açılmış bir destek talebi bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>

        {/* Super Admin: Company Overview Cards */}
        {isSuperAdmin && (
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" />
                <span>Müşteri Kurumlar & Durum</span>
              </h3>
              <Link
                href="/companies"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Yönet</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {data?.companyStats && data.companyStats.length > 0 ? (
                data.companyStats.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{comp.name}</h4>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                            {comp.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Users size={13} className="text-slate-400" />
                            {comp._count.users} Personel
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Ticket size={13} className="text-slate-400" />
                            {comp._count.tickets} Toplam Talep
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            comp.openTickets > 0
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {comp.openTickets > 0 ? `${comp.openTickets} Açık İş` : "Tümü Çözüldü ✓"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  Henüz kayıtlı firma yok.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
