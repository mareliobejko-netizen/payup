"use client";

import { upload } from "@vercel/blob/client";
import { Camera, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { AVATAR_PRESETS } from "@/lib/avatar-system";
import { updateAvatarAction, updatePresetAvatarAction } from "./actions";

export default function AvatarUploader({ userId, username, avatarUrl }: { userId: string; username: string; avatarUrl: string | null }) {
  const [preview, setPreview] = useState(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Scegli una foto valida.");
    if (file.size > 5 * 1024 * 1024) return setError("La foto deve pesare massimo 5 MB.");
    setUploading(true); setError(""); setPreview(URL.createObjectURL(file));
    try {
      const blob = await upload(`avatars/${userId}/${file.name}`, file, { access: "public", handleUploadUrl: "/api/avatar-upload" });
      await updateAvatarAction(blob.url);
    } catch (err) {
      console.error(err); setError("Non sono riuscito a caricare la foto."); setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-lime-400 text-black ring-2 ring-lime-400/20">
          {preview ? <img src={preview} alt={`Avatar di ${username}`} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-3xl font-black">{username[0]?.toUpperCase()}</div>}
          {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white"><Loader2 className="animate-spin" /></div>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black">Il tuo avatar</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">Scegli un teschio PayUp oppure usa una tua foto.</p>
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-zinc-800 px-4 py-2.5 text-sm font-black text-white">
            <Camera size={17} /> CARICA FOTO
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => handleFile(e.target.files?.[0])} />
          </label>
          {error && <p className="mt-2 text-xs font-bold text-red-400">{error}</p>}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between gap-3">
          <div><p className="font-black">10 teschi base 💀</p><p className="mt-1 text-xs text-zinc-500">Disponibili subito per tutti.</p></div>
          <span className="rounded-full bg-lime-400/10 px-3 py-1 text-[10px] font-black text-lime-300">BASE PACK</span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {AVATAR_PRESETS.map((avatar) => (
            <form action={updatePresetAvatarAction} key={avatar.id}>
              <input type="hidden" name="avatarUrl" value={avatar.url} />
              <button type="submit" onClick={() => setPreview(avatar.url)} className={`w-full rounded-2xl border-2 p-1 transition active:scale-95 ${preview === avatar.url ? "border-lime-400 bg-lime-400/10" : "border-transparent bg-zinc-950"}`} title={avatar.label}>
                <img src={avatar.url} alt={avatar.label} className="aspect-square w-full rounded-xl object-cover" />
                <span className="mt-1 block truncate text-[8px] font-black text-zinc-500">{avatar.label}</span>
              </button>
            </form>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-zinc-950 p-4">
        <p className="text-xs font-black uppercase tracking-wider text-amber-300">🔒 In arrivo</p>
        <p className="mt-2 text-sm font-bold">Avatar stagionali e sbloccabili</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">Halloween, Natale, Gold e avatar ottenuti con achievement e stagioni.</p>
      </div>
    </div>
  );
}
