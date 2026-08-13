import { KeyRound, Plus, Skull, UsersRound } from "lucide-react";
import { getMemberships, requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createGroup, joinGroup } from "./actions";

export default async function OnboardingPage() {
  const user = await requireUser();
  const memberships = await getMemberships(user.id);
  if (memberships.length) redirect("/");
  return <main className="min-h-screen bg-zinc-950 px-5 py-10 text-white"><div className="mx-auto max-w-md">
    <div className="text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-400 text-black"><Skull size={30}/></div><h1 className="mt-5 text-3xl font-black">Ciao {user.username} 👋</h1><p className="mt-2 text-zinc-500">Crea il primo gruppo o entra con il codice degli amici.</p></div>
    <div className="mt-8 space-y-4">
      <form action={createGroup} className="rounded-3xl border border-white/10 bg-zinc-900 p-5"><div className="flex items-center gap-2 text-lime-400"><Plus size={20}/><h2 className="font-black text-white">Crea un gruppo</h2></div><input name="name" required placeholder="Es. I Disgraziati" className="mt-4 h-14 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 outline-none focus:border-lime-400"/><button className="mt-3 h-14 w-full rounded-2xl bg-lime-400 font-black text-black">CREA GRUPPO</button></form>
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-700"><div className="h-px flex-1 bg-white/5"/>oppure<div className="h-px flex-1 bg-white/5"/></div>
      <form action={joinGroup} className="rounded-3xl border border-white/10 bg-zinc-900 p-5"><div className="flex items-center gap-2 text-amber-300"><KeyRound size={20}/><h2 className="font-black text-white">Entra in un gruppo</h2></div><input name="inviteCode" required placeholder="CODICE INVITO" className="mt-4 h-14 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 font-mono uppercase tracking-widest outline-none focus:border-amber-300"/><button className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-800 font-black"><UsersRound size={18}/>ENTRA NEL GRUPPO</button></form>
    </div>
  </div></main>;
}
