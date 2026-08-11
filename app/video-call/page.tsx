"use client";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import VideoTile from "@/components/VideoTile";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import Waveform from "@/components/Waveform";
import CallControlBar, { CallControl } from "@/components/CallControlBar";
import { Activity, Camera, CameraOff, FileText, HeartPulse, Mic, MicOff, MonitorUp, MoreHorizontal, PhoneOff, Radio, ShieldCheck, UserRound, Volume2 } from "lucide-react";
import { useState } from "react";

export default function VideoCall(){
 const [mic,setMic]=useState(true); const [camera,setCamera]=useState(true); const [share,setShare]=useState(false); const [speaker,setSpeaker]=useState(true);
 return <AppShell title="Video Call" subtitle="Secure live consultation • demo UI" mode="live">
  <div className="grid min-h-[calc(100vh-168px)] gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
   <section className="relative flex min-h-[620px] min-w-0 flex-col overflow-hidden rounded-2xl bg-[#111827] shadow-lift">
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white sm:px-5">
      <div className="flex min-w-0 items-center gap-3"><Avatar name="Dr. Musa Ahmed" className="h-10 w-10 border-2"/><div className="min-w-0"><div className="truncate text-sm font-bold">Dr. Musa Ahmed</div><div className="truncate text-[10px] text-gray-400">Cardiologist • Live consultation</div></div></div>
      <StatusBadge tone="success" dot>Live 00:08:32</StatusBadge>
    </header>
    <div className="relative min-h-0 flex-1 p-3 sm:p-4">
      <div className="grid h-full min-h-[520px] gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(220px,.7fr)]">
        <VideoTile name="Dr. Musa Ahmed" role="Cardiologist" primary speaking tone="red"/>
        <div className="grid min-h-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <VideoTile name="Oluwatobi Badun" role="Patient" cameraOn={camera} tone="blue"/>
          <div className="hidden rounded-2xl border border-white/10 bg-white/[.04] p-4 text-white lg:block"><div className="flex items-center justify-between"><span className="text-xs font-bold">Live transcript</span><StatusBadge tone="neutral">AI</StatusBadge></div><div className="mt-4 space-y-3 text-xs leading-5 text-gray-300"><p><span className="font-bold text-white">Doctor:</span> How are you feeling right now?</p><p><span className="font-bold text-white">Patient:</span> I&apos;m still feeling chest discomfort.</p><div className="rounded-xl bg-white/5 p-3"><div className="flex items-center gap-2 text-green-300"><Radio size={13}/> AI listening</div><div className="mt-2"><Waveform bars={22} tone="white" compact/></div></div></div></div>
        </div>
      </div>
      <CallControlBar dangerLabel="End call" onEnd={()=>{}}>
        <CallControl active={mic} onClick={()=>setMic(v=>!v)} label={mic?"Mute microphone":"Unmute microphone"}>{mic?<Mic size={18}/>:<MicOff size={18}/>}</CallControl>
        <CallControl active={camera} onClick={()=>setCamera(v=>!v)} label={camera?"Turn camera off":"Turn camera on"}>{camera?<Camera size={18}/>:<CameraOff size={18}/>}</CallControl>
        <CallControl active={share} onClick={()=>setShare(v=>!v)} label={share?"Stop screen sharing":"Share screen"}><MonitorUp size={18}/></CallControl>
        <CallControl active={speaker} onClick={()=>setSpeaker(v=>!v)} label={speaker?"Mute speaker":"Unmute speaker"}><Volume2 size={18}/></CallControl>
        <CallControl label="More call options"><MoreHorizontal size={18}/></CallControl>
      </CallControlBar>
    </div>
   </section>
   <aside className="space-y-4 xl:max-h-[calc(100vh-168px)] xl:overflow-y-auto xl:pr-1">
    <div className="echo-card p-5"><div className="flex items-center justify-between"><div><div className="eyebrow">Care team</div><h2 className="mt-1 font-extrabold">1 doctor in call</h2></div><StatusBadge tone="success" dot>Connected</StatusBadge></div><div className="mt-4 flex items-center gap-3 rounded-xl border border-echo-border p-3"><Avatar name="Dr. Musa Ahmed" className="h-11 w-11"/><div className="min-w-0 flex-1"><div className="text-sm font-bold">Dr. Musa Ahmed</div><div className="text-xs text-echo-muted">Cardiologist • Verified</div></div><span className="text-[10px] font-bold text-green-600">Excellent</span></div></div>
    <div className="echo-card p-5"><div className="flex items-center justify-between"><div><div className="eyebrow">Patient vitals</div><h2 className="mt-1 font-extrabold">Live snapshot</h2></div><Activity size={18} className="text-echo-red"/></div><div className="mt-4 grid grid-cols-3 gap-2"><StatCard label="Heart rate" value="72" icon={HeartPulse} tone="red" meta="BPM"/><StatCard label="SpO₂" value="97%" icon={Activity} tone="green" meta="Oxygen"/><StatCard label="Temp" value="36.5°" icon={Activity} tone="yellow" meta="Celsius"/></div></div>
    <div className="echo-card p-5"><div className="flex items-center justify-between"><h2 className="font-extrabold">AI assistant</h2><StatusBadge tone="purple">Live</StatusBadge></div><p className="mt-3 text-xs leading-5 text-echo-muted">Monitoring the conversation for context and surfacing guidance when appropriate.</p><div className="mt-4 space-y-2 text-xs"><div className="rounded-xl bg-gray-50 p-3">Ask about pain level</div><div className="rounded-xl bg-gray-50 p-3">Confirm allergies</div><div className="rounded-xl bg-gray-50 p-3">Check breathing rate</div></div></div>
    <div className="echo-card p-5"><div className="flex items-center justify-between"><h2 className="font-extrabold">Session safety</h2><ShieldCheck size={18} className="text-green-600"/></div><div className="mt-4 space-y-3 text-xs"><div className="flex justify-between"><span className="text-echo-muted">Security</span><span className="font-bold text-green-600">Encrypted</span></div><div className="flex justify-between"><span className="text-echo-muted">Recording</span><span className="font-bold">Inactive</span></div><div className="flex justify-between"><span className="text-echo-muted">Participant</span><span className="font-bold">Patient</span></div></div></div>
    <div className="grid grid-cols-2 gap-2"><button className="echo-btn-secondary"><FileText size={16}/> Transcript</button><button className="echo-btn-secondary"><UserRound size={16}/> Participants</button></div>
   </aside>
  </div>
 </AppShell>
}
