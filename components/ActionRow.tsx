import type { LucideIcon } from "lucide-react";

export default function ActionRow({icon:Icon,title,description,onClick,href,danger=false}:{icon:LucideIcon;title:string;description?:string;onClick?:()=>void;href?:string;danger?:boolean}){
  const className = `group flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition hover:-translate-y-px hover:shadow-card ${danger ? "border-red-100 bg-red-50/60 hover:bg-red-50" : "border-echo-border bg-white hover:border-red-100"}`;
  const content = <><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${danger ? "bg-white text-echo-red" : "bg-gray-50 text-echo-red"}`}><Icon size={18}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{title}</span>{description && <span className="mt-0.5 block text-xs leading-5 text-echo-muted">{description}</span>}</span><span className="text-echo-muted transition group-hover:translate-x-0.5">›</span></>;
  if(href) return <a href={href} className={className}>{content}</a>;
  return <button onClick={onClick} className={className}>{content}</button>;
}
