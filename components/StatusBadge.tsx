import type { ReactNode } from "react";

type Tone = "success" | "info" | "warning" | "danger" | "neutral" | "purple";

const tones: Record<Tone, string> = {
  success: "bg-green-50 text-green-700 border-green-100",
  info: "bg-blue-50 text-blue-700 border-blue-100",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-100",
  danger: "bg-red-50 text-echo-red border-red-100",
  neutral: "bg-gray-50 text-echo-muted border-echo-border",
  purple: "bg-purple-50 text-purple-700 border-purple-100",
};

export default function StatusBadge({children, tone="neutral", dot=false}:{children:ReactNode;tone?:Tone;dot?:boolean}){
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${tones[tone]}`}>
    {dot && <span className={`h-1.5 w-1.5 rounded-full ${tone === "success" ? "bg-echo-green" : tone === "danger" ? "bg-echo-red" : tone === "warning" ? "bg-yellow-500" : tone === "info" ? "bg-echo-blue" : tone === "purple" ? "bg-purple-600" : "bg-gray-400"}`} />}
    {children}
  </span>
}
