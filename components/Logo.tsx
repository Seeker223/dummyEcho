import { RadioTower } from "lucide-react";
export default function Logo({ compact=false }: {compact?: boolean}) {
 return <div className="flex items-center gap-3"><div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-echo-red"><RadioTower size={26} strokeWidth={2.5}/></div>{!compact&&<div className="min-w-0 leading-none"><div className="text-[21px] font-extrabold tracking-tight">Emergency <span className="text-echo-red">Echo</span></div><div className="mt-1 text-[9px] font-medium text-echo-muted">AI-Powered Emergency Assistant</div></div>}</div>
}
