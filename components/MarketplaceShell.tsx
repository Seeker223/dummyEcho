"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, LayoutDashboard, Grid2X2, Package, Store, ShoppingCart, HandCoins, Search, ShieldCheck } from "lucide-react";
import AppShell from "./AppShell";

const items = [
  { href: "/marketplace", label: "Overview", icon: LayoutDashboard },
  { href: "/marketplace/categories", label: "Categories", icon: Grid2X2 },
  { href: "/marketplace/products", label: "Products", icon: Package },
  { href: "/marketplace/vendor", label: "Vendor store", icon: Store },
  { href: "/marketplace/checkout", label: "Checkout", icon: ShoppingCart },
];

export default function MarketplaceShell({children,title,subtitle}:{children:ReactNode;title:string;subtitle?:string}) {
  const path = usePathname();
  return (
    <AppShell title={title} subtitle={subtitle}>
      <div className="mb-5 overflow-x-auto rounded-2xl border border-echo-border bg-white shadow-card">
        <div className="flex min-w-max items-center gap-1 p-1.5">
          <div className="flex items-center gap-2 rounded-xl bg-echo-red px-3 py-2 text-xs font-extrabold text-white">
            <ShoppingBag size={15}/> Marketplace
          </div>
          {items.map(({href,label,icon:Icon}) => {
            const active = path === href || (href !== "/marketplace" && path.startsWith(href));
            return (
              <Link key={href} href={href} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${active ? "bg-gray-100 text-echo-ink" : "text-echo-muted hover:bg-gray-50 hover:text-echo-ink"}`}>
                <Icon size={15}/>{label}
              </Link>
            );
          })}
          <Link href="/marketplace/sell" className="ml-auto flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-echo-red hover:bg-red-50">
            <HandCoins size={15}/> Become a vendor
          </Link>
        </div>
      </div>
      {children}
    </AppShell>
  );
}
