"use client";
import Avatar from "./Avatar";
import StatusBadge from "./StatusBadge";
import Waveform from "./Waveform";

export default function VideoTile({name,role,primary=false,speaking=false,cameraOn=true,tone="red"}:{name:string;role:string;primary?:boolean;speaking?:boolean;cameraOn?:boolean;tone?:string}){
 return <article className={`relative min-h-0 overflow-hidden rounded-2xl border ${speaking ? "border-green-400/80" : "border-white/10"} bg-[#1a2230] ${primary ? "h-full min-h-[340px]" : "h-full min-h-[180px]"}`}>
   {cameraOn ? <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,.13),transparent_34%),linear-gradient(145deg,#334155,#0f172a)]"><div className="absolute inset-0 grid place-items-center"><Avatar name={name} tone={tone} className={primary ? "h-32 w-32 sm:h-40 sm:w-40" : "h-24 w-24"}/></div></div> : <div className="absolute inset-0 grid place-items-center bg-[#121923]"><div className="text-center"><Avatar name={name} tone={tone} className={primary ? "h-28 w-28" : "h-20 w-20"}/><div className="mt-3 text-xs font-semibold text-gray-400">Camera off</div></div></div>}
   {speaking && <div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="absolute h-40 w-40 rounded-full border border-green-400/50 animate-ping"/><div className="absolute h-52 w-52 rounded-full border border-green-400/20"/><div className="absolute bottom-20 rounded-full bg-black/60 px-3 py-1"><Waveform bars={18} tone="white" compact/></div></div>}
   <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2"><StatusBadge tone={speaking?"success":"neutral"} dot>{speaking?"Speaking":"Connected"}</StatusBadge><StatusBadge tone="neutral">Live</StatusBadge></div>
   <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3"><div><div className="text-sm font-bold text-white">{name}</div><div className="mt-0.5 text-[10px] text-gray-300">{role}</div></div>{speaking&&<span className="rounded-full bg-green-500/15 px-2 py-1 text-[10px] font-bold text-green-300">Voice active</span>}</div>
 </article>
}
