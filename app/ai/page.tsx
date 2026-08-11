import AppShell from "@/components/AppShell";
import Link from "next/link";
import { Mic, Phone, Ambulance, Bell, MapPin, MessageCircle, Activity, HeartPulse, Thermometer, ShieldAlert } from "lucide-react";
export default function AI(){return <AppShell title="AI Assistant" subtitle="Voice-first emergency guidance">
 <div className="grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
  <div className="echo-card bg-[#0b1830] p-6 text-white sm:p-8">
   <div className="flex items-center justify-between"><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">AI Assistant</span><span className="flex items-center gap-2 text-xs text-green-300"><span className="h-2 w-2 rounded-full bg-green-400"/> Listening</span></div>
   <div className="flex min-h-[480px] flex-col items-center justify-center text-center"><div className="relative grid h-44 w-44 place-items-center rounded-full border-8 border-blue-400/20"><div className="grid h-32 w-32 place-items-center rounded-full bg-echo-blue shadow-[0_0_60px_rgba(0,122,255,.45)]"><Mic size={48}/></div></div><h2 className="mt-8 text-2xl font-extrabold">I&apos;m listening...</h2><div className="mt-6 flex items-end gap-1">{Array.from({length:30}).map((_,i)=><span key={i} className="w-1 rounded-full bg-blue-300" style={{height:`${10+(i%7)*6}px`}}/>)}</div><div className="mt-8 grid w-full max-w-md grid-cols-3 gap-3">{[["72","BPM",HeartPulse],["97%","SpO₂",Activity],["36.5°","Temp",Thermometer]].map(([v,l,I])=><div key={l as string} className="rounded-xl bg-white/10 p-3"><I size={16} className="mx-auto text-blue-300"/><div className="mt-2 text-lg font-bold">{v as string}</div><div className="text-[10px] text-gray-300">{l as string}</div></div>)}</div></div>
  </div>
  <div className="space-y-4">
   <div className="echo-card p-6"><div className="eyebrow">AI triage</div><h2 className="mt-2 text-2xl font-extrabold">Possible emergency detected</h2><p className="mt-2 text-sm text-echo-muted">Demo state based on the UI spreadsheet. Confidence and diagnosis should be supplied by the real triage service.</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full w-[93%] rounded-full bg-echo-red"/></div><div className="mt-2 flex justify-between text-xs font-bold"><span>AI confidence</span><span>93%</span></div></div>
   {[["Call doctor",Phone,"/doctor"],["Call ambulance",Ambulance,"/emergency"],["Notify family",Bell,"/timeline"],["Open video call",MessageCircle,"/video-call"]].map(([label,I,href])=><Link href={href as string} key={label as string} className="echo-card flex items-center gap-4 p-4 transition hover:border-red-200 hover:shadow-card"><span className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-echo-red"><I size={20}/></span><span className="flex-1 text-sm font-bold">{label as string}</span><span className="text-echo-muted">→</span></Link>)}
   <div className="echo-card p-5"><div className="flex items-center gap-2 font-bold"><MapPin size={18} className="text-echo-red"/> Location ready</div><p className="mt-2 text-xs text-echo-muted">Your emergency location can be shared with responders when you approve it.</p></div>
  </div>
 </div>
 </AppShell>}
