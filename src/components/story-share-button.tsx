"use client";

import { Download, ImageDown, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";

type StoryKind = "challenge" | "wall";

type StoryShareButtonProps = {
  kind: StoryKind;
  username: string;
  title: string;
  groupName: string;
  likes?: number;
  filename?: string;
};

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function buildStoryBlob({
  kind,
  username,
  title,
  groupName,
  likes = 0,
}: Omit<StoryShareButtonProps, "filename">): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non disponibile");

  const lime = "#a3e635";
  const pink = "#e879f9";
  const white = "#ffffff";
  const muted = "#a1a1aa";
  const bg = "#09090b";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1920);

  const gradient = ctx.createRadialGradient(180, 470, 10, 180, 470, 720);
  gradient.addColorStop(0, kind === "wall" ? "rgba(217,70,239,.22)" : "rgba(163,230,53,.18)");
  gradient.addColorStop(1, "rgba(9,9,11,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1920);

  ctx.fillStyle = kind === "wall" ? pink : lime;
  roundRect(ctx, 76, 82, 116, 116, 34);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '700 58px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = "#09090b";
  ctx.fillText(kind === "wall" ? "🔥" : "💀", 134, 140);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = '900 44px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = kind === "wall" ? pink : lime;
  ctx.fillText(kind === "wall" ? "THE WALL" : "PAYUP", 224, 153);

  ctx.font = '900 46px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = kind === "wall" ? lime : "#f87171";
  ctx.fillText(kind === "wall" ? "✅ FATTO PER DAVVERO" : `${username.toUpperCase()} HA PERSO 😈`, 76, 430);

  ctx.font = '900 82px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = white;
  const lines = wrapText(ctx, title, 928).slice(0, 6);
  let y = 565;
  for (const line of lines) {
    ctx.fillText(line, 76, y);
    y += 98;
  }

  ctx.fillStyle = "rgba(255,255,255,.06)";
  roundRect(ctx, 76, Math.min(y + 32, 1290), 928, 220, 42);
  ctx.fill();

  const infoY = Math.min(y + 112, 1370);
  ctx.font = '800 35px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = white;
  ctx.fillText(`@${username}`, 116, infoY);
  ctx.font = '600 30px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = muted;
  ctx.fillText(groupName, 116, infoY + 52);

  if (kind === "wall") {
    ctx.font = '800 31px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.fillStyle = "#f9a8d4";
    ctx.fillText(`❤️ ${likes} like`, 116, infoY + 104);
  } else {
    ctx.font = '800 31px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.fillStyle = lime;
    ctx.fillText("Chi perde, paga. E deve provarlo.", 116, infoY + 104);
  }

  ctx.font = '900 36px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = kind === "wall" ? pink : lime;
  ctx.fillText(kind === "wall" ? "Guarda la prova su PayUp" : "Guarda la sfida su PayUp", 76, 1730);
  ctx.font = '600 27px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = "#71717a";
  ctx.fillText("payup · il social delle penitenze tra amici", 76, 1780);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Impossibile generare PNG")), "image/png", 1);
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export default function StoryShareButton(props: StoryShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storyBlob, setStoryBlob] = useState<Blob | null>(null);
  const [message, setMessage] = useState("");

  const filename = props.filename || `payup-${props.username}-story.png`;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function prepare() {
    setWorking(true);
    setMessage("");
    try {
      const blob = await buildStoryBlob(props);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setStoryBlob(blob);
      setPreviewUrl(url);
      setOpen(true);
    } catch (error) {
      console.error(error);
      setMessage("Non sono riuscito a generare la Story Card.");
      setOpen(true);
    } finally {
      setWorking(false);
    }
  }

  async function shareImage() {
    if (!storyBlob) return;
    const file = new File([storyBlob], filename, { type: "image/png" });
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ files: [file], title: "PayUp" });
        setMessage("Story Card pronta per la condivisione ✓");
        return;
      }
      setMessage("La condivisione file non è disponibile: usa Salva immagine.");
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        console.error(error);
        setMessage("Non riesco ad aprire la condivisione. Usa Salva immagine.");
      }
    }
  }

  function downloadImage() {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setMessage("Story Card salvata ✓");
  }

  return (
    <>
      <button
        type="button"
        onClick={prepare}
        disabled={working}
        className="flex items-center gap-2 rounded-full bg-fuchsia-500/10 px-4 py-2 text-sm font-black text-fuchsia-300 disabled:opacity-50"
      >
        <ImageDown size={17} /> {working ? "GENERO…" : "Story Card"}
      </button>

      {open && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/90 p-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[.22em] text-fuchsia-300">Story Card</p>
                <p className="text-sm font-bold text-zinc-300">PNG 1080 × 1920</p>
              </div>
              <button onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900" aria-label="Chiudi">
                <X size={20} />
              </button>
            </div>

            <div className="flex max-h-[60dvh] items-center justify-center overflow-auto bg-black p-3">
              {previewUrl ? (
                <img src={previewUrl} alt="Anteprima Story Card PayUp" className="max-h-[56dvh] w-auto rounded-2xl object-contain" />
              ) : (
                <div className="py-16 text-sm font-bold text-zinc-500">Anteprima non disponibile</div>
              )}
            </div>

            <div className="space-y-2 p-4">
              {message && <p className="rounded-2xl bg-zinc-900 p-3 text-xs leading-5 text-zinc-400">{message}</p>}
              <button onClick={shareImage} disabled={!storyBlob} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-fuchsia-500 font-black text-white disabled:opacity-40">
                <Share2 size={18} /> CONDIVIDI IMMAGINE
              </button>
              <button onClick={downloadImage} disabled={!previewUrl} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-800 font-black text-zinc-200 disabled:opacity-40">
                <Download size={18} /> SALVA IMMAGINE
              </button>
              <p className="pt-1 text-center text-[11px] leading-5 text-zinc-600">
                Su iPhone, se Instagram non compare in Condividi, salva la PNG e aggiungila manualmente alla Storia.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
