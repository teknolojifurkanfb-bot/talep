import React from "react";
import { AlertCircle, Clock, PauseCircle, CheckCircle2, XCircle } from "lucide-react";

export type TicketStatusType = "ACIK" | "ISLEMDE" | "BEKLEMEDE" | "COZULDU" | "KAPATILDI";

interface Props {
  status: string;
  size?: "sm" | "md" | "lg";
}

export function getStatusConfig(status: string) {
  switch (status) {
    case "ACIK":
      return {
        label: "Yeni Açıldı",
        bg: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10",
        dot: "bg-blue-500",
        icon: AlertCircle,
      };
    case "ISLEMDE":
      return {
        label: "İnceleniyor / İşlemde",
        bg: "bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/10",
        dot: "bg-amber-500 animate-pulse",
        icon: Clock,
      };
    case "BEKLEMEDE":
      return {
        label: "Bilgi Bekleniyor",
        bg: "bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10",
        dot: "bg-purple-500",
        icon: PauseCircle,
      };
    case "COZULDU":
      return {
        label: "Çözüldü",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10",
        dot: "bg-emerald-500",
        icon: CheckCircle2,
      };
    case "KAPATILDI":
      return {
        label: "Kapatıldı",
        bg: "bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10",
        dot: "bg-slate-400",
        icon: XCircle,
      };
    default:
      return {
        label: status,
        bg: "bg-gray-100 text-gray-700 border-gray-200 ring-gray-500/10",
        dot: "bg-gray-400",
        icon: AlertCircle,
      };
  }
}

export default function TicketStatusBadge({ status, size = "md" }: Props) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5 font-medium",
    lg: "text-sm px-3.5 py-1.5 gap-2 font-medium",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs ${config.bg} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon size={iconSizes[size]} />
      <span>{config.label}</span>
    </span>
  );
}
