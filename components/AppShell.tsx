import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
export default function AppShell({children,title,subtitle}:{children:ReactNode;title:string;subtitle?:string}){
 return <div className="min-h-screen"><Sidebar/><main className="min-h-screen lg:ml-[240px]"><Topbar title={title} subtitle={subtitle}/><div className="p-4 pb-24 sm:p-6 lg:p-8 lg:pb-10">{children}</div></main></div>
}
