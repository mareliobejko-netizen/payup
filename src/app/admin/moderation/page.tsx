import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Flag, History, ShieldCheck, UserCog, Ban, Archive } from "lucide-react";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { penalties, proofReports, proofs, users } from "@/db/schema";
import { requirePayUpAdmin } from "@/lib/auth";
import ProofMedia from "@/components/proof-media";
import { dismissReportsAction, hideProofAction, restoreProofAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ModerationPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const admin = await requirePayUpAdmin();
  const { success } = await searchParams;
  const rows = await db
    .select({
      proofId: proofs.id,
      userId: users.id,
      mediaUrl: proofs.mediaUrl,
      mediaType: proofs.mediaType,
      isHidden: proofs.isHidden,
      title: penalties.title,
      username: users.username,
      bannedUntil: users.bannedUntil,
      reports: sql<number>`count(${proofReports.id})`,
      latest: sql<Date>`max(${proofReports.createdAt})`,
    })
    .from(proofReports)
    .innerJoin(proofs, eq(proofReports.proofId, proofs.id))
    .innerJoin(penalties, eq(proofs.penaltyId, penalties.id))
    .innerJoin(users, eq(proofs.uploadedBy, users.id))
    .where(eq(proofReports.status, "open"))
    .groupBy(proofs.id, penalties.title, users.id)
    .orderBy(desc(sql`max(${proofReports.createdAt})`));

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-md p-5 pb-12">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900"><ArrowLeft size={20}/></Link>
          <div>
            <p className="text-xs font-black uppercase tracking-[.25em] text-red-300">PayUp Admin</p>
            <h1 className="text-xl font-black">Moderazione The Wall</h1>
          </div>
        </div>

        {success && <div className="mt-5 rounded-2xl bg-lime-400/10 p-3 text-sm font-bold text-lime-300">✓ {success}</div>}

        <section className="mt-6 rounded-3xl border border-red-400/15 bg-gradient-to-br from-red-500/10 to-zinc-900 p-5">
          <div className="flex items-center gap-2"><ShieldCheck className="text-red-300" size={20}/><p className="font-black">Come funziona la moderazione?</p></div>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Se un utente segnala un post su The Wall, qui compare una scheda. Tu sei admin globale perché la tua email <b className="text-zinc-200">{admin.email}</b> è presente in <code className="rounded bg-black/30 px-1 text-red-200">PAYUP_ADMIN_EMAILS</code>.</p>
          <div className="mt-4 space-y-3 text-sm">
            <Step n="1" icon={<Flag size={15}/>} text="Controlla il post segnalato e il numero di segnalazioni."/>
            <Step n="2" icon={<EyeOff size={15}/>} text="NASCONDI lo rimuove dal feed pubblico senza cancellare la prova dal gruppo."/>
            <Step n="3" icon={<Archive size={15}/>} text="ARCHIVIA chiude le segnalazioni se il contenuto è accettabile."/>
            <Step n="4" icon={<UserCog size={15}/>} text="STORICO UTENTE mostra tutte le segnalazioni, note admin e sospensioni."/>
            <Step n="5" icon={<Ban size={15}/>} text="Da Storico Utente puoi sospendere 24h, 7 o 30 giorni; le sessioni dell'utente vengono chiuse."/>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-zinc-900 p-4">
          <div className="flex items-center gap-2"><Flag className="text-red-300" size={19}/><p className="font-black">Segnalazioni aperte</p></div>
          <p className="mt-1 text-xs text-zinc-500">{rows.length} contenut{rows.length === 1 ? "o" : "i"} da controllare.</p>
        </section>

        <div className="mt-5 space-y-5">
          {rows.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center"><Flag className="mx-auto text-zinc-600"/><p className="mt-3 font-black">Nessuna segnalazione aperta</p><p className="mt-1 text-sm text-zinc-500">The Wall è tranquillo.</p></div>
          ) : rows.map((r) => (
            <article key={r.proofId} className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div><p className="font-black">@{r.username}</p><p className="text-xs text-zinc-500">{r.title}</p>{r.bannedUntil && r.bannedUntil > new Date() && <p className="mt-1 text-xs font-black text-red-300">⛔ Utente sospeso</p>}</div>
                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-black text-red-300">🚩 {Number(r.reports)}</span>
                </div>
                <Link href={`/admin/moderation/user/${r.userId}`} className="mt-3 flex h-10 items-center justify-center gap-2 rounded-2xl bg-zinc-800 text-xs font-black"><History size={15}/>STORICO UTENTE</Link>
              </div>
              <ProofMedia src={r.mediaUrl} type={r.mediaType} alt={r.title}/>
              <div className="grid grid-cols-2 gap-2 p-4">
                {r.isHidden ? (
                  <form action={restoreProofAction}><input type="hidden" name="proofId" value={r.proofId}/><button className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-lime-400/10 text-xs font-black text-lime-300"><Eye size={16}/>RIPRISTINA</button></form>
                ) : (
                  <form action={hideProofAction}><input type="hidden" name="proofId" value={r.proofId}/><button className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 text-xs font-black text-red-300"><EyeOff size={16}/>NASCONDI</button></form>
                )}
                <form action={dismissReportsAction}><input type="hidden" name="proofId" value={r.proofId}/><button className="h-11 w-full rounded-2xl bg-zinc-800 text-xs font-black">ARCHIVIA</button></form>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

function Step({ n, icon, text }: { n: string; icon: React.ReactNode; text: string }) {
  return <div className="flex gap-3 rounded-2xl bg-black/20 p-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-xs font-black text-red-200">{n}</div><div className="flex gap-2 text-zinc-300"><span className="mt-0.5 text-red-300">{icon}</span><span>{text}</span></div></div>;
}
