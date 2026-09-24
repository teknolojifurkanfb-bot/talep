"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Headphones,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  User,
  Monitor,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const targetEmail = customEmail || email;
    const targetPass = customPass || password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPass }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Giriş başarısız.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Giriş sırasında hata oluştu.");
      setLoading(false);
    }
  };

  const fillAndLogin = (eMail: string, pWord: string) => {
    setEmail(eMail);
    setPassword(pWord);
    handleLogin(undefined, eMail, pWord);
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
              Home-Office IT Desk
            </span>
            <h2 className="text-2xl font-bold mt-4 leading-tight">
              Bilgi İşlem & Destek Talep Portalı
            </h2>
            <p className="text-sm text-blue-100 mt-2 leading-relaxed">
              Müşteri firmalarınız için çoklu kurum destek yönetimi, uzaktan bağlantı, medya yükleme ve anlık bildirimler.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-blue-100">
                <CheckCircle size={15} className="text-emerald-300 shrink-0 mt-0.5" />
                <span><strong>Multi-Tenant:</strong> Her kurum kendi personelini yönetir.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-blue-100">
                <CheckCircle size={15} className="text-emerald-300 shrink-0 mt-0.5" />
                <span><strong>AnyDesk / RustDesk:</strong> Tek tıkla hızlı bağlantı.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-blue-100">
                <CheckCircle size={15} className="text-emerald-300 shrink-0 mt-0.5" />
                <span><strong>Görsel & Video:</strong> Ekran kayıtları ve fotoğraf yükleme.</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 text-[11px] text-blue-200 flex items-center justify-between">
            <span>Home-Office IT Specialist</span>
            <span>v1.0 Ready</span>
          </div>
        </div>

        {/* Right Side: Login Form & Quick Test Switcher */}
        <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Giriş Yap</h3>
            <p className="text-sm text-slate-500 mt-1">
              Hesabınıza erişmek için bilgilerinizi girin.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Giriş Yapılıyor...</span>
                </>
              ) : (
                <>
                  <span>Panele Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts for Testing */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Hızlı Test İçin Tek Tıkla Giriş Yap:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillAndLogin("admin@bilgiislem.com", "admin123")}
                className="flex items-center gap-2.5 p-2.5 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                    Bilgi İşlem (Siz)
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">Süper Admin</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillAndLogin("ahmet@atlaslojistik.com", "yonetici123")}
                className="flex items-center gap-2.5 p-2.5 text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Building2 size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700 truncate">
                    Atlas Lojistik Admin
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">Kurum Yöneticisi</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillAndLogin("mehmet@atlaslojistik.com", "user123")}
                className="flex items-center gap-2.5 p-2.5 text-left bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <User size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 truncate">
                    Mehmet (Muhasebe)
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">Son Kullanıcı</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillAndLogin("can@novamimarlik.com", "user123")}
                className="flex items-center gap-2.5 p-2.5 text-left bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Monitor size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-purple-700 truncate">
                    Can (Nova Mimarlık)
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">Son Kullanıcı</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
