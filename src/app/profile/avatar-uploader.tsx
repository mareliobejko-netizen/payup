"use client";

import { upload } from "@vercel/blob/client";
import { Camera, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { updateAvatarAction } from "./actions";

export default function AvatarUploader({ userId, username, avatarUrl }: { userId: string; username: string; avatarUrl: string | null }) {
  const [preview, setPreview] = useState(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Scegli una foto valida.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La foto deve pesare massimo 5 MB.");
      return;
    }

    setUploading(true);
    setError("");
    setPreview(URL.createObjectURL(file));

    try {
      const blob = await upload(`avatars/${userId}/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/avatar-upload",
      });
      await updateAvatarAction(blob.url);
    } catch (err) {
      console.error(err);
      setError("Non sono riuscito a caricare la foto.");
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-lime-400 text-black">
        {preview ? (
          <img src={preview} alt={`Avatar di ${username}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-black">{username[0]?.toUpperCase()}</div>
        )}
        {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white"><Loader2 className="animate-spin" /></div>}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-black">Foto profilo</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">JPG, PNG, WEBP o HEIC · max 5 MB</p>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-zinc-800 px-4 py-2.5 text-sm font-black text-white">
          {preview ? <Camera size={17} /> : <Upload size={17} />}
          {preview ? "CAMBIA FOTO" : "CARICA FOTO"}
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>
        {error && <p className="mt-2 text-xs font-bold text-red-400">{error}</p>}
      </div>
    </div>
  );
}
