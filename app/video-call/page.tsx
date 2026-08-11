 "use client";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import type { ReactNode } from "react";
import { Camera, CameraOff, ChevronLeft, Mic, MicOff, MoreHorizontal, MonitorUp, PhoneOff, Radio } from "lucide-react";
import { useState } from "react";

export default function VideoCall(){
 const [mic,setMic]=useState(true), [camera,setCamera]=useState(true), [share,setShare]=useState(false);
 return <AppShell title="Video Call" subtitle="LiveKit WebRTC consultation • demo UI">
  <div className="grid min-h-[calc(100vh-170px)] gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
   <section className="overflow-hidden rounded-2xl bg-[#111827] shadow-lift">
    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white"><div className="flex items-center gap-3"><button className="grid h-9 w-9 place-items-center rounded-lg bg-white/10"><ChevronLeft size={18}/></button><div><div className="text-sm font-bold">Dr. Musa Ahmed</div><div className="text-[10px] text-gray-400">Cardiologist • Live consultation</div></div></div><div className="flex items-center gap-2 rounded-full bg-green-500/15 px-3 py-1.5 text-xs font-bold text-green-300"><span className="h-2 w-2 rounded-full bg-green-400"/> Live 00:08:32</div></div>
    <div className="relative grid min-h-[560px] gap-3 p-3 sm:grid-cols-2">
      <VideoTile name="Dr. Musa Ahmed" role="Cardiologist" large speaking/><VideoTile name="Oluwatobi Badun" role="Patient" tone="blue"/>
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-black/80 p-2 shadow-xl">
       <Control active={mic} onClick={()=>setMic(!mic)} on={<Mic size={18}/>} off={<MicOff size={18}/>} label={mic?"Mute":"Unmute"}/>
       <Control active={camera} onClick={()=>setCamera(!camera)} on={<Camera size={18}/>} off={<CameraOff size={18}/>} label={camera?"Camera off":"Camera on"}/>
       <Control active={share} onClick={()=>setShare(!share)} on={<MonitorUp size={18}/>} off={<MonitorUp size={18}/>} label={share?"Stop share":"Share screen"}/>
       <Control active={true} onClick={()=>{}} on={<MoreHorizontal size={18}/>} off={<MoreHorizontal size={18}/>} label="More"/>
       <button className="ml-1 grid h-11 w-11 place-items-center rounded-xl bg-echo-emergency text-white" aria-label="End call"><PhoneOff size={18}/></button>
      </div>
    </div>
   </section>
   <aside className="space-y-4">
    <div className="echo-card p-5"><div className="flex items-center justify-between"><h2 className="font-extrabold">AI Assistant</h2><span className="rounded-full bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700">Live</span></div><div className="mt-4 rounded-xl bg-gray-50 p-4"><div className="flex items-center gap-2 text-xs font-bold"><Radio size={14} className="text-echo-red"/> Live analysis</div><p className="mt-2 text-xs leading-5 text-echo-muted">Monitoring conversation and available clinical context.</p></div><div className="mt-4 space-y-2 text-xs"><p>● Ask about pain level</p><p>● Check breathing rate</p><p>● Confirm allergies</p></div></div>
    <div className="echo-card p-5"><h2 className="font-extrabold">Patient vitals</h2><div className="mt-4 grid grid-cols-3 gap-2">{[["72","BPM"],["97%","SpO₂"],["36.5°","Temp"]].map(([v,l])=><div key={l} className="rounded-xl bg-gray-50 p-3 text-center"><div className="font-extrabold">{v}</div><div className="mt-1 text-[10px] text-echo-muted">{l}</div></div>)}</div></div>
    <div className="echo-card p-5"><h2 className="font-extrabold">Session</h2><div className="mt-4 space-y-3 text-xs text-echo-muted"><div className="flex justify-between"><span>Security</span><span className="font-bold text-green-600">Encrypted</span></div><div className="flex justify-between"><span>Network</span><span className="font-bold text-green-600">Excellent</span></div><div className="flex justify-between"><span>Recording</span><span className="font-bold">Inactive</span></div></div></div>
   </aside>
  </div>
 </AppShell>
}
function VideoTile({name,role,large,speaking,tone}:{name:string;role:string;large?:boolean;speaking?:boolean;tone?:string}){return <div className={`relative min-h-[260px] overflow-hidden rounded-2xl border ${speaking?"border-echo-green":"border-white/10"} bg-gradient-to-br from-slate-700 to-slate-950 ${large?"sm:row-span-2":""}`}><div className="absolute inset-0 grid place-items-center"><Avatar name={name} tone={tone} className={`${large?"h-28 w-28":"h-24 w-24"}`}/></div>{speaking&&<div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-green-400/60 animate-ping"/>}<div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white"><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-green-400"/>{speaking?"Speaking":"Connected"}</div><div className="absolute bottom-3 left-3"><div className="text-sm font-bold text-white">{name}</div><div className="text-[10px] text-gray-300">{role}</div></div></div>}
function Control({active,onClick,on,off,label}:{active:boolean;onClick:()=>void;on:ReactNode;off:ReactNode;label:string}){return <button onClick={onClick} title={label} className={`grid h-11 w-11 place-items-center rounded-xl ${active?"bg-white/10 text-white":"bg-white text-gray-900"}`}>{active?on:off}</button>}
