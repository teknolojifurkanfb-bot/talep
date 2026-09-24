"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Ticket as TicketIcon,
  Search,
  Filter,
  PlusCircle,
  Building2,
  Paperclip,
  MessageSquare,
  Monitor,
  Phone,
  RefreshCw,
  Loader2,
  Calendar,
  User,
} from "lucide-react";
import TicketStatusBadge from "@/components/TicketStatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CategoryBadge, { CATEGORIES } from "@/components/CategoryBadge";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

const STATUS_TABS = [
  { id: "ALL", label: "Tümü" },
  { id: "ACIK", label: "Açık / Yeni" },
  { id: "ISLEMDE", label: "İşlemde" },
  { id: "BEKLEMEDE", label: "Beklemede" },
  { id: "COZULDU", label: "Çözüldü" },
];

export default function TicketsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tickets, setTickets] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentUser, setCurrentUser] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [companyId, setCompanyId] = useState("ALL");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);
      if (priority !== "ALL") params.set("priority", priority);
      if (category !== "ALL") params.set("category", category);
      if (companyId !== "ALL") params.set("companyId", companyId);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, category, companyId]);

  useEffect(() => {
    async function init() {
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      setCurrentUser(userData.user);

      if (userData.user?.role === "SUPER_ADMIN") {
        const compRes = await fetch("/api/companies");
        const compData = await compRes.json();
        setCompanies(compData.companies || []);
      }
    }
    init();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchTickets]);

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <TicketIcon className="text-blue-600" />
            <span>Destek Talepleri</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSuperAdmin
              ? "Tüm kurumlardan açılan destek kayıtlarını ve uzaktan bağlantı detaylarını yönetin."
              : "Açılmış destek taleplerinizin durumunu ve teknik çözümleri inceleyin."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTickets}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-2xs"
            title="Yenile"
          >
            <RefreshCw size={16} />
          </button>

          <Link
            href="/tickets/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            <PlusCircle size={16} />
            <span>Yeni Talep Aç</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-2xs space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
          {STATUS_TABS.map((tab) => {
            const isActive = status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Select dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Başlık, No (#TK), Kişi veya Kurum..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Company Filter (Super Admin only) */}
          {isSuperAdmin && (
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="ALL">Tüm Kurumlar / Firmalar</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ALL">Tüm Öncelikler</option>
              <option value="ACIL">🚨 Sadece Acil</option>
              <option value="YUKSEK">Yüksek</option>
              <option value="NORMAL">Normal</option>
              <option value="DUSUK">Düşük</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ALL">Tüm Kategoriler</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500 font-medium">Talepler taranıyor...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
          <TicketIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Kayıt Bulunamadı</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Arama kriterlerinize uyan destek talebi bulunamadı. Filtreleri temizleyebilir veya yeni bir talep oluşturabilirsiniz.
          </p>
          <Link
            href="/tickets/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            <PlusCircle size={14} /> Yeni Talep Aç
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="block p-4 md:p-5 bg-white hover:bg-slate-50/90 border border-slate-200 hover:border-blue-300 rounded-2xl shadow-2xs hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Info & Badges */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                      #{ticket.ticketNumber}
                    </span>
                    <CategoryBadge category={ticket.category} />
                    <PriorityBadge priority={ticket.priority} />
                    <TicketStatusBadge status={ticket.status} />

                    {ticket.remoteApp && ticket.remoteId && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Monitor size={12} />
                        <span>{ticket.remoteApp}: {ticket.remoteId}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm md:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {ticket.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {ticket.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 flex-wrap">
                    {ticket.company && (
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Building2 size={13} className="text-blue-600" />
                        {ticket.company.name}
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-slate-500">
                      <User size={13} className="text-slate-400" />
                      {ticket.user?.name} {ticket.user?.department ? `(${ticket.user.department})` : ""}
                    </span>

                    {ticket.contactPhone && (
                      <span className="flex items-center gap-1 text-slate-500 font-mono">
                        <Phone size={12} className="text-emerald-500" />
                        {ticket.contactPhone}
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar size={13} />
                      {formatDistanceToNow(new Date(ticket.createdAt), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </span>
                  </div>
                </div>

                {/* Right: Badges / Stats Counters */}
                <div className="flex items-center md:flex-col items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {ticket._count?.attachments > 0 && (
                      <span className="flex items-center gap-1 text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                        <Paperclip size={13} />
                        {ticket._count.attachments} Ek
                      </span>
                    )}

                    {ticket._count?.comments > 0 && (
                      <span className="flex items-center gap-1 text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
                        <MessageSquare size={13} />
                        {ticket._count.comments} Yanıt
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    İncele ➔
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
