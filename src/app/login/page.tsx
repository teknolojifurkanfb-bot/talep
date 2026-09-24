"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Headphones,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Giriş sırasında hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100/10">
        {/* Left Side: Brand & Benefits */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-6 shadow-inner">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase px-3 py-1 bg-white/10 rounded-full border border-white/15">
              Novatra Destek Portalı
            </span>
            <h2 className="text-2xl font-bold mt-4 leading-tight">
              Bilgi İşlem & Talep Yönetim Sistemi
            </h2>
            <p className="text-sm text-blue-100 mt-2 leading-relaxed">
              Müşteri kurumlar ve şirket personelleri için merkezi teknik destek masası ve uzaktan müdahale platformu.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-blue-100">
                <CheckCircle size={15} className="text-emerald-300 shrink-0 mt-0.5" />
                <span><strong>Multi-Tenant:</strong> Kurum yöneticileri personellerini yönetebilir.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-blue-100">
                <CheckCircle size={15} className="text-emerald-300 shrink-0 mt-0.5" />
                <span><strong>Uzaktan Bağlantı:</strong> AnyDesk / RustDesk ile anında müdahale.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-blue-100">
                <CheckCircle size={15} className="text-emerald-300 shrink-0 mt-0.5" />
                <span><strong>Medya Yükleme:</strong> Fotoğraf, video kaydı ve hata logları.</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 text-[11px] text-blue-200 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} /> Güvenli SSL Bağlantısı
            </span>
            <span>v1.0 Canlı Sistem</span>
          </div>
        </div>

        {/* Right Side: Professional Production Login Form */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Kullanıcı Girişi</h3>
            <p className="text-sm text-slate-500 mt-1">
              Sisteme erişmek için e-posta ve şifrenizi girin.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                E-Posta Adresi
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@sirket.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-semibold rounded-2xl text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Giriş Yapılıyor...</span>
                </>
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            Hesabınız yoksa lütfen kurum yöneticinizle veya Bilgi İşlem ile iletişime geçin.
          </div>
        </div>
      </div>
    </div>
  );
}
