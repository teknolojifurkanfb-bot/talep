"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  PlusCircle,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  User as UserIcon,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  X,
  KeyRound,
} from "lucide-react";

export default function UsersManagementPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentUser, setCurrentUser] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingUser, setEditingUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("USER");
  const [companyId, setCompanyId] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersRes, userRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/auth/me"),
      ]);
      const usersData = await usersRes.json();
      const userData = await userRes.json();

      setUsers(usersData.users || []);
      setCurrentUser(userData.user);

      if (userData.user?.role === "SUPER_ADMIN") {
        const compRes = await fetch("/api/companies");
        const compData = await compRes.json();
        setCompanies(compData.companies || []);
        if (compData.companies?.length > 0) {
          setCompanyId(compData.companies[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setDepartment("");
    setRole("USER");
    if (companies.length > 0) setCompanyId(companies[0].id);
    setError(null);
    setIsModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEditModal = (targetUser: any) => {
    setEditingUser(targetUser);
    setName(targetUser.name);
    setEmail(targetUser.email);
    setPassword(""); // Leave blank if no change
    setPhone(targetUser.phone || "");
    setDepartment(targetUser.department || "");
    setRole(targetUser.role);
    setCompanyId(targetUser.companyId || "");
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("İsim ve E-posta alanları zorunludur.");
      return;
    }

    if (!editingUser && !password.trim()) {
      setError("Yeni kullanıcı için bir başlangıç şifresi belirlemelisiniz.");
      return;
    }

    setSaving(true);
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim() || undefined,
          phone: phone.trim(),
          department: department.trim(),
          role: currentUser?.role === "SUPER_ADMIN" ? role : "USER",
          companyId: currentUser?.role === "SUPER_ADMIN" ? companyId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "İşlem başarısız.");
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const toggleUserActive = async (targetUser: any) => {
    try {
      const res = await fetch(`/api/users/${targetUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !targetUser.isActive }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company?.name && u.company.name.toLowerCase().includes(search.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="text-blue-600" />
            <span>
              {isSuperAdmin ? "Kullanıcı & Personel Yönetimi" : "Şirket Personelleri"}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSuperAdmin
              ? "Tüm müşteri firmaların personel hesaplarını, yetkilerini ve şifrelerini yönetin."
              : "Şirketiniz çalışanları için destek hesabı açın ve şifrelerini güncelleyin."}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
        >
          <PlusCircle size={16} />
          <span>Yeni Personel Ekle</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İsim, e-posta, departman veya firma ile ara..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500">Personeller yükleniyor...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Personel Bulunamadı</h3>
          <p className="text-xs text-slate-500">Yeni personel hesabı oluşturabilirsiniz.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Personel / Kullanıcı</th>
                  <th className="py-3.5 px-4">Kurum / Firma</th>
                  <th className="py-3.5 px-4">Departman / İletişim</th>
                  <th className="py-3.5 px-4">Yetki Rolü</th>
                  <th className="py-3.5 px-4">Durum</th>
                  <th className="py-3.5 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isUserSuperAdmin = u.role === "SUPER_ADMIN";
                  const isUserCompanyAdmin = u.role === "COMPANY_ADMIN";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="py-3.5 px-4">
                        {u.company ? (
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Building2 size={13} className="text-blue-600 shrink-0" />
                            <span>{u.company.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Bilgi İşlem Ekibi</span>
                        )}
                      </td>

                      {/* Department & Phone */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <p className="font-medium text-slate-800">
                          {u.department || "Belirtilmedi"}
                        </p>
                        {u.phone && (
                          <p className="text-[11px] text-slate-400 font-mono">{u.phone}</p>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isUserSuperAdmin
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : isUserCompanyAdmin
                              ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          <ShieldCheck size={11} />
                          {isUserSuperAdmin
                            ? "Süper Admin"
                            : isUserCompanyAdmin
                            ? "Firma Yetkilisi"
                            : "Personel"}
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => toggleUserActive(u)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer ${
                            u.isActive
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                          }`}
                        >
                          {u.isActive ? (
                            <>
                              <CheckCircle size={11} /> Aktif
                            </>
                          ) : (
                            <>
                              <XCircle size={11} /> Pasif
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzenle / Şifre Değiştir"
                        >
                          <Edit2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? "Personel Bilgilerini Düzenle" : "Yeni Personel Hesabı Oluştur"}
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

            <form onSubmit={handleSaveUser} className="space-y-3.5 mt-4">
              {/* Company Selector (if Super Admin) */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bağlı Olduğu Kurum / Firma *
                  </label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Ayşe Kaya"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-Posta Adresi (Giriş İçin) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="personel@firma.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{editingUser ? "Yeni Şifre (Değiştirmeyecekseniz Boş Bırakın)" : "Başlangıç Şifresi *"}</span>
                  <KeyRound size={12} className="text-slate-400" />
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? "Değiştirmemek için boş bırakın" : "En az 6 karakter"}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Departman / Bölüm
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Muhasebe, İK, vb."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefon / Dahili
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0532..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Role Selection (Super Admin only) */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kullanıcı Yetkisi
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="USER">Personel (Sadece kendi taleplerini açar ve görür)</option>
                    <option value="COMPANY_ADMIN">Firma Yöneticisi (Şirketinin tüm taleplerini ve personellerini görür)</option>
                    <option value="SUPER_ADMIN">Süper Admin (Bilgi İşlem Yetkilisi)</option>
                  </select>
                </div>
              )}

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
                  <span>{editingUser ? "Kaydet" : "Personeli Kaydet"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
