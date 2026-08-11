"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Filter, HeartPulse, PackageCheck, Search, ShoppingCart, SlidersHorizontal, Stethoscope } from "lucide-react";
import MarketplaceShell from "@/components/MarketplaceShell";

const products = [
 {name:"Portable Oxygen Concentrator",price:"₦450,000",cat:"Medical Equipment",rating:"4.8",reviews:46},
 {name:"Automatic Defibrillator (AED)",price:"₦950,000",cat:"Emergency Supplies",rating:"4.9",reviews:118},
 {name:"Digital Blood Pressure Monitor",price:"₦25,000",cat:"Monitoring Devices",rating:"4.7",reviews:32},
 {name:"Glucometer with Strips",price:"₦15,000",cat:"Monitoring Devices",rating:"4.8",reviews:65},
 {name:"Emergency First Aid Kit",price:"₦42,000",cat:"First Aid",rating:"4.9",reviews:87},
 {name:"Pulse Oximeter",price:"₦18,500",cat:"Monitoring Devices",rating:"4.7",reviews:51},
];

export default function ProductsPage(){
 const [query,setQuery]=useState(""); const [cat,setCat]=useState("All");
 const filtered=useMemo(()=>products.filter(p=>(cat==="All"||p.cat===cat)&&p.name.toLowerCase().includes(query.toLowerCase())),[query,cat]);
 return <MarketplaceShell title="Product Listing" subtitle="Compare trusted emergency-care products from verified marketplace sellers.">
  <div className="space-y-5">
   <div className="echo-card p-4">
    <div className="flex flex-col gap-3 lg:flex-row">
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-echo-border px-3"><Search size={17} className="text-echo-muted"/><input value={query} onChange={e=>setQuery(e.target.value)} className="w-full bg-transparent py-2.5 text-sm outline-none" placeholder="Search products..."/></div>
      <select value={cat} onChange={e=>setCat(e.target.value)} className="rounded-xl border border-echo-border bg-white px-3 py-2.5 text-sm outline-none"><option>All</option><option>Medical Equipment</option><option>Emergency Supplies</option><option>Monitoring Devices</option><option>First Aid</option></select>
      <button className="echo-btn-secondary"><SlidersHorizontal size={16}/> Filter</button>
    </div>
   </div>
   <div className="flex items-center justify-between"><div className="text-xs font-bold text-echo-muted">{filtered.length} products</div><button className="text-xs font-bold text-echo-muted"><Filter size={14} className="inline"/> Sort by relevance</button></div>
   <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {filtered.map((p,i)=><div key={p.name} className="echo-card overflow-hidden">
      <div className="grid h-48 place-items-center bg-gray-50"><div className="grid h-32 w-32 place-items-center rounded-3xl border border-gray-200 bg-white text-gray-700 shadow-card">{i===1?<HeartPulse size={58}/>:i===0?<Stethoscope size={58}/>:<PackageCheck size={58}/>}</div></div>
      <div className="p-4"><div className="text-[10px] font-bold text-echo-muted">{p.cat}</div><h3 className="mt-1 text-sm font-extrabold">{p.name}</h3><div className="mt-2 flex items-center justify-between"><span className="text-lg font-extrabold">{p.price}</span><span className="text-xs font-bold text-amber-500">★ {p.rating} <span className="text-echo-muted">({p.reviews})</span></span></div>
      <div className="mt-4 flex gap-2"><Link href="/marketplace/products/aed" className="echo-btn-secondary flex-1 justify-center">View details</Link><button className="echo-btn-primary flex-1 justify-center"><ShoppingCart size={15}/> Add to cart</button></div></div>
    </div>)}
   </div>
  </div>
 </MarketplaceShell>
}
