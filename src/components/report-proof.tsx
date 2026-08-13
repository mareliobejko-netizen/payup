"use client";

import { Flag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { reportProofAction } from "@/app/report/actions";

export default function ReportProof({ proofId, back }: { proofId: string; back: string }) {
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-10 touch-manipulation items-center gap-2 rounded-full bg-zinc-800 px-3 py-2 text-xs font-black text-zinc-300 active:scale-95"
      >
        <Flag size={15} /> Segnala
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Segnala contenuto"
          className="fixed inset-0 z-[230] flex items-end justify-center bg-black/80 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))] sm:items-center"
          style={{ touchAction: "manipulation", overscrollBehavior: "contain" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-950 p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-red-300">The Wall</p>
                <h3 className="mt-1 text-xl font-black">Segnala contenuto</h3>
              </div>
              <button
                type="button"
                aria-label="Chiudi segnalazione"
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-zinc-800 active:scale-95"
              >
                <X size={19} />
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              La segnalazione viene inviata agli admin di PayUp. Il post non viene cancellato automaticamente.
            </p>

            <form action={reportProofAction} className="mt-5 space-y-4">
              <input type="hidden" name="proofId" value={proofId} />
              <input type="hidden" name="back" value={back} />

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-zinc-500">Motivo</span>
                <select
                  name="reason"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 text-base outline-none focus:border-red-400"
                >
                  <option value="spam">Spam</option>
                  <option value="offensive">Contenuto offensivo</option>
                  <option value="privacy">Problema di privacy</option>
                  <option value="dangerous">Contenuto pericoloso</option>
                  <option value="other">Altro</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-zinc-500">Dettagli facoltativi</span>
                <textarea
                  name="note"
                  maxLength={500}
                  rows={4}
                  placeholder="Spiega brevemente il problema…"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 p-4 text-base outline-none focus:border-red-400"
                />
              </label>

              <button className="h-14 w-full touch-manipulation rounded-2xl bg-red-500 font-black text-white active:scale-[.98]">
                INVIA SEGNALAZIONE
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
