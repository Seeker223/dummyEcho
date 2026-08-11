import Link from "next/link";
import { ArrowRight, Ambulance, BadgeCheck, HeartPulse, PackageCheck, Pill, Search, ShieldCheck, ShoppingCart, Stethoscope, Truck, Wrench } from "lucide-react";
import MarketplaceShell from "@/components/MarketplaceShell";

const categories = [
  ["Medical Equipment","128 products",Stethoscope,"/marketplace/products"],
  ["Emergency Supplies","84 products",PackageCheck,"/marketplace/products"],
  ["Medicines","243 products",Pill,"/marketplace/products"],
  ["Training & Courses","56 courses",HeartPulse,"/marketplace/products"],
  ["Ambulance Services","24 providers",Ambulance,"/marketplace/products"],
];

const products = [
  ["Portable Oxygen Concentrator","₦450,000","Medical Equipment","4.8"],
  ["Automatic Defibrillator (AED)","₦950,000","Emergency Supplies","4.9"],
  ["Digital Blood Pressure Monitor","₦25,000","Monitoring Devices","4.7"],
  ["Glucometer with Strips","₦15,000","Monitoring Devices","4.8"],
];

export default function MarketplacePage(){
  return <MarketplaceShell title="Marketplace" subtitle="Trusted products and services for emergency care, home health and preparedness.">
    <div className="space-y-6">
      <section className="echo-card overflow-hidden">
        <div className="grid gap-8 bg-gradient-to-br from-red-50 via-white to-white p-6 sm:p-8 lg:grid-cols-[1.2fr_.8fr]">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-echo-red shadow-card"><ShieldCheck size={14}/> Verified sellers • Secure payments</span>
            <h2 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">Everything You Need<br/><span className="text-echo-red">For Emergency Care.</span></h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-echo-muted">Quality medical products, emergency supplies and trusted services from verified marketplace partners.</p>
            <div className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-echo-border bg-white p-2 shadow-card">
              <Search size={18} className="ml-2 text-echo-muted"/>
              <input className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none" placeholder="Search products, vendors or services..." />
              <button className="echo-btn-primary px-4">Search</button>
            </div>
          </div>
          <div className="flex min-h-64 items-center justify-center">
            <div className="relative flex h-52 w-72 items-center justify-center rounded-[28px] border border-red-100 bg-white shadow-lift">
              <div className="absolute right-8 top-6 h-12 w-12 rounded-2xl bg-red-50"/>
              <div className="grid h-32 w-40 place-items-center rounded-3xl border-4 border-echo-red bg-red-50">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-echo-red text-white"><HeartPulse size={38}/></div>
              </div>
              <div className="absolute bottom-5 left-7 rounded-xl bg-white px-3 py-2 text-[10px] font-extrabold shadow-card"><span className="text-echo-red">Emergency</span> ready</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-extrabold">Shop by Category</h3><Link href="/marketplace/categories" className="text-xs font-bold text-echo-red">View all <ArrowRight className="inline" size={13}/></Link></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map(([name,count,Icon,href]) => <Link href={href as string} key={name as string} className="echo-card p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-echo-red"><Icon size={22}/></div>
            <div className="mt-4 text-sm font-extrabold">{name as string}</div><div className="mt-1 text-xs text-echo-muted">{count as string}</div>
          </Link>)}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-extrabold">Featured products</h3><Link href="/marketplace/products" className="text-xs font-bold text-echo-red">View all <ArrowRight className="inline" size={13}/></Link></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {products.map(([name,price,cat,rating],i) => <div key={name} className="echo-card overflow-hidden">
            <div className="grid h-44 place-items-center bg-gray-50">
              <div className={`grid h-28 w-28 place-items-center rounded-3xl border ${i===1?"border-red-200 bg-red-50 text-echo-red":"border-gray-200 bg-white text-gray-700"}`}>
                {i===1?<HeartPulse size={52}/>:i===0?<Stethoscope size={52}/>:i===2?<HeartPulse size={52}/>:<PackageCheck size={52}/>}
              </div>
            </div>
            <div className="p-4">
              <div className="text-[10px] font-bold text-echo-muted">{cat}</div>
              <h4 className="mt-1 text-sm font-extrabold">{name}</h4>
              <div className="mt-2 flex items-center justify-between"><span className="text-base font-extrabold">{price}</span><span className="text-xs font-bold text-amber-500">★ {rating}</span></div>
              <Link href="/marketplace/products/aed" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-xs font-extrabold text-echo-red hover:bg-red-50"><ShoppingCart size={15}/> Add to cart</Link>
            </div>
          </div>)}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Quality assured","Verified products and sellers",BadgeCheck],
          ["Trusted vendors","Verified and rated partners",ShieldCheck],
          ["Secure payments","Protected marketplace transactions",ShieldCheck],
          ["Fast delivery","Quick and reliable delivery",Truck],
        ].map(([title,desc,Icon]) => <div key={title as string} className="echo-card p-4"><Icon size={20} className="text-echo-red"/><div className="mt-3 text-sm font-extrabold">{title as string}</div><p className="mt-1 text-xs leading-5 text-echo-muted">{desc as string}</p></div>)}
      </section>

      <section className="rounded-2xl bg-[#101010] p-6 text-white sm:flex sm:items-center sm:justify-between">
        <div><div className="text-lg font-extrabold">Want to sell?</div><p className="mt-1 text-sm text-white/70">Join the Emergency Echo marketplace as a verified vendor.</p></div>
        <Link href="/marketplace/sell" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#101010] sm:mt-0">Become a vendor <ArrowRight size={14}/></Link>
      </section>
    </div>
  </MarketplaceShell>
}
