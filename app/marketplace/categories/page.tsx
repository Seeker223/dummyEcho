import Link from "next/link";
import { Ambulance, ArrowRight, Bandage, BookOpen, HeartPulse, Pill, ShieldPlus, Stethoscope, Syringe, Thermometer, Truck, Waves } from "lucide-react";
import MarketplaceShell from "@/components/MarketplaceShell";

const categories = [
  ["Medical Equipment","128 products","Clinical and home-care equipment",Stethoscope],
  ["Emergency Supplies","84 products","First response and rescue essentials",ShieldPlus],
  ["Medicines","243 products","Verified pharmacy products",Pill],
  ["Training & Courses","56 courses","First aid and emergency readiness",BookOpen],
  ["Ambulance Services","24 providers","Emergency transport and response",Ambulance],
  ["First Aid","78 products","Dressings, kits and response tools",Bandage],
  ["Personal Protective Equipment","64 products","Gloves, masks and protective wear",Syringe],
  ["Monitoring Devices","52 products","Vitals and home monitoring",Thermometer],
  ["Respiratory Care","31 products","Oxygen and breathing support",Waves],
  ["Mobility & Support","46 products","Home and patient support",Truck],
];

export default function CategoriesPage(){
 return <MarketplaceShell title="Product Categories" subtitle="Browse emergency-care products, services and training by category.">
  <div className="space-y-5">
   <div className="echo-card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-extrabold">All categories</h2><p className="mt-1 text-xs text-echo-muted">Find the right support for emergency preparedness and everyday care.</p></div><Link href="/marketplace/products" className="echo-btn-secondary">Browse products <ArrowRight size={15}/></Link></div></div>
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
    {categories.map(([name,count,desc,Icon]) => <Link href="/marketplace/products" key={name as string} className="echo-card p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-echo-red"><Icon size={24}/></div>
      <h3 className="mt-4 text-sm font-extrabold">{name as string}</h3><div className="mt-1 text-xs font-bold text-echo-red">{count as string}</div><p className="mt-2 text-xs leading-5 text-echo-muted">{desc as string}</p>
    </Link>)}
   </div>
  </div>
 </MarketplaceShell>
}
