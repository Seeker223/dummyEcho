import Link from "next/link";
import { BarChart3, FileText, Handshake, LayoutDashboard, MessageSquare, Settings, UsersRound, BriefcaseBusiness } from "lucide-react";
import type { ReactNode } from "react";

const items = [
  ["/partnership","Overview",LayoutDashboard],
  ["/partnership/programs","Programs",BriefcaseBusiness],
  ["/partnership/proposal","Proposals",FileText],
  ["/partnership/directory","Partners",UsersRound],
  ["/partnership/analytics","Analytics",BarChart3],
  ["/partnership/agreement","Agreements",Handshake],
] as const;

export default function PartnershipShell({children,title,subtitle}:{children:ReactNode;title:string;subtitle?:string}){
 return <div className="min-h-screen bg-[#FAFAFA] text-echo-ink">
   <div className="mx-auto max-w-[1680px] p-3 sm:p-5 lg:p-7">
     <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-echo-border bg-white px-4 py-3 shadow-card">
       <Link href="/dashboard" className="flex items-center gap-2 text-sm font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-echo-red">EE</span><span>Emergency <span className="text-echo-red">Echo</span></span></Link>
       <div className="text-center"><div className="text-xs font-bold uppercase tracking-[.18em] text-echo-red">Partnership Portal</div><div className="hidden text-xs text-echo-muted sm:block">Connecting partners. Expanding impact. Saving lives together.</div></div>
       <Link href="/dashboard" className="text-xs font-bold text-echo-muted hover:text-echo-red">Back to platform</Link>
     </div>
     <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
       <aside className="rounded-2xl bg-echo-ink p-3 text-white shadow-card">
         <div className="mb-5 px-2 pt-2 text-[10px] font-bold uppercase tracking-[.16em] text-gray-400">Partner Portal</div>
         <nav className="space-y-1">
           {items.map(([href,label,Icon])=><Link key={href} href={href} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white"><Icon size={16}/>{label}</Link>)}
         </nav>
         <div className="mt-8 border-t border-white/10 pt-4"><Link href="/partnership/agreement" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-300 hover:bg-white/10"><Settings size={15}/> Settings</Link></div>
         <div className="mt-8 rounded-xl bg-white/5 p-3"><div className="text-[10px] font-bold text-white">James Okafor</div><div className="mt-1 text-[9px] text-gray-400">Partner admin</div></div>
       </aside>
       <main className="min-w-0">
         <div className="mb-4 rounded-2xl border border-echo-border bg-white px-4 py-4 shadow-card sm:px-6">
           <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="eyebrow">Partnership</div><h1 className="mt-1 text-2xl font-extrabold tracking-tight">{title}</h1>{subtitle&&<p className="mt-1 text-sm text-echo-muted">{subtitle}</p>}</div><div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-[11px] font-bold text-green-700"><span className="h-2 w-2 rounded-full bg-echo-green"/> Verified Partner</div></div>
         </div>
         {children}
       </main>
     </div>
   </div>
 </div>
}
