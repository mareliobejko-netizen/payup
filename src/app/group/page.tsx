import Link from "next/link";
import { ArrowLeft, Check, Copy, KeyRound, Plus, UsersRound } from "lucide-react";
import { getActiveGroup, getMemberships, requireUser } from "@/lib/auth";
import { createGroup, joinGroup, switchGroup } from "./actions";

export default async function GroupPage() {
  const user = await requireUser();
  const memberships = await getMemberships(user.id);
  const active = await getActiveGroup(user.id);
  return <main className="min-h-screen bg-zinc-950 text-white"><div className="mx-auto min-h-screen max-w-md border-x border-white/5 px-5 py-5">
    <div className="flex items-center gap-3"><Link href="/" className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900"><ArrowLeft size={20}/></Link><div><p className="text-xs font-black uppercase tracking-[.25em] text-lime-400">PayUp</p><h1 className="text-xl font-black">I tuoi gruppi</h1></div></div>
    <div className="mt-7 space-y-3">{memberships.map((item) => <form action={switchGroup} key={item.groupId}><input type="hidden" name="groupId" value={item.groupId}/><button className={`flex w-full items-center gap-4 rounded-3xl border p-4 text-left ${active?.groupId === item.groupId ? "border-lime-400/40 bg-lime-400/10" : "border-white/5 bg-zinc-900"}`}><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800"><UsersRound size={22}/></div><div className="flex-1"><p className="font-black">{item.name}</p><p className="mt-1 text-xs text-zinc-500">Codice: <span className="font-mono text-zinc-300">{item.inviteCode}</span></p></div>{active?.groupId === item.groupId && <Check className="text-lime-400"/>}</button></form>)}</div>
    <div className="mt-8 grid gap-4">
      <form action={createGroup} className="rounded-3xl bg-zinc-900 p-5"><h2 className="flex items-center gap-2 font-black"><Plus className="text-lime-400" size={18}/>Nuovo gruppo</h2><input name="name" required placeholder="Nome gruppo" className="mt-3 h-12 w-full rounded-2xl bg-zinc-950 px-4 outline-none focus:ring-1 focus:ring-lime-400"/><button className="mt-3 h-12 w-full rounded-2xl bg-lime-400 font-black text-black">CREA</button></form>
      <form action={joinGroup} className="rounded-3xl bg-zinc-900 p-5"><h2 className="flex items-center gap-2 font-black"><KeyRound className="text-amber-300" size={18}/>Entra con codice</h2><input name="inviteCode" required placeholder="CODICE" className="mt-3 h-12 w-full rounded-2xl bg-zinc-950 px-4 font-mono uppercase outline-none focus:ring-1 focus:ring-amber-300"/><button className="mt-3 h-12 w-full rounded-2xl bg-zinc-800 font-black">ENTRA</button></form>
    </div>
    {active && <div className="mt-5 rounded-2xl border border-white/5 p-4 text-sm text-zinc-500"><Copy size={15} className="mr-2 inline"/>Condividi con gli amici il codice <span className="font-mono font-black text-white">{active.inviteCode}</span></div>}
  </div></main>;
}
