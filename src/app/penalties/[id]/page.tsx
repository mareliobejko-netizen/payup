import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, Banknote, BadgeCheck, CalendarDays, Camera, Clock3, Pencil, Skull, Trash2 } from "lucide-react";
import ProofMedia from "@/components/proof-media";
import { categoryLabel } from "@/lib/penalties";
import { deletePenalty } from "./edit/actions";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { groupMembers, groups, penalties, proofs, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import ProofUploader from "./proof-uploader";
import ConfirmButton from "@/components/confirm-button";
import PenaltySharePanel from "@/components/penalty-share-panel";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export default async function PenaltyPage({ params }: Props) {
  const { id } = await params;
  const currentUser = await requireUser();

  const [penalty] = await db.select({
    id: penalties.id,
    groupId: penalties.groupId,
    title: penalties.title,
    description: penalties.description,
    amountCents: penalties.amountCents,
    category: penalties.category,
    dueAt: penalties.dueAt,
    createdBy: penalties.createdBy,
    status: penalties.status,
    createdAt: penalties.createdAt,
    completedAt: penalties.completedAt,
    assignedTo: penalties.assignedTo,
    username: users.username,
    avatarUrl: users.avatarUrl,
    wallEnabled: groups.wallEnabled,
    defaultProofPublic: groups.defaultProofPublic,
    publicShare: penalties.publicShare,
  }).from(penalties).innerJoin(users, eq(penalties.assignedTo, users.id))
    .innerJoin(groups, eq(penalties.groupId, groups.id)).where(eq(penalties.id, id)).limit(1);

  if (!penalty) notFound();

  const [membership] = await db.select({ id: groupMembers.id, role: groupMembers.role }).from(groupMembers)
    .where(and(eq(groupMembers.groupId, penalty.groupId), eq(groupMembers.userId, currentUser.id))).limit(1);
  if (!membership) notFound();

  const [proof] = await db.select().from(proofs).where(eq(proofs.penaltyId, penalty.id)).limit(1);
  const isAssignedUser = currentUser.id === penalty.assignedTo;
  const canManage = penalty.status !== "completed" && (penalty.createdBy === currentUser.id || membership.role === "admin");

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 pb-10">
        <header className="flex items-center gap-4 border-b border-white/5 px-5 py-5"><Link href="/" className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900"><ArrowLeft size={20} /></Link><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">PayUp</p><h1 className="text-xl font-black">Dettaglio penitenza</h1></div></header>

        <div className="space-y-6 px-5 py-6">
          <section className="rounded-3xl border border-white/10 bg-zinc-900 p-5"><div className="flex items-center gap-4"><div className="h-16 w-16 overflow-hidden rounded-full bg-red-500/10 text-2xl font-black text-red-400">{penalty.avatarUrl ? <img src={penalty.avatarUrl} alt={penalty.username} className="h-full w-full object-cover"/> : <div className="flex h-full w-full items-center justify-center">{penalty.username.charAt(0).toUpperCase()}</div>}</div><div><p className="text-sm text-zinc-500">Il colpevole</p><p className="text-2xl font-black">{penalty.username}</p></div></div></section>

          <section className="rounded-3xl bg-gradient-to-br from-red-500/10 to-zinc-900 p-5"><div className="mb-4 flex items-center gap-2 text-red-400"><Skull size={20} /><span className="text-xs font-black uppercase tracking-wider">{categoryLabel(penalty.category)}</span></div><h2 className="text-2xl font-black leading-tight">{penalty.title}</h2>{penalty.description && <p className="mt-3 leading-6 text-zinc-400">{penalty.description}</p>}{penalty.amountCents !== null && <div className="mt-5 flex items-center gap-3 rounded-2xl bg-black/20 p-4"><Banknote className="text-emerald-400" /><div><p className="text-xs font-bold uppercase text-zinc-500">Importo</p><p className="text-xl font-black text-emerald-400">{formatMoney(penalty.amountCents)}</p></div></div>}</section>

          <section className="grid grid-cols-2 gap-3"><InfoCard icon={<CalendarDays size={18} />} title="Assegnata" value={formatDate(penalty.createdAt)} /><InfoCard icon={<Clock3 size={18} />} title="Stato" value={statusLabel(penalty.status)} />{penalty.dueAt && <div className="col-span-2"><InfoCard icon={<CalendarDays size={18}/>} title="Scadenza" value={formatDateTime(penalty.dueAt)}/></div>}</section>

          <PenaltySharePanel penaltyId={penalty.id} isPublic={penalty.publicShare} username={penalty.username} title={penalty.title} />{canManage && <section className="grid grid-cols-2 gap-3"><Link href={`/penalties/${penalty.id}/edit`} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white font-black text-black"><Pencil size={17}/>MODIFICA</Link><form action={deletePenalty}><input type="hidden" name="id" value={penalty.id}/><ConfirmButton message="Vuoi davvero cancellare questa penitenza? L’operazione non si può annullare." className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 font-black text-red-400"><Trash2 size={17}/>CANCELLA</ConfirmButton></form></section>}

          {penalty.status === "pending" && isAssignedUser && <section><div className="mb-4"><div className="flex items-center gap-2"><Camera size={20} className="text-lime-400" /><h3 className="text-lg font-black">L&apos;hai fatto?</h3></div><p className="mt-2 text-sm leading-6 text-zinc-500">Carica foto o video e lascia decidere al gruppo. 😈</p></div><ProofUploader penaltyId={penalty.id} wallEnabled={penalty.wallEnabled} defaultPublic={penalty.defaultProofPublic} /></section>}
          {penalty.status === "pending" && !isAssignedUser && <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6 text-center"><p className="text-4xl">👀</p><p className="mt-3 font-black">Aspettiamo {penalty.username}</p><p className="mt-2 text-sm text-zinc-500">Solo chi ha ricevuto la penitenza può caricare la prova.</p></section>}
          {penalty.status === "verifying" && proof && <ProofCard proof={proof} status="verifying" />}
          {penalty.status === "completed" && proof && <section className="space-y-4"><div className="rounded-3xl border border-lime-400/20 bg-lime-400/10 p-6 text-center"><BadgeCheck className="mx-auto text-lime-400" size={42} /><p className="mt-3 text-2xl font-black text-lime-300">FATTO PER DAVVERO</p><p className="mt-2 text-sm text-zinc-400">Il gruppo ha confermato la prova. Debito chiuso. ✅</p></div><ProofCard proof={proof} status="completed" /></section>}
        </div>
      </div>
    </main>
  );
}

function ProofCard({ proof, status }: { proof: typeof proofs.$inferSelect; status: "verifying" | "completed" }) { return <section className={`overflow-hidden rounded-3xl border bg-zinc-900 ${status === "completed" ? "border-lime-400/20" : "border-amber-400/20"}`}><div className="p-5"><span className={`rounded-full px-3 py-2 text-xs font-black uppercase ${status === "completed" ? "bg-lime-400/10 text-lime-300" : "bg-amber-400/10 text-amber-300"}`}>{status === "completed" ? "✅ Approvata" : "⏳ Da verificare"}</span><h3 className="mt-4 text-xl font-black">Prova inviata</h3></div><ProofMedia src={proof.mediaUrl} type={proof.mediaType} alt="Prova" proofId={proof.id}/>{proof.caption && <div className="p-5 text-sm text-zinc-300">“{proof.caption}”</div>}</section>; }
function InfoCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) { return <div className="rounded-2xl bg-zinc-900 p-4"><div className="text-lime-400">{icon}</div><p className="mt-3 text-xs font-bold uppercase text-zinc-600">{title}</p><p className="mt-1 text-sm font-black">{value}</p></div>; }
function formatMoney(amountCents: number) { return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amountCents / 100); }
function formatDate(date: Date) { return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(date); }
function formatDateTime(date: Date) { return new Intl.DateTimeFormat("it-IT", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }).format(date); }
function statusLabel(status: string) { return status === "pending" ? "🔴 Da fare" : status === "verifying" ? "🟡 Da verificare" : status === "completed" ? "🟢 Completata" : status; }
