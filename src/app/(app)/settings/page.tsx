"use client";

import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Mail,
  Server,
  KeyRound,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  Building,
} from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testEmail, setTestEmail] = useState("");

  const [form, setForm] = useState({
    systemName: "Novatra Destek Portalı",
    supportPhone: "+90 555 123 45 67",
    notificationEmail: "destek@novatra.com",
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    smtpFrom: '"Novatra Destek" <destek@novatra.com>',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setForm({
            systemName: data.settings.systemName || "Novatra Destek Portalı",
            supportPhone: data.settings.supportPhone || "",
            notificationEmail: data.settings.notificationEmail || "",
            smtpHost: data.settings.smtpHost || "",
            smtpPort: data.settings.smtpPort || 587,
            smtpUser: data.settings.smtpUser || "",
            smtpPassword: data.settings.smtpPassword || "",
            smtpFrom: data.settings.smtpFrom || '"Novatra Destek" <destek@novatra.com>',
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Ayarlar başarıyla kaydedildi!" });
      } else {
        setMessage({ type: "error", text: data.error || "Kaydedilemedi." });
      }
    } catch {
      setMessage({ type: "error", text: "Bağlantı hatası oluştu." });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestMail = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      setMessage({ type: "error", text: "Lütfen geçerli bir test e-posta adresi yazın." });
      return;
    }

    setTesting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, testEmailTarget: testEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `Test e-postası başarıyla gönderildi (${testEmail})!`,
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Test e-postası gönderilemedi. Lütfen SMTP bilgilerinizi kontrol edin.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Test e-postası gönderilirken sunucu hatası oluştu." });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <SettingsIcon className="text-blue-600" />
          Sistem & E-Posta (SMTP) Ayarları
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Talepler açıldığında, güncellendiğinde ve yeni yanıtlar geldiğinde kullanıcılara ve teknik ekibe gidecek e-posta bildirim ayarlarını buradan yönetebilirsiniz.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* System Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-blue-600" />
            Genel Portal Bilgileri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Portal / Şirket Adı
              </label>
              <input
                type="text"
                value={form.systemName}
                onChange={(e) => setForm({ ...form, systemName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Destek & Acil Telefon No
              </label>
              <input
                type="text"
                value={form.supportPhone}
                onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* SMTP Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              SMTP E-Posta Bildirim Sunucusu
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
              Canlı Bildirimler
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  SMTP Sunucu Adresi (Host)
                </label>
                <div className="relative">
                  <Server className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="mail.sirketiniz.com veya smtp.gmail.com"
                    value={form.smtpHost}
                    onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Port
                </label>
                <input
                  type="number"
                  placeholder="587 veya 465"
                  value={form.smtpPort}
                  onChange={(e) => setForm({ ...form, smtpPort: parseInt(e.target.value) || 587 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  SMTP Kullanıcı Adı / E-Posta
                </label>
                <input
                  type="text"
                  placeholder="destek@sirketiniz.com"
                  value={form.smtpUser}
                  onChange={(e) => setForm({ ...form, smtpUser: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  SMTP Şifresi (veya Uygulama Şifresi)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={form.smtpPassword}
                    onChange={(e) => setForm({ ...form, smtpPassword: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Gönderen Başlığı ve Adresi (From)
              </label>
              <input
                type="text"
                placeholder='"Novatra Destek" <destek@sirketiniz.com>'
                value={form.smtpFrom}
                onChange={(e) => setForm({ ...form, smtpFrom: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Guide tip */}
          <div className="mt-5 p-4 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <strong>E-posta Gönderim Mantığı:</strong> SMTP bilgisi girildiğinde, sistemdeki tüm talep açma, durum değiştirme ve mesaj yazma eylemleri gerçek zamanlı olarak hem talep sahibine hem teknik ekibe e-posta ile ulaştırılır. Eğer SMTP boş bırakılırsa, sistem simülasyon modunda çalışır ve hata vermeden süreci tamamlar.
            </div>
          </div>
        </div>

        {/* Test Email Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-2">E-Posta Bağlantısını Test Et</h3>
          <p className="text-xs text-slate-500 mb-4">
            Girdiğiniz SMTP ayarlarının çalıştığından emin olmak için kendi e-posta adresinize bir deneme iletisi gönderin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="ornek@gmail.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
            <button
              type="button"
              onClick={handleSendTestMail}
              disabled={testing}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Test E-postası Gönder</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Ayarları Kaydet</span>
          </button>
        </div>
      </form>
    </div>
  );
}
