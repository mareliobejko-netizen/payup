import Link from "next/link";
import { ArrowLeft, Banknote, Skull, Trophy } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { groupMembers, users } from "@/db/schema";
import { requirePayupContext } from "@/lib/auth";
import { createPenalty } from "./actions";

export const dynamic = "force-dynamic";

export default async function AddPenaltyPage() {
  const { group } = await requirePayupContext();
  const members = await db.select({ id: users.id, username: users.username, avatarUrl: users.avatarUrl })
    .from(groupMembers).innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, group.groupId));

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 pb-10">
        <header className="flex items-center gap-4 border-b border-white/5 px-5 py-5">
          <Link href="/" className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900"><ArrowLeft size={20} /></Link>
          <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">{group.name}</p><h1 className="text-xl font-black">Nuova sconfitta 💀</h1></div>
        </header>

        <form action={createPenalty} className="space-y-7 px-5 py-6">
          <section>
            <div className="mb-3 flex items-center gap-2"><Skull size={18} className="text-red-400" /><label className="text-sm font-black uppercase tracking-wide">Chi ha perso?</label></div>
            <div className="grid grid-cols-2 gap-3">
              {members.map((member) => <label key={member.id} className="cursor-pointer"><input type="radio" name="assignedTo" value={member.id} required className="peer sr-only" /><div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 transition peer-checked:border-lime-400 peer-checked:bg-lime-400/10"><div className="mb-3 h-11 w-11 overflow-hidden rounded-full bg-zinc-800 text-lg font-black">{member.avatarUrl ? <img src={member.avatarUrl} alt={member.username} className="h-full w-full object-cover"/> : <div className="flex h-full w-full items-center justify-center">{member.username.charAt(0).toUpperCase()}</div>}</div><p className="font-black">{member.username}</p><p className="mt-1 text-xs text-zinc-500">Seleziona</p></div></label>)}
            </div>
          </section>

          <section><div className="mb-3 flex items-center gap-2"><Trophy size={18} className="text-lime-400" /><label htmlFor="title" className="text-sm font-black uppercase tracking-wide">Cosa deve fare?</label></div><input id="title" name="title" required maxLength={200} placeholder="Es. Offrire una pizza al gruppo" className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 font-semibold outline-none placeholder:text-zinc-600 focus:border-lime-400" /></section>

          <section><div className="mb-3 flex items-center gap-2"><Banknote size={18} className="text-emerald-400" /><label htmlFor="amount" className="text-sm font-black uppercase tracking-wide">Importo</label><span className="text-xs text-zinc-600">opzionale</span></div><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-zinc-500">€</span><input id="amount" name="amount" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0,00" className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-900 pl-11 pr-4 text-lg font-black outline-none placeholder:text-zinc-700 focus:border-lime-400" /></div></section>

          <section><label htmlFor="description" className="mb-3 block text-sm font-black uppercase tracking-wide">Note <span className="ml-2 text-xs font-normal normal-case text-zinc-600">opzionale</span></label><textarea id="description" name="description" rows={4} placeholder="Aggiungi dettagli sulla penitenza..." className="w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 p-4 font-medium outline-none placeholder:text-zinc-600 focus:border-lime-400" /></section>

          <button type="submit" className="flex h-16 w-full items-center justify-center gap-2 rounded-3xl bg-lime-400 text-lg font-black text-black"><Skull size={22} />ASSEGNA PENITENZA</button>
        </form>
      </div>
    </main>
  );
}
