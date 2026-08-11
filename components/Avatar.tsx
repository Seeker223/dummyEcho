export default function Avatar({name, className="", tone="red"}:{name:string;className?:string;tone?:string}){
 const initials=name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase();
 return <div className={`grid place-items-center rounded-full border-4 border-white shadow-md ${tone==="blue"?"bg-blue-50 text-blue-700":tone==="green"?"bg-green-50 text-green-700":"bg-red-50 text-echo-red"} ${className}`}><span className="text-sm font-extrabold">{initials}</span></div>
}
