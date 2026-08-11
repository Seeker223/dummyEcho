import type { ReactNode } from "react";
import { PhoneOff } from "lucide-react";

export default function CallControlBar({children,dangerLabel="End call",onEnd}:{children:ReactNode;dangerLabel?:string;onEnd?:()=>void}){
  return <div className="absolute inset-x-3 bottom-3 z-20 flex justify-center sm:inset-x-4 sm:bottom-4"><div className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-2xl border border-white/10 bg-[#080b10]/95 p-1.5 shadow-2xl sm:gap-2 sm:p-2">{children}<span className="mx-0.5 h-7 w-px shrink-0 bg-white/10"/><button onClick={onEnd} className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-echo-emergency px-3 text-white transition hover:bg-red-700 active:scale-[0.98]" aria-label={dangerLabel} title={dangerLabel}><span className="hidden text-xs font-bold sm:inline">{dangerLabel}</span><PhoneOff size={18}/></button></div></div>
}
export function CallControl({active=true,onClick,children,label}:{active?:boolean;onClick?:()=>void;children:ReactNode;label:string}){return <button onClick={onClick} title={label} aria-label={label} className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition active:scale-[0.97] ${active ? "bg-white/10 text-white hover:bg-white/15" : "bg-white text-echo-ink hover:bg-gray-100"}`}>{children}</button>}
