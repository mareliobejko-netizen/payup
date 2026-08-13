"use client";

import { Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProofMedia({
  src,
  type,
  alt = "Prova",
  className = "aspect-[4/3] w-full object-cover",
  proofId,
}: {
  src: string;
  type?: string | null;
  alt?: string;
  className?: string;
  proofId?: string;
}) {
  const displaySrc = src.includes(".private.blob.") && proofId
    ? `/api/private-media?proofId=${encodeURIComponent(proofId)}`
    : src;

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (type === "video") {
    return (
      <video
        src={displaySrc}
        controls
        playsInline
        preload="metadata"
        className={className}
      />
    );
  }

  return (
    <>
      <div className="relative w-full overflow-hidden bg-black">
        <img
          src={displaySrc}
          alt={alt}
          className={className}
          draggable={false}
        />

        <button
          type="button"
          aria-label="Ingrandisci immagine"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen(true);
          }}
          className="absolute bottom-3 right-3 z-10 flex h-11 w-11 touch-manipulation items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur active:scale-95"
        >
          <Maximize2 size={19} />
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Immagine ingrandita"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))]"
          style={{ touchAction: "manipulation", overscrollBehavior: "contain" }}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="Chiudi immagine"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
            }}
            className="absolute right-4 z-[210] flex h-12 w-12 touch-manipulation items-center justify-center rounded-full bg-white text-black shadow-xl active:scale-95"
            style={{ top: "max(16px, env(safe-area-inset-top))" }}
          >
            <X size={25} strokeWidth={3} />
          </button>

          <div
            className="flex h-full w-full items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={displaySrc}
              alt={alt}
              draggable={false}
              className="max-h-[calc(100dvh-5rem)] max-w-full select-none object-contain"
              style={{ touchAction: "pan-x pan-y" }}
            />
          </div>
        </div>
      )}
    </>
  );
}
