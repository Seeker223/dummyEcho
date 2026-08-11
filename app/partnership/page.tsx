import PartnershipShell from "@/components/PartnershipShell";
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, Clock3, Handshake, UsersRound } from "lucide-react";
import Link from "next/link";

const programs=[["Emergency Response Network","Active","12,458 lives impacted"],["Health Education Initiative","Active","8,742 lives impacted"],["Maternal Care Support","Upcoming","2,354 lives expected"],["Rural Health Outreach","Completed","6,345 lives reached"]];
const metrics=[["Lives impacted","12,458","+12% from last year"],["Active partners","24","+6 this quarter"],["Communities served","78","+18% from last year"],["Avg. response","4.2 min","-9% from last year"]];

export default function PartnershipOverview(){return <PartnershipShell title="Partner Dashboard Overview" subtitle="Build measurable impact through trusted emergency-care partnerships.">
 <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_320px]">
  <div className="space-y-4">
   <section className="echo-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-lg font-extrabold">Welcome, Dr. James Okafor</div><p className="mt-1 text-xs text-echo-muted">HopeCare Hospitals • Partner administrator</p></div><span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-700">Verified Partner</span></div>
    <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">{metrics.map(([a,b,c])=><div key={a} className="rounded-xl border border-echo-border bg-gray-50 p-4"><div className="text-[10px] font-semibold text-echo-muted">{a}</div><div className="mt-1 text-2xl font-extrabold">{b}</div><div className="mt-1 text-[10px] font-bold text-green-600">{c}</div></div>)}</div>
   </section>
   <section className="echo-card p-5"><div className="flex items-center justify-between"><div><h2 className="font-extrabold">Partnership impact</h2><p className="text-xs text-echo-muted">Lives and communities reached over time</p></div><span className="rounded-lg border px-3 py-2 text-[10px] font-bold">This year</span></div>
    <div className="mt-5 grid h-44 grid-cols-12 items-end gap-2">{[28,42,35,58,48,70,62,84,72,94,78,100].map((h,i)=><div key={i} className="rounded-t-md bg-red-100" style={{height:`${h}%`}}><div className="h-full rounded-t-md bg-echo-red" style={{height:`${Math.max(20,h-25)}%`}}/></div>)}</div>
    <div className="mt-3 flex justify-between text-[9px] text-echo-muted">{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m=><span key={m}>{m}</span>)}</div>
   </section>
   <section className="echo-card p-5"><div className="flex items-center justify-between"><div><h2 className="font-extrabold">Partnership programs</h2><p className="text-xs text-echo-muted">Collaborative programs making real impact</p></div><Link href="/partnership/programs" className="text-xs font-bold text-echo-red">View all →</Link></div>
    <div className="mt-4 grid gap-2">{programs.map(([name,status,impact])=><div key={name} className="flex flex-wrap items-center gap-3 rounded-xl border border-echo-border p-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-echo-red"><BriefcaseBusiness size={16}/></span><div className="min-w-0 flex-1"><div className="text-sm font-bold">{name}</div><div className="text-[10px] text-echo-muted">{impact}</div></div><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${status==="Active"?"bg-green-50 text-green-700":status==="Upcoming"?"bg-yellow-50 text-yellow-700":"bg-gray-100 text-gray-600"}`}>{status}</span></div>)}</div>
   </section>
  </div>
  <aside className="space-y-4">
   <section className="echo-card p-5"><h2 className="font-extrabold">Why partner with us?</h2><div className="mt-4 space-y-4">{[["Expand impact","Reach more communities together",UsersRound],["Trusted network","Join verified organizations",Handshake],["Resource sharing","Share resources & expertise",ArrowUpRight],["Capacity building","Train, learn & grow together",BriefcaseBusiness],["Sustainable impact","Long-term community change",CheckCircle2]].map(([a,b,I])=><div key={a as string} className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-50 text-echo-red"><I size={16}/></span><div><div className="text-xs font-bold">{a as string}</div><div className="text-[10px] text-echo-muted">{b as string}</div></div></div>)}</div></section>
   <section className="rounded-2xl bg-echo-red p-5 text-white"><div className="text-lg font-extrabold">Ready to partner?</div><p className="mt-1 text-xs text-red-100">Let's create a safer tomorrow together.</p><Link href="/partnership/proposal" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-echo-red">Become a Partner</Link></section>
   <section className="echo-card p-5"><div className="flex items-center gap-2 text-xs font-bold"><Clock3 size={15} className="text-echo-red"/> Recent activity</div><p className="mt-3 text-[11px] text-echo-muted">Health Education Initiative was updated 2 hours ago.</p></section>
  </aside>
 </div>
</PartnershipShell>}
