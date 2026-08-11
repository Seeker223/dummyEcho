"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mic, Siren, History, UserRound, Video, Stethoscope, MessageCircle, HeartPulse, Phone, Handshake } from "lucide-react";
import Logo from "./Logo";

const items = [
  {href:"/dashboard", label:"Home", icon:Home},
  {href:"/ai", label:"AI assistant", icon:Mic},
  {href:"/emergency", label:"Emergency", icon:Siren, danger:true},
  {href:"/doctor", label:"Doctors", icon:Stethoscope},
];
const communication = [
  {href:"/video-call", label:"Video call", icon:Video},
  {href:"/voice-call", label:"Voice call", icon:Phone},
  {href:"/ai-conversation", label:"AI conversation", icon:MessageCircle},
];
const platform = [
  {href:"/partnership", label:"Partnerships", icon:Handshake},
];
const records = [
  {href:"/timeline", label:"Timeline", icon:History},
  {href:"/summary", label:"Summary", icon:UserRound},
];

function NavLink({item,path}:{item:any;path:string}){
 const Icon=item.icon; const active=path===item.href;
 return <Link href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? (item.danger?"bg-red-50 text-echo-red":"bg-gray-100 text-echo-ink") : item.danger?"text-echo-red hover:bg-red-50":"text-echo-muted hover:bg-gray-50 hover:text-echo-ink"}`}><Icon size={18} strokeWidth={active?2.5:2}/><span>{item.label}</span>{item.danger&&<span className="ml-auto h-2 w-2 rounded-full bg-echo-red"/>}</Link>
}

export default function Sidebar(){
 const path=usePathname();
 return <>
  <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-echo-border bg-white px-4 py-5 lg:flex lg:flex-col">
   <Logo/>
   <div className="mt-7 text-[10px] font-bold uppercase tracking-[.16em] text-echo-muted">Main</div>
   <nav className="mt-2 space-y-1">{items.map(item=><NavLink key={item.href} item={item} path={path}/>)}</nav>
   <div className="mt-6 text-[10px] font-bold uppercase tracking-[.16em] text-echo-muted">Communication</div>
   <nav className="mt-2 space-y-1">{communication.map(item=><NavLink key={item.href} item={item} path={path}/>)}</nav>
   <div className="mt-6 text-[10px] font-bold uppercase tracking-[.16em] text-echo-muted">Platform</div>
   <nav className="mt-2 space-y-1">{platform.map(item=><NavLink key={item.href} item={item} path={path}/>)}</nav>
   <div className="mt-6 text-[10px] font-bold uppercase tracking-[.16em] text-echo-muted">Records</div>
   <nav className="mt-2 space-y-1">{records.map(item=><NavLink key={item.href} item={item} path={path}/>)}</nav>
   <div className="mt-auto rounded-2xl border border-red-100 bg-red-50 p-4"><div className="flex items-center gap-2 text-xs font-bold text-echo-red"><HeartPulse size={15}/> Emergency ready</div><p className="mt-2 text-[11px] leading-4 text-echo-muted">Fast access to AI guidance, doctors and emergency services.</p></div>
  </aside>
  <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-echo-border bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,.05)] lg:hidden">
   <div className="grid grid-cols-5">{[
    {href:"/dashboard",label:"Home",icon:Home},{href:"/ai",label:"AI",icon:Mic},{href:"/emergency",label:"SOS",icon:Siren},{href:"/video-call",label:"Video",icon:Video},{href:"/summary",label:"Profile",icon:UserRound}
   ].map(({href,label,icon:Icon})=>{const active=path===href;return <Link key={href} href={href} className={`relative flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${active?"text-echo-red":"text-echo-muted"}`}><Icon size={20} strokeWidth={active?2.5:2}/>{label}{active&&<span className="absolute top-0 h-0.5 w-8 rounded-full bg-echo-red"/>}</Link>})}</div>
  </nav>
 </>;
}
