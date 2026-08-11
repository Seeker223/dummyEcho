 "use client";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import { Bot, Mic, MicOff, PhoneOff, Volume2, Bluetooth, Grid2X2, UserPlus, CircleDot, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function VoiceCall(){
 const [muted,setMuted]=useState(false);
 return <AppShell title="Voice Call" subtitle="Live emergency voice consultation">
  <div className="grid min-h-[calc(100vh-170px)] gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
   <section className="overflow-hidden rounded-2xl bg-[#101010] text-white shadow-lift">
    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
      <div><div className="text-sm font-bold">Dr. Musa Ahmed</div><div className="text-[10px] text-gray-400">Cardiologist • Voice consultation</div></div>
      <span className="flex items-center gap-2 rounded-full bg-green-500/15 px-3 py-1.5 text-xs font-bold text-green-300"><span className="h-2 w-2 rounded-full bg-green-400"/> 00:08:32</span>
    </div>
    <div className="flex min-h-[560px] flex-col items-center justify-center p-8 text-center">
      <div className="relative"><div className="absolute inset-[-24px] rounded-full border border-echo-red/30 animate-ping"/><Avatar name="Dr. Musa Ahmed" className="relative h-36 w-36"/></div>
      <h2 className="mt-8 text-2xl font-extrabold">Dr. Musa Ahmed</h2><p className="mt-1 text-sm text-gray-400">Cardiologist • Speaking with you</p>
      <div className="mt-7 flex items-end gap-1">{Array.from({length:34}).map((_,i)=><span key={i} className="w-1 rounded-full bg-echo-red" style={{height:`${12+(i%8)*5}px`}}/>)}</div>
      <div className="mt-10 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
        <button onClick={()=>setMuted(!muted)} className={`grid h-12 w-12 place-items-center rounded-xl ${muted?"bg-white text-black":"bg-white/10 text-white"}`}>{muted?<MicOff size={19}/>:<Mic size={19}/>}</button>
        <button className="grid h-12 w-12 place-items-center rounded-xl bg-white/10"><Volume2 size={19}/></button>
        <button className="grid h-12 w-12 place-items-center rounded-xl bg-white/10"><Bluetooth size={19}/></button>
        <button className="grid h-12 w-12 place-items-center rounded-xl bg-white/10"><Grid2X2 size={19}/></button>
        <button className="grid h-12 w-12 place-items-center rounded-xl bg-echo-emergency"><PhoneOff size={19}/></button>
      </div>
    </div>
   </section>
   <aside className="space-y-4">
    <div className="echo-card p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-purple-50 text-purple-700"><Bot size={19}/></span><div><div className="font-extrabold">AI Assistant</div><div className="text-[10px] text-green-600">● Listening</div></div></div><div className="mt-4 rounded-xl bg-gray-50 p-4 text-xs leading-5 text-echo-muted">Live transcription and emergency guidance can appear here during the voice call.</div></div>
    <div className="echo-card p-5"><div className="flex items-center justify-between"><h2 className="font-extrabold">Call controls</h2><span className="text-xs text-echo-muted">More</span></div><div className="mt-4 grid grid-cols-2 gap-2">{[["Add participant",UserPlus],["Record call",CircleDot],["Keypad",Grid2X2],["Device",Bluetooth]].map(([label,I])=><button key={label as string} className="flex items-center gap-2 rounded-xl border border-echo-border p-3 text-xs font-semibold hover:bg-gray-50"><I size={16}/>{label as string}</button>)}</div></div>
    <Link href="/timeline" className="echo-card flex items-center gap-3 p-5"><span className="flex-1"><div className="font-extrabold">Emergency timeline</div><div className="mt-1 text-xs text-echo-muted">See live response progress</div></span><ChevronRight size={17}/></Link>
   </aside>
  </div>
 </AppShell>
}

