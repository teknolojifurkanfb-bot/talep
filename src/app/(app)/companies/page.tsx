"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  PlusCircle,
  Users,
  Ticket,
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit2,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  X,
} from "lucide-react";

export default function CompaniesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openCreateModal = () => {
    setEditingCompany(null);
    setName("");
    setCode("");
    setContactEmail("");
    setContactPhone("");
    setAddress("");
    setNotes("");
    setError(null);
    setIsModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEditModal = (comp: any) => {
    setEditingCompany(comp);
    setName(comp.name);
    setCode(comp.code);
    setContactEmail(comp.contactEmail || "");
    setContactPhone(comp.contactPhone || "");
    setAddress(comp.address || "");
    setNotes(comp.notes || "");
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Firma adı zorunludur.");
      return;
    }

    setSaving(true);
    try {
      const url = editingCompany ? `/api/companies/${editingCompany.id}` : "/api/companies";
      const method = editingCompany ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          address: address.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "İşlem başarısız.");
      }

      setIsModalOpen(false);
      fetchCompanies();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.contactEmail && c.contactEmail.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="text-blue-600" />
            <span>Müşteri Kurumlar & Firmalar</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Destek hizmeti sunduğunuz şirketleri, sözleşme notlarını ve personel sayılarını yönetin.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
        >
          <PlusCircle size={16} />
          <span>Yeni Kurum Ekle</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Firma adı, kodu veya e-posta ile ara..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
        />
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500">Firmalar yükleniyor...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Kayıtlı Kurum Bulunamadı</h3>
          <p className="text-xs text-slate-500">İlk müşteri firmanızı ekleyerek başlayabilirsiniz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((comp) => (
            <div
              key={comp.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {comp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {comp.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {comp.code}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openEditModal(comp)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Edit2 size={15} />
                  </button>
                </div>

                {/* Company Details */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  {comp.contactEmail && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{comp.contactEmail}</span>
                    </div>
                  )}

                  {comp.contactPhone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <span>{comp.contactPhone}</span>
                    </div>
                  )}

                  {comp.address && (
                    <div className="flex items-start gap-2 text-slate-500">
                      <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 text-[11px]">{comp.address}</span>
                    </div>
                  )}

                  {comp.notes && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-100">
                      <p className="font-semibold text-slate-700 mb-0.5">Destek Notları:</p>
                      <p className="line-clamp-2">{comp.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Users size={13} className="text-blue-600" />
                  {comp._count?.users || 0} Personel
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Ticket size={13} className="text-indigo-600" />
                  {comp._count?.tickets || 0} Toplam Talep
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="relative max-w-lg w-full bg-white rounded-3xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCompany ? "Kurum Bilgilerini Düzenle" : "Yeni Müşteri Kurum Ekle"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <p className="mt-3 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {error}
              </p>
            )}

            <form onSubmit={handleSaveCompany} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kurum / Firma Adı *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: ABC Lojistik A.Ş."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Firma Kısa Kodu (Örn: ABC-01)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Boş bırakılırsa otomatik üretilir"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-Posta
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="info@firma.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="0212 000 00 00"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adres / Lokasyon
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="İlçe / İl veya açık adres"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destek Sözleşmesi & Özel Notlar
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Aylık bakım anlaşması, sunucu erişim saatleri vb."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  <span>{editingCompany ? "Kaydet" : "Kurumu Oluştur"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
