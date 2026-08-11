import Link from "next/link";
import { ArrowLeft, BadgeCheck, Check, HeartPulse, Minus, Plus, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import MarketplaceShell from "@/components/MarketplaceShell";

export default function ProductDetails(){
 return <MarketplaceShell title="Product Details" subtitle="Review product information, vendor trust signals and purchase options.">
  <div className="space-y-5">
   <Link href="/marketplace/products" className="inline-flex items-center gap-2 text-xs font-bold text-echo-muted hover:text-echo-ink"><ArrowLeft size={14}/> Back to products</Link>
   <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
    <section className="echo-card overflow-hidden">
      <div className="grid min-h-[440px] place-items-center bg-gray-50 p-8"><div className="relative grid h-72 w-80 place-items-center rounded-[32px] border border-gray-200 bg-white shadow-lift"><div className="grid h-44 w-56 place-items-center rounded-3xl border-4 border-gray-300 bg-gray-100"><HeartPulse size={78} className="text-echo-red"/><span className="absolute bottom-9 rounded-full bg-echo-red px-3 py-1 text-[10px] font-extrabold text-white">AED</span></div></div></div>
    </section>
    <section className="space-y-5">
      <div><div className="text-xs font-bold text-echo-red">Emergency Supplies</div><h2 className="mt-2 text-2xl font-extrabold">Automatic Defibrillator (AED)</h2><div className="mt-3 flex items-center gap-2"><span className="text-amber-500">★★★★★</span><span className="text-xs font-bold">4.9</span><span className="text-xs text-echo-muted">(118 reviews)</span></div><div className="mt-4 text-2xl font-extrabold">₦950,000</div></div>
      <div className="echo-card-soft p-4"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-green-50 text-green-700"><BadgeCheck size={21}/></div><div><div className="text-sm font-extrabold">MedEquip Solutions</div><div className="text-xs text-echo-muted">Verified vendor • Lagos, Nigeria</div></div></div></div>
      <ul className="space-y-3 text-sm text-echo-muted">{["Portable and lightweight","Voice & visual prompts","Long battery life","Multi-language support"].map(x=><li key={x} className="flex items-center gap-2"><Check size={16} className="text-green-600"/>{x}</li>)}</ul>
      <div className="flex items-center gap-3"><div className="flex items-center rounded-xl border border-echo-border"><button className="p-3"><Minus size={15}/></button><span className="px-3 text-sm font-bold">1</span><button className="p-3"><Plus size={15}/></button></div><button className="echo-btn-primary flex-1 justify-center"><ShoppingCart size={16}/> Add to Cart</button><button className="echo-btn-secondary flex-1 justify-center">Buy Now</button></div>
      <div className="grid gap-3 sm:grid-cols-3"><div className="echo-card-soft p-3"><ShieldCheck size={17} className="text-echo-red"/><div className="mt-2 text-xs font-extrabold">Secure payment</div></div><div className="echo-card-soft p-3"><Truck size={17} className="text-echo-red"/><div className="mt-2 text-xs font-extrabold">Fast delivery</div></div><div className="echo-card-soft p-3"><Star size={17} className="text-echo-red"/><div className="mt-2 text-xs font-extrabold">Top rated</div></div></div>
    </section>
   </div>
  </div>
 </MarketplaceShell>
}
