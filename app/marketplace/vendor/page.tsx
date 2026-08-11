import Link from "next/link";
import { BadgeCheck, ChevronRight, HeartPulse, Package, Star, Store, UsersRound } from "lucide-react";
import MarketplaceShell from "@/components/MarketplaceShell";

const products=["Automatic Defibrillator (AED)","Portable Oxygen Concentrator","Digital Blood Pressure Monitor"];

export default function VendorStore(){
 return <MarketplaceShell title="Vendor Store" subtitle="Explore verified sellers and their emergency-care products.">
  <div className="space-y-5">
   <section className="echo-card overflow-hidden">
    <div className="bg-[#101010] p-6 text-white sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-echo-red"><Store size={28}/></div><div><div className="flex items-center gap-2 text-xl font-extrabold">MedEquip Solutions <BadgeCheck size={18} className="text-green-400"/></div><p className="mt-1 text-xs text-white/60">Portable medical and emergency-care solutions • Lagos, Nigeria</p></div></div><div className="text-left sm:text-right"><div className="text-lg font-extrabold">4.9 ★</div><div className="text-xs text-white/60">124 reviews</div></div></div></div>
    <div className="grid grid-cols-3 divide-x border-t border-echo-border"><div className="p-4 text-center"><div className="text-lg font-extrabold">45</div><div className="text-xs text-echo-muted">Products</div></div><div className="p-4 text-center"><div className="text-lg font-extrabold">124</div><div className="text-xs text-echo-muted">Reviews</div></div><div className="p-4 text-center"><div className="text-lg font-extrabold">98%</div><div className="text-xs text-echo-muted">Positive</div></div></div>
   </section>
   <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
    <section><div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-extrabold">Featured products</h3><Link href="/marketplace/products" className="text-xs font-bold text-echo-red">View all</Link></div><div className="grid gap-4 md:grid-cols-3">{products.map((p,i)=><div key={p} className="echo-card overflow-hidden"><div className="grid h-36 place-items-center bg-gray-50"><div className="grid h-24 w-24 place-items-center rounded-2xl bg-white text-echo-red shadow-card">{i===0?<HeartPulse size={45}/>:<Package size={45}/>}</div></div><div className="p-4"><h4 className="text-sm font-extrabold">{p}</h4><div className="mt-2 text-xs font-bold text-amber-500">★★★★★ <span className="text-echo-muted">Verified</span></div><Link href="/marketplace/products/aed" className="mt-4 flex items-center justify-between text-xs font-bold text-echo-red">View product <ChevronRight size={14}/></Link></div></div>)}</div></section>
    <aside className="echo-card p-5"><div className="text-sm font-extrabold">About the store</div><p className="mt-3 text-xs leading-5 text-echo-muted">Provider of medical equipment and emergency solutions focused on reliable, portable and practical care technology.</p><div className="mt-5 space-y-3 text-xs">{[["Verified vendor",BadgeCheck],["Trusted by buyers",UsersRound],["45 products",Package]].map(([x,Icon])=><div key={x as string} className="flex items-center gap-2"><Icon size={15} className="text-echo-red"/><span className="font-bold">{x as string}</span></div>)}</div></aside>
   </div>
  </div>
 </MarketplaceShell>
}
