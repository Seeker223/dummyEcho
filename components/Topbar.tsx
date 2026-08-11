import { Bell, ChevronDown } from "lucide-react";
export default function Topbar({title, subtitle}:{title:string;subtitle?:string}){
 return <header className="flex items-center justify-between gap-4 border-b border-echo-border bg-white px-5 py-4 lg:px-8">
   <div><h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>{subtitle&&<p className="mt-1 text-sm text-echo-muted">{subtitle}</p>}</div>
   <div className="flex items-center gap-3">
     <button className="echo-icon-btn relative" aria-label="Notifications"><Bell size={18}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-echo-red"/></button>
     <button className="hidden items-center gap-2 rounded-xl border border-echo-border px-3 py-2 sm:flex"><span className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-xs font-bold text-echo-red">OB</span><span className="text-sm font-semibold">Oluwatobi</span><ChevronDown size={15}/></button>
   </div>
 </header>
}
