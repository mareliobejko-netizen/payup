"use client";

import { Download, ExternalLink, ImageDown, Share2, X } from "lucide-react";
import { useState } from "react";

export default function StoryShareButton({
  imagePath,
  filename = "payup-story.png",
  text = "Guarda su PayUp 😈",
}: {
  imagePath: string;
  filename?: string;
  text?: string;
}) {
  const [working, setWorking] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  async function getStoryFile() {
    const res = await fetch(imagePath, { cache: "no-store" });
    if (!res.ok) throw new Error(`Story image HTTP ${res.status}`);
    const blob = await res.blob();
    return { blob, file: new File([blob], filename, { type: blob.type || "image/png" }) };
  }

  async function shareImage() {
    setWorking(true);
    setMessage("");
    try {
      const { file } = await getStoryFile();
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ files: [file], title: "PayUp", text });
        setMessage("Immagine pronta per la condivisione ✓");
        return;
      }
      setOpen(true);
      setMessage("Il browser non condivide file direttamente: salva l'immagine e aprila in Instagram.");
    } catch (error) {
      console.error(error);
      setOpen(true);
      setMessage("Condivisione diretta non disponibile. Puoi aprire o salvare la Story Card qui sotto.");
    } finally {
      setWorking(false);
    }
  }

  async function downloadImage() {
    setWorking(true);
    setMessage("");
    try {
      const { blob } = await getStoryFile();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2500);
      setMessage("Story Card salvata ✓");
    } catch (error) {
      console.error(error);
      setMessage("Non sono riuscito a salvare l'immagine. Prova con 'Apri immagine'.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-fuchsia-500/10 px-4 py-2 text-sm font-black text-fuchsia-300"
      >
        <ImageDown size={17} /> Story Card
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-3 backdrop-blur-sm sm:items-center">
          <div className="safe-bottom w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[.22em] text-fuchsia-300">Instagram Story</p>
                <p className="text-sm font-bold text-zinc-300">Anteprima 9:16</p>
              </div>
              <button onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900" aria-label="Chiudi">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[62vh] overflow-auto bg-black p-3">
              <img src={imagePath} alt="Anteprima Story Card PayUp" className="mx-auto max-h-[58vh] w-auto rounded-2xl object-contain" />
            </div>

            <div className="space-y-2 p-4">
              {message && <p className="rounded-2xl bg-zinc-900 p-3 text-xs leading-5 text-zinc-400">{message}</p>}
              <button onClick={shareImage} disabled={working} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-fuchsia-500 font-black text-white disabled:opacity-50">
                <Share2 size={18} /> {working ? "PREPARO…" : "CONDIVIDI IMMAGINE"}
              </button>
              <button onClick={downloadImage} disabled={working} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-800 font-black text-zinc-200 disabled:opacity-50">
                <Download size={18} /> SALVA IMMAGINE
              </button>
              <a href={imagePath} target="_blank" rel="noreferrer" className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 font-black text-zinc-400">
                <ExternalLink size={17} /> APRI IMMAGINE
              </a>
              <p className="pt-1 text-center text-[11px] leading-5 text-zinc-600">
                Su iPhone: se Instagram non compare nel menu Condividi, salva l'immagine e poi aggiungila manualmente alla Storia.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
