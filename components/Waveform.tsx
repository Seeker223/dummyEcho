export default function Waveform({bars=32,tone="red",compact=false}:{bars?:number;tone?:"red"|"blue"|"white";compact?:boolean}){
  const toneClass = tone === "blue" ? "bg-blue-300" : tone === "white" ? "bg-white" : "bg-echo-red";
  return <div className={`flex items-center justify-center gap-1 ${compact ? "h-8" : "h-14"}`} aria-label="Audio waveform">
    {Array.from({length:bars}).map((_,i)=><span key={i} className={`w-1 rounded-full ${toneClass} ${compact ? "max-h-6" : "max-h-12"}`} style={{height:`${compact ? 6 + (i % 5) * 4 : 10 + ((i * 7) % 9) * 4}px`, opacity: .55 + ((i % 4) * .1)}} />)}
  </div>
}
