"use client";

export default function ProofMedia({
  src,
  type,
  alt = "Prova",
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

  if (type === "video") {
    return (
      <div className="flex w-full items-center justify-center overflow-hidden bg-black">
        <video
          src={displaySrc}
          controls
          playsInline
          preload="metadata"
          className="block h-auto max-h-[72dvh] w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center overflow-hidden bg-black">
      <img
        src={displaySrc}
        alt={alt}
        draggable={false}
        loading="lazy"
        className="block h-auto max-h-[72dvh] w-full select-none object-contain"
      />
    </div>
  );
}
