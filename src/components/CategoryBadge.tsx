import React from "react";
import {
  Monitor,
  Code2,
  Wifi,
  Mail,
  Printer,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

interface Props {
  category: string;
}

export const CATEGORIES = [
  { id: "DONANIM", label: "Donanım / PC / Çevre Birimi", icon: Monitor, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "YAZILIM", label: "Yazılım / Program / Hata", icon: Code2, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "AG_INTERNET", label: "Ağ / İnternet / Wi-Fi", icon: Wifi, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: "EPOSTA", label: "E-Posta / Outlook", icon: Mail, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { id: "YAZICI", label: "Yazıcı / Tarayıcı / Barkod", icon: Printer, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { id: "GUVENLIK", label: "Güvenlik / Virüs / Şifre", icon: ShieldAlert, color: "text-rose-600 bg-rose-50 border-rose-200" },
  { id: "DIGER", label: "Diğer Destek Talepleri", icon: HelpCircle, color: "text-slate-600 bg-slate-50 border-slate-200" },
];

export function getCategoryInfo(category: string) {
  const found = CATEGORIES.find((c) => c.id === category);
  if (found) return found;
  return {
    id: category,
    label: category,
    icon: HelpCircle,
    color: "text-slate-600 bg-slate-50 border-slate-200",
  };
}

export default function CategoryBadge({ category }: Props) {
  const info = getCategoryInfo(category);
  const Icon = info.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${info.color}`}
    >
      <Icon size={13} />
      <span>{info.label.split("/")[0].trim()}</span>
    </span>
  );
}
