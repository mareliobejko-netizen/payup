"use client";
import { Check, Copy, Link2, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function InviteTools({code}:{code:string}){
 const [origin,setOrigin]=useState(""); const [copied,setCopied]=useState<string|null>(null);
 useEffect(()=>setOrigin(window.location.origin),[]);
 const link=useMemo(()=>origin?`${origin}/join/${encodeURIComponent(code)}`:"",[origin,code]);
 const qr=link?`https://quickchart.io/qr?size=260&margin=2&text=${encodeURIComponent(link)}`:"";
 async function copy(value:string,type:string){await navigator.clipboard.writeText(value);setCopied(type);setTimeout(()=>setCopied(null),1600)}
 async function share(){if(!link)return; if(navigator.share) await navigator.share({title:"Invito PayUp",text:`Entra nel mio gruppo PayUp con il codice ${code}`,url:link}); else await copy(link,"link")}
 return <div className="mt-4 space-y-3"><div className="rounded-2xl bg-zinc-950 p-4"><p className="text-xs font-bold uppercase text-zinc-600">Codice invito</p><div className="mt-2 flex items-center justify-between gap-3"><p className="font-mono text-xl font-black">{code}</p><button type="button" onClick={()=>copy(code,"code")} className="flex h-10 items-center gap-2 rounded-xl bg-zinc-800 px-3 text-xs font-black">{copied==="code"?<Check size={15}/>:<Copy size={15}/>} COPIA</button></div></div>{link&&<><div className="rounded-2xl bg-zinc-950 p-4"><p className="text-xs font-bold uppercase text-zinc-600">Link diretto</p><p className="mt-2 truncate text-sm text-zinc-300">{link}</p><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={()=>copy(link,"link")} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-800 text-xs font-black"><Link2 size={15}/>{copied==="link"?"COPIATO":"COPIA LINK"}</button><button type="button" onClick={share} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-lime-400 text-xs font-black text-black"><Share2 size={15}/>CONDIVIDI</button></div></div><div className="rounded-2xl bg-white p-5 text-center"><img src={qr} alt={`QR invito ${code}`} className="mx-auto h-56 w-56"/><p className="mt-2 text-xs font-bold text-zinc-600">Scansiona per entrare nel gruppo</p></div></>}</div>
}
