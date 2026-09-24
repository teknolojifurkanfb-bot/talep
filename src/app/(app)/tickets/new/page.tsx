"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket,
  PlusCircle,
  Phone,
  Monitor,
  KeyRound,
  HardDrive,
  Building2,
  CheckCircle2,
  Flame,
  ArrowLeft,
  Loader2,
  Info,
} from "lucide-react";
import Link from "next/link";
import FileUploadZone, { UploadedFileItem } from "@/components/FileUploadZone";
import { CATEGORIES } from "@/components/CategoryBadge";

const PRIORITIES = [
  { id: "DUSUK", label: "Düşük", desc: "Acil olmayan, genel danışma / iyileştirme" },
  { id: "NORMAL", label: "Normal", desc: "Günlük iş akışını aksatmayan problemler" },
  { id: "YUKSEK", label: "Yüksek", desc: "Önemli iş aksaklığı yaratan sorunlar" },
  { id: "ACIL", label: "🚨 Acil (Kritik)", desc: "Tüm çalışmayı durduran sistem / sunucu arızaları" },
];

const REMOTE_APPS = [
  { id: "AnyDesk", label: "AnyDesk" },
  { id: "RustDesk", label: "RustDesk" },
  { id: "TeamViewer", label: "TeamViewer" },
  { id: "Diger", label: "Diğer / Manuel" },
];

export default function NewTicketPage() {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentUser, setCurrentUser] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("YAZILIM");
  const [priority, setPriority] = useState("NORMAL");
  const [companyId, setCompanyId] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [remoteApp, setRemoteApp] = useState("AnyDesk");
  const [remoteId, setRemoteId] = useState("");
  const [remotePassword, setRemotePassword] = useState("");
  const [deviceInfo, setDeviceInfo] = useState("");
  const [attachments, setAttachments] = useState<UploadedFileItem[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();
        setCurrentUser(userData.user);

        if (userData.user?.phone) {
          setContactPhone(userData.user.phone);
        }

        if (userData.user?.role === "SUPER_ADMIN") {
          const compRes = await fetch("/api/companies");
          const compData = await compRes.json();
          setCompanies(compData.companies || []);
          if (compData.companies?.length > 0) {
            setCompanyId(compData.companies[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUser(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError("Lütfen talep başlığı ve açıklamasını eksiksiz girin.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
          companyId: currentUser?.role === "SUPER_ADMIN" ? companyId : undefined,
          contactPhone: contactPhone.trim(),
          remoteApp,
          remoteId: remoteId.trim(),
          remotePassword: remotePassword.trim(),
          deviceInfo: deviceInfo.trim(),
          attachments,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Talep oluşturulamadı.");
      }

      router.push(`/tickets/${data.ticket.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">Yükleniyor...</p>
      </div>
    );
  }

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/tickets"
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Yeni Destek Talebi Oluştur
            </h1>
            <p className="text-xs text-slate-500">
              Karşılaştığınız arızayı, program hatasını veya talebinizi detaylandırın.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Kategori Seçimi */}
        <div className="bg-white p-5 md:p-6 border border-slate-200 rounded-3xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                1
              </span>
              <span>Talep Kategorisi Seçin</span>
            </h3>
            <span className="text-xs text-slate-400">Doğru kategori hızlı müdahale sağlar</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                      isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-snug">{cat.label.split("/")[0]}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{cat.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Talep Detayları & Bilgi */}
        <div className="bg-white p-5 md:p-6 border border-slate-200 rounded-3xl shadow-2xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
              2
            </span>
            <span>Talep Detayları</span>
          </h3>

          {/* Super Admin Company Selector */}
          {isSuperAdmin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 size={14} className="text-blue-600" />
                <span>Destek Verilen Kurum / Müşteri Firma *</span>
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Talep Başlığı / Sorun Özeti *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Logo Muhasebe açılmıyor, Yazıcı ağda çevrimdışı, Outlook şifre hatası"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Sorun Açıklaması & Hata Detayları *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sorun tam olarak ne zaman başladı? Aldığınız hata mesajının metni nedir? Yapmaya çalıştığınız işlem neydi?"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Priority Selection Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Öncelik Derecesi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? p.id === "ACIL"
                          ? "border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20 font-bold"
                          : "border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 font-semibold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <p className="text-xs">{p.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 3: İletişim & Uzaktan Bağlantı Bilgisi */}
        <div className="bg-white p-5 md:p-6 border border-slate-200 rounded-3xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                3
              </span>
              <span>İletişim & Hızlı Uzaktan Bağlantı</span>
            </h3>
            <span className="text-[11px] text-slate-400">Tek tıkla müdahale için önerilir</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone size={13} className="text-blue-600" />
                <span>İletişim Telefon Numarası / Dahili</span>
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="0532 000 00 00 / Dahili: 102"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Device Name / IP */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <HardDrive size={13} className="text-blue-600" />
                <span>Cihaz / Bilgisayar Adı veya IP (Opsiyonel)</span>
              </label>
              <input
                type="text"
                value={deviceInfo}
                onChange={(e) => setDeviceInfo(e.target.value)}
                placeholder="Örn: MUHASEBE-PC1 / 192.168.1.45"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Remote App Card */}
          <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <Monitor size={14} className="text-indigo-600" />
              <span>Uzaktan Masaüstü Bağlantı Programı</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {REMOTE_APPS.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setRemoteApp(app.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    remoteApp === app.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {app.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {remoteApp} ID / Numarası
                </label>
                <input
                  type="text"
                  value={remoteId}
                  onChange={(e) => setRemoteId(e.target.value)}
                  placeholder="Örn: 987 654 321"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <KeyRound size={11} />
                  <span>Geçici Şifre (Varsa)</span>
                </label>
                <input
                  type="text"
                  value={remotePassword}
                  onChange={(e) => setRemotePassword(e.target.value)}
                  placeholder="Örn: 123456"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Görsel & Video Yükleme */}
        <div className="bg-white p-5 md:p-6 border border-slate-200 rounded-3xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                4
              </span>
              <span>Ekran Görüntüsü / Video Kaydı / Dosya Ekle</span>
            </h3>
            <span className="text-xs text-slate-400">İsteğe Bağlı</span>
          </div>

          <FileUploadZone files={attachments} onChange={setAttachments} maxFiles={6} />
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/tickets"
            className="px-5 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-2xl text-sm transition-all"
          >
            İptal
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-600/25 text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Talep Oluşturuluyor...</span>
              </>
            ) : (
              <>
                <PlusCircle size={18} />
                <span>Destek Talebini Gönder</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
