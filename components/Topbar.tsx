import { Bell, ChevronDown } from "lucide-react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
export default function Topbar({title,subtitle}:{title:string;subtitle?:string}){
 return <header className="sticky top-0 z-30 border-b border-echo-border bg-white shadow-[0_1px_0_rgba(0,0,0,.02)]">
   <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
    <div className="min-w-0"><div className="flex items-center gap-2"><h1 className="truncate text-lg font-extrabold tracking-tight sm:text-2xl">{title}</h1><StatusBadge tone="success" dot>Secure</StatusBadge></div>{subtitle&&<p className="mt-1 truncate text-xs text-echo-muted sm:text-sm">{subtitle}</p>}</div>
    <div className="flex shrink-0 items-center gap-2 sm:gap-3"><button className="echo-icon-btn relative" aria-label="Notifications"><Bell size={18}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-echo-red"/></button><Link href="/summary" className="hidden items-center gap-2 rounded-xl border border-echo-border px-3 py-2 sm:flex"><span className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-xs font-bold text-echo-red">OB</span><span className="text-sm font-semibold">Oluwatobi</span><ChevronDown size={15}/></Link></div>
   </div>
 </header>
}
