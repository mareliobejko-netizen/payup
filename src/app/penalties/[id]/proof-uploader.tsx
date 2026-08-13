"use client";

import { Camera, Check, Film, GalleryHorizontal, Globe2, Loader2, Lock, Upload, Video, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { submitProof } from "./actions";

type Props = { penaltyId: string; wallEnabled?: boolean; defaultPublic?: boolean };

export default function ProofUploader({ penaltyId, wallEnabled=true, defaultPublic=false }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(defaultPublic);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function chooseFile(selected?: File) {
    if (!selected) return;
    setError("");
    if (!selected.type.startsWith("image/") && !selected.type.startsWith("video/")) {
      setError("Puoi usare solo foto o video.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (galleryRef.current) galleryRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
    if (videoRef.current) videoRef.current.value = "";
  }

  async function handleSubmit() {
    if (!file) return setError("Prima scegli, scatta o registra una prova.");
    setUploading(true);
    setError("");
    try {
      const safeName = file.name || `${file.type.startsWith("video/") ? "video" : "photo"}-${Date.now()}`;
      const blob = await upload(`proofs/${penaltyId}/${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/proof-upload",
      });
      await submitProof({
        penaltyId,
        mediaUrl: blob.url,
        mediaType: file.type.startsWith("video/") ? "video" : "image",
        caption,
        isPublic,
      });
    } catch (err) {
      console.error(err);
      setError("Non sono riuscito a caricare la prova. Riprova.");
      setUploading(false);
    }
  }

  return <div className="space-y-4">
    {!file ? <div className="space-y-3">
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-5">
        <div className="mb-4 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-400/10 text-lime-400"><Camera size={23}/></div><div><p className="font-black">Come vuoi creare la prova?</p><p className="mt-1 text-xs text-zinc-500">Puoi usare un file già esistente oppure la fotocamera.</p></div></div>
        <div className="grid gap-3">
          <button type="button" onClick={() => galleryRef.current?.click()} className="flex h-14 items-center gap-3 rounded-2xl bg-zinc-800 px-4 text-left font-black"><GalleryHorizontal size={20} className="text-lime-400"/><span className="flex-1">Scegli dalla galleria</span><span className="text-xs font-bold text-zinc-500">Foto / video</span></button>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => cameraRef.current?.click()} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-lime-400 font-black text-black"><Camera size={24}/><span className="text-sm">Scatta foto</span></button>
            <button type="button" onClick={() => videoRef.current?.click()} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-fuchsia-400 font-black text-black"><Video size={24}/><span className="text-sm">Registra video</span></button>
          </div>
        </div>
      </div>
      <input ref={galleryRef} type="file" accept="image/*,video/*" onChange={(e)=>chooseFile(e.target.files?.[0])} className="hidden"/>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={(e)=>chooseFile(e.target.files?.[0])} className="hidden"/>
      <input ref={videoRef} type="file" accept="video/*" capture="environment" onChange={(e)=>chooseFile(e.target.files?.[0])} className="hidden"/>
      <p className="px-2 text-center text-[11px] leading-5 text-zinc-600">Su iPhone e Android i pulsanti fotocamera aprono direttamente camera o videocamera. Il comportamento può variare in base al browser.</p>
    </div> : <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900"><div className="relative">{file.type.startsWith("video/") ? <video src={preview ?? ""} controls playsInline className="aspect-[4/3] w-full object-cover"/> : <img src={preview ?? ""} alt="Anteprima" className="aspect-[4/3] w-full object-cover"/>}<button type="button" onClick={clearFile} disabled={uploading} className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/70"><X size={18}/></button></div><div className="flex items-center gap-2 p-4 text-sm font-bold text-lime-400"><Check size={17}/>Prova pronta</div></div>}

    <textarea value={caption} onChange={(e)=>setCaption(e.target.value)} maxLength={250} rows={3} placeholder='Aggiungi una frase… tipo “Ve l’avevo detto 😂”' className="w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 p-4 outline-none placeholder:text-zinc-600 focus:border-lime-400"/>

    {wallEnabled && <button type="button" onClick={()=>setIsPublic(!isPublic)} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left ${isPublic ? "border-fuchsia-400/40 bg-fuchsia-400/10" : "border-white/10 bg-zinc-900"}`}><div className={`flex h-11 w-11 items-center justify-center rounded-full ${isPublic ? "bg-fuchsia-400 text-black" : "bg-zinc-800 text-zinc-400"}`}>{isPublic ? <Globe2 size={20}/> : <Lock size={20}/>}</div><div className="flex-1"><p className="font-black">{isPublic ? "Pubblica su The Wall" : "Solo nel gruppo"}</p><p className="mt-1 text-xs text-zinc-500">{isPublic ? "Andrà nel feed solo dopo l'approvazione del gruppo." : "Resta visibile solo ai membri del gruppo."}</p></div><div className={`h-6 w-11 rounded-full p-1 ${isPublic ? "bg-fuchsia-400" : "bg-zinc-700"}`}><div className={`h-4 w-4 rounded-full bg-white transition ${isPublic ? "translate-x-5" : ""}`}/></div></button>}

    {error && <div className="rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-400">{error}</div>}
    <button type="button" onClick={handleSubmit} disabled={!file || uploading} className="flex h-16 w-full items-center justify-center gap-3 rounded-3xl bg-lime-400 text-lg font-black text-black disabled:opacity-40">{uploading ? <><Loader2 size={22} className="animate-spin"/>CARICAMENTO...</> : <><Upload size={22}/>INVIA LA PROVA</>}</button>
  </div>;
}
