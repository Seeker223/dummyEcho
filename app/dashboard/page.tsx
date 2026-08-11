import AppShell from "@/components/AppShell";
import SectionTitle from "@/components/SectionTitle";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import { Activity, Ambulance, HeartPulse, Siren, MapPin, MessageCircle, Mic, Pill, ShieldCheck, Stethoscope, Video, Hospital, ChevronRight } from "lucide-react";

export default function Dashboard(){
 return <AppShell title="Good Evening, Tobi 👋" subtitle="How can we help you today?">
  <div className="grid gap-6 xl:grid-cols-[1.35fr_.85fr]">
   <section className="space-y-6">
    <div className="echo-card overflow-hidden">
      <div className="grid gap-8 bg-gradient-to-br from-red-50 via-white to-white p-6 sm:p-8 md:grid-cols-[1fr_260px]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-echo-red shadow-card"><ShieldCheck size={14}/> AI ready • Location active</span>
          <h2 className="mt-5 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">Help, instantly.<br/><span className="text-echo-red">When it matters most.</span></h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-echo-muted">Real-time guidance, immediate support, and faster access to healthcare in critical moments.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/ai" className="echo-btn-primary"><Mic size={17}/> Talk to AI</Link><Link href="/emergency" className="echo-btn-secondary"><SirenIcon/> Emergency</Link></div>
        </div>
        <div className="flex items-center justify-center"><div className="relative grid h-48 w-48 place-items-center rounded-full border-8 border-red-100 bg-white shadow-lift"><div className="grid h-28 w-28 place-items-center rounded-full bg-echo-red text-white shadow-lg"><Mic size={42}/></div><span className="absolute -bottom-2 rounded-full bg-white px-3 py-1 text-[10px] font-bold shadow-card">Tap to speak</span></div></div>
      </div>
    </div>
    <div>
      <SectionTitle title="Quick access"/>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
       {[["Doctors",Stethoscope,"/doctor"],["Hospitals",Hospital,"/timeline"],["Pharmacy",Pill,"/summary"],["Emergency",Siren,"/emergency"]].map(([label,Icon,href])=><Link key={label as string} href={href as string} className="echo-card-soft flex min-h-[112px] flex-col items-center justify-center gap-3 text-center transition hover:-translate-y-0.5 hover:shadow-card"><span className="grid h-11 w-11 place-items-center rounded-xl bg-gray-50 text-echo-red"><Icon size={21}/></span><span className="text-sm font-bold">{label as string}</span></Link>)}
      </div>
    </div>
   </section>
   <aside className="space-y-6">
     <div className="echo-card p-5"><SectionTitle title="Nearby doctors" action="View all"/><DoctorMini name="Dr. Musa Ahmed" specialty="Cardiologist" rating="4.9" available/><DoctorMini name="Nurse Grace" specialty="Registered Nurse" rating="4.8" available/></div>
     <div className="echo-card p-5"><SectionTitle title="Your health"/><div className="grid grid-cols-3 gap-2">{[["72","BPM",HeartPulse],["97%","SpO₂",Activity],["36.5°","Temp",Activity]].map(([v,l,I])=><div key={l as string} className="rounded-xl bg-gray-50 p-3 text-center"><I size={16} className="mx-auto text-echo-red"/><div className="mt-2 text-lg font-extrabold">{v as string}</div><div className="text-[10px] text-echo-muted">{l as string}</div></div>)}</div></div>
     <div className="rounded-2xl bg-echo-ink p-5 text-white"><div className="flex items-center gap-2 text-sm font-bold"><ShieldCheck size={18} className="text-green-400"/> Private & secure</div><p className="mt-2 text-xs leading-5 text-gray-300">Emergency sessions are designed for fast, secure access to support.</p></div>
   </aside>
  </div>
 </AppShell>
}
function DoctorMini({name,specialty,rating,available}:{name:string;specialty:string;rating:string;available?:boolean}){return <div className="mb-3 flex items-center gap-3 rounded-xl border border-echo-border p-3"><Avatar name={name} className="h-12 w-12 shrink-0"/><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{name}</div><div className="text-xs text-echo-muted">{specialty}</div><div className="mt-1 flex items-center gap-2 text-[10px]"><span className="text-yellow-600">★ {rating}</span>{available&&<span className="flex items-center gap-1 text-green-600"><span className="h-1.5 w-1.5 rounded-full bg-echo-green"/>Available</span>}</div></div><ChevronRight size={16} className="text-echo-muted"/></div>}
