"use client";

import { Camera, Check, Film, Globe2, Loader2, Lock, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import { submitProof } from "./actions";

type Props = { penaltyId: string };

export default function ProofUploader({ penaltyId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function selectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setError("");
    if (!selected.type.startsWith("image/") && !selected.type.startsWith("video/")) return setError("Puoi caricare solo foto o video.");
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected); setPreview(URL.createObjectURL(selected));
  }

  async function handleSubmit() {
    if (!file) return setError("Prima scegli una foto o un video.");
    setUploading(true); setError("");
    try {
      const blob = await upload(`proofs/${penaltyId}/${file.name}`, file, { access: "public", handleUploadUrl: "/api/proof-upload" });
      await submitProof({ penaltyId, mediaUrl: blob.url, mediaType: file.type.startsWith("video/") ? "video" : "image", caption, isPublic });
    } catch (err) { console.error(err); setError("Non sono riuscito a caricare la prova. Riprova."); setUploading(false); }
  }

  return <div className="space-y-4">
    {!file ? <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-zinc-900/60 px-6 py-10 hover:border-lime-400/50"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-400/10 text-lime-400"><Camera size={28}/></div><p className="mt-4 text-lg font-black">Carica la prova</p><p className="mt-2 text-center text-sm text-zinc-500">Foto o video. Dopo saranno gli amici a decidere.</p><div className="mt-5 flex gap-2"><span className="rounded-full bg-zinc-800 px-3 py-2 text-xs font-bold">📸 Foto</span><span className="rounded-full bg-zinc-800 px-3 py-2 text-xs font-bold">🎥 Video</span></div><input type="file" accept="image/*,video/*" onChange={selectFile} className="hidden"/></label> : <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900"><div className="relative">{file.type.startsWith("video/") ? <video src={preview ?? ""} controls className="aspect-[4/3] w-full object-cover"/> : <img src={preview ?? ""} alt="Anteprima" className="aspect-[4/3] w-full object-cover"/>}<button type="button" onClick={() => { if (preview) URL.revokeObjectURL(preview); setFile(null); setPreview(null); }} className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/70"><X size={18}/></button></div><div className="flex items-center gap-2 p-4 text-sm font-bold text-lime-400"><Check size={17}/>Prova pronta</div></div>}
    <textarea value={caption} onChange={(e)=>setCaption(e.target.value)} maxLength={250} rows={3} placeholder='"Ve l’avevo detto 😂"' className="w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 p-4 outline-none focus:border-lime-400"/>
    <button type="button" onClick={()=>setIsPublic(!isPublic)} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left ${isPublic ? "border-fuchsia-400/40 bg-fuchsia-400/10" : "border-white/10 bg-zinc-900"}`}><div className={`flex h-11 w-11 items-center justify-center rounded-full ${isPublic ? "bg-fuchsia-400 text-black" : "bg-zinc-800 text-zinc-400"}`}>{isPublic ? <Globe2 size={20}/> : <Lock size={20}/>}</div><div className="flex-1"><p className="font-black">{isPublic ? "Pubblica su The Wall" : "Solo nel gruppo"}</p><p className="mt-1 text-xs text-zinc-500">{isPublic ? "Apparirà nel feed solo dopo l'approvazione del gruppo." : "La prova resta visibile solo agli amici del gruppo."}</p></div><div className={`h-6 w-11 rounded-full p-1 ${isPublic ? "bg-fuchsia-400" : "bg-zinc-700"}`}><div className={`h-4 w-4 rounded-full bg-white transition ${isPublic ? "translate-x-5" : ""}`}/></div></button>
    {error && <div className="rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-400">{error}</div>}
    <button type="button" onClick={handleSubmit} disabled={!file || uploading} className="flex h-16 w-full items-center justify-center gap-3 rounded-3xl bg-lime-400 text-lg font-black text-black disabled:opacity-40">{uploading ? <><Loader2 size={22} className="animate-spin"/>CARICAMENTO...</> : <><Upload size={22}/>INVIA LA PROVA</>}</button>
  </div>;
}
