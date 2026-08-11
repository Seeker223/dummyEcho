import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
export default function AppShell({children,title,subtitle,mode="normal"}:{children:ReactNode;title:string;subtitle?:string;mode?:"normal"|"emergency"|"live"}){
 const modeClass = mode === "emergency" ? "bg-[#fff8f8]" : mode === "live" ? "bg-[#f3f5f8]" : "bg-[#FAFAFA]";
 return <div className={`min-h-screen ${modeClass}`}><Sidebar/><main className="min-h-screen lg:ml-[248px]"><Topbar title={title} subtitle={subtitle}/><div className="mx-auto w-full max-w-[1600px] p-4 pb-24 sm:p-6 lg:p-8 lg:pb-10">{children}</div></main></div>
}
