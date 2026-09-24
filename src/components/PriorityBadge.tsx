import React from "react";
import { Flame, ArrowUp, ArrowRight, ArrowDown } from "lucide-react";

interface Props {
  priority: string;
  size?: "sm" | "md";
}

export function getPriorityConfig(priority: string) {
  switch (priority) {
    case "ACIL":
      return {
        label: "Acil",
        bg: "bg-rose-50 text-rose-700 border-rose-300 ring-rose-500/20 font-bold",
        icon: Flame,
        iconColor: "text-rose-600",
      };
    case "YUKSEK":
      return {
        label: "Yüksek",
        bg: "bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/10 font-semibold",
        icon: ArrowUp,
        iconColor: "text-orange-600",
      };
    case "NORMAL":
      return {
        label: "Normal",
        bg: "bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10 font-medium",
        icon: ArrowRight,
        iconColor: "text-sky-600",
      };
    case "DUSUK":
      return {
        label: "Düşük",
        bg: "bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/10 font-medium",
        icon: ArrowDown,
        iconColor: "text-slate-500",
      };
    default:
      return {
        label: priority,
        bg: "bg-gray-50 text-gray-700 border-gray-200",
        icon: ArrowRight,
        iconColor: "text-gray-500",
      };
  }
}

export default function PriorityBadge({ priority, size = "md" }: Props) {
  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5 gap-1" : "text-xs px-2.5 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-md border shadow-2xs ${config.bg} ${sizeClasses}`}
    >
      <Icon size={13} className={config.iconColor} />
      <span>{config.label}</span>
    </span>
  );
}
