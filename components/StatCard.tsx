import type { LucideIcon } from "lucide-react";

export default function StatCard({label,value,icon:Icon,tone="red",meta}:{label:string;value:string;icon?:LucideIcon;tone?:"red"|"green"|"blue"|"yellow";meta?:string}){
  const toneClass = tone === "green" ? "bg-green-50 text-green-700" : tone === "blue" ? "bg-blue-50 text-blue-700" : tone === "yellow" ? "bg-yellow-50 text-yellow-800" : "bg-red-50 text-echo-red";
  return <div className="echo-card-soft p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-xs font-semibold text-echo-muted">{label}</div>
        <div className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">{value}</div>
      </div>
      {Icon && <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneClass}`}><Icon size={18}/></span>}
    </div>
    {meta && <div className="mt-3 text-[10px] font-semibold text-echo-muted">{meta}</div>}
  </div>
}
