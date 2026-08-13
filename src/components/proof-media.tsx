"use client";

import { Maximize2, X } from "lucide-react";
import { useState } from "react";

export default function ProofMedia({ src, type, alt = "Prova", className = "aspect-[4/3] w-full object-cover", proofId }: { src: string; type?: string | null; alt?: string; className?: string; proofId?: string }) {
  const displaySrc = src.includes(".private.blob.") && proofId ? `/api/private-media?proofId=${encodeURIComponent(proofId)}` : src;
  const [open, setOpen] = useState(false);
  if (type === "video") return <video src={displaySrc} controls playsInline className={className} />;
  return <>
    <button type="button" onClick={() => setOpen(true)} className="group relative block w-full cursor-zoom-in overflow-hidden text-left">
      <img src={displaySrc} alt={alt} className={className}/>
      <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white opacity-90 backdrop-blur"><Maximize2 size={18}/></span>
    </button>
    {open && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3" onClick={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white"><X size={24}/></button>
      <img src={displaySrc} alt={alt} className="max-h-[94vh] max-w-[96vw] object-contain" onClick={(e)=>e.stopPropagation()}/>
    </div>}
  </>;
}
