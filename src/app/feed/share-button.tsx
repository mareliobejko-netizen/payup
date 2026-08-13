"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

export default function ShareButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${path}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "PayUp · The Wall", text: "Guarda questa penitenza 😂", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // L'utente può annullare la condivisione: non serve mostrare un errore.
    }
  }

  return <button type="button" onClick={share} className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-sm font-black text-zinc-300">{copied ? <Check size={17} className="text-lime-400"/> : <Share2 size={17}/>} {copied ? "Copiato" : "Condividi"}</button>;
}
