 "use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mic, Siren, History, UserRound, Video, Stethoscope, Pill, Hospital, HeartPulse, MessageCircle } from "lucide-react";
import Logo from "./Logo";

const items = [
  {href:"/dashboard", label:"Home", icon:Home},
  {href:"/ai", label:"AI", icon:Mic},
  {href:"/emergency", label:"SOS", icon:Siren, danger:true},
  {href:"/doctor", label:"Doctors", icon:Stethoscope},
  {href:"/video-call", label:"Video", icon:Video},
  {href:"/voice-call", label:"Voice", icon:Mic},
  {href:"/ai-conversation", label:"Messages", icon:MessageCircle},
  {href:"/timeline", label:"History", icon:History},
  {href:"/summary", label:"Profile", icon:UserRound},
];

export default function Sidebar(){
  const path=usePathname();
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] border-r border-echo-border bg-white px-5 py-6 lg:block">
        <Logo />
        <div className="mt-9 space-y-1">
          {items.map(({href,label,icon:Icon,danger})=>{
            const active=path===href;
            return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? (danger?"bg-red-50 text-echo-red":"bg-gray-100 text-echo-ink") : "text-echo-muted hover:bg-gray-50 hover:text-echo-ink"}`}>
              <Icon size={19} strokeWidth={active?2.5:2}/><span>{label}</span>
            </Link>
          })}
        </div>
        <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-red-100 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-echo-red"><HeartPulse size={15}/> Emergency ready</div>
          <p className="mt-2 text-[11px] leading-4 text-echo-muted">Fast access to AI guidance, doctors and emergency services.</p>
        </div>
      </aside>
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-echo-border bg-white lg:hidden">
        {[
          {href:"/dashboard",label:"Home",icon:Home},
          {href:"/ai",label:"AI",icon:Mic},
          {href:"/emergency",label:"SOS",icon:Siren},
          {href:"/video-call",label:"Video",icon:Video},
          {href:"/summary",label:"Profile",icon:UserRound},
        ].map(({href,label,icon:Icon})=>{
          const active=path===href;
          return <Link key={href} href={href} className={`flex flex-col items-center gap-1 py-3 text-[10px] font-semibold ${active?"text-echo-red":"text-echo-muted"}`}><Icon size={20}/>{label}</Link>
        })}
      </nav>
    </>
  );
}
