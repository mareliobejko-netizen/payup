import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, Check, Copy, Crown, KeyRound, LogOut, Plus, RefreshCw, Settings, Trash2, UsersRound } from "lucide-react";
import { db } from "@/db";
import { groupMembers, groups, users } from "@/db/schema";
import { getActiveGroup, getMemberships, requireUser } from "@/lib/auth";
import { createGroup, joinGroup, leaveGroupAction, regenerateInviteCodeAction, removeMemberAction, renameGroupAction, switchGroup } from "./actions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ error?: string; success?: string }> };

export default async function GroupPage({ searchParams }: Props) {
  const user = await requireUser();
  const memberships = await getMemberships(user.id);
  const active = await getActiveGroup(user.id);
  const params = await searchParams;

  const members = active ? await db.select({ userId: users.id, username: users.username, avatarUrl: users.avatarUrl, role: groupMembers.role, joinedAt: groupMembers.joinedAt, createdBy: groups.createdBy })
    .from(groupMembers).innerJoin(users, eq(groupMembers.userId, users.id)).innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.groupId, active.groupId)) : [];
  const myRole = active ? members.find((m) => m.userId === user.id)?.role : null;
  const isAdmin = myRole === "admin";

  return <main className="min-h-screen bg-zinc-950 text-white"><div className="mx-auto min-h-screen max-w-md border-x border-white/5 px-5 py-5 pb-12">
    <div className="flex items-center gap-3"><Link href="/" className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900"><ArrowLeft size={20}/></Link><div><p className="text-xs font-black uppercase tracking-[.25em] text-lime-400">PayUp</p><h1 className="text-xl font-black">I tuoi gruppi</h1></div></div>

    {params.error && <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">{params.error}</div>}
    {params.success && <div className="mt-5 rounded-2xl border border-lime-400/20 bg-lime-400/10 p-4 text-sm font-bold text-lime-300">✓ {params.success}</div>}

    <div className="mt-7 space-y-3">{memberships.map((item) => <form action={switchGroup} key={item.groupId}><input type="hidden" name="groupId" value={item.groupId}/><button className={`flex w-full items-center gap-4 rounded-3xl border p-4 text-left ${active?.groupId === item.groupId ? "border-lime-400/40 bg-lime-400/10" : "border-white/5 bg-zinc-900"}`}><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800"><UsersRound size={22}/></div><div className="flex-1"><p className="font-black">{item.name}</p><p className="mt-1 text-xs text-zinc-500">Codice: <span className="font-mono text-zinc-300">{item.inviteCode}</span></p></div>{active?.groupId === item.groupId && <Check className="text-lime-400"/>}</button></form>)}</div>

    {active && <>
      <section className="mt-7 rounded-3xl border border-white/5 bg-zinc-900 p-5">
        <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-zinc-500">Gruppo attivo</p><h2 className="mt-1 text-xl font-black">{active.name}</h2></div><span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-black">{members.length} membri</span></div>
        <div className="mt-4 rounded-2xl bg-zinc-950 p-4"><p className="text-xs font-bold uppercase text-zinc-600">Codice invito</p><p className="mt-1 flex items-center gap-2 font-mono text-xl font-black text-white"><Copy size={17} className="text-lime-400"/>{active.inviteCode}</p></div>
      </section>

      <section className="mt-5 rounded-3xl border border-white/5 bg-zinc-900 p-5">
        <h2 className="flex items-center gap-2 font-black"><UsersRound size={18} className="text-lime-400"/>Membri</h2>
        <div className="mt-4 space-y-3">{members.map((member) => <div key={member.userId} className="flex items-center gap-3 rounded-2xl bg-zinc-950 p-3">
          <Avatar username={member.username} avatarUrl={member.avatarUrl}/>
          <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate font-black">{member.username}</p>{member.createdBy === member.userId && <Crown size={14} className="text-amber-300"/>}</div><p className="text-xs text-zinc-500">{member.role === "admin" ? "Admin" : "Membro"}</p></div>
          {isAdmin && member.userId !== user.id && member.createdBy !== member.userId && <form action={removeMemberAction}><input type="hidden" name="groupId" value={active.groupId}/><input type="hidden" name="userId" value={member.userId}/><button title="Rimuovi membro" className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400"><Trash2 size={16}/></button></form>}
        </div>)}</div>
      </section>

      {isAdmin && <section className="mt-5 rounded-3xl border border-amber-300/10 bg-zinc-900 p-5"><h2 className="flex items-center gap-2 font-black"><Settings size={18} className="text-amber-300"/>Gestione admin</h2>
        <form action={renameGroupAction} className="mt-4"><input type="hidden" name="groupId" value={active.groupId}/><label className="text-xs font-bold uppercase text-zinc-500">Nome gruppo</label><input name="name" defaultValue={active.name} required minLength={2} maxLength={100} className="mt-2 h-12 w-full rounded-2xl bg-zinc-950 px-4 outline-none focus:ring-1 focus:ring-lime-400"/><button className="mt-3 h-11 w-full rounded-2xl bg-white font-black text-black">SALVA NOME</button></form>
        <form action={regenerateInviteCodeAction} className="mt-3"><input type="hidden" name="groupId" value={active.groupId}/><button className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-amber-300/10 font-black text-amber-300"><RefreshCw size={16}/>RIGENERA CODICE INVITO</button></form>
      </section>}

      {active && members.find((m)=>m.userId===user.id)?.createdBy !== user.id && <form action={leaveGroupAction} className="mt-5"><input type="hidden" name="groupId" value={active.groupId}/><button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 font-black text-red-400"><LogOut size={17}/>ESCI DAL GRUPPO</button></form>}
    </>}

    <div className="mt-8 grid gap-4">
      <form action={createGroup} className="rounded-3xl bg-zinc-900 p-5"><h2 className="flex items-center gap-2 font-black"><Plus className="text-lime-400" size={18}/>Nuovo gruppo</h2><input name="name" required placeholder="Nome gruppo" className="mt-3 h-12 w-full rounded-2xl bg-zinc-950 px-4 outline-none focus:ring-1 focus:ring-lime-400"/><button className="mt-3 h-12 w-full rounded-2xl bg-lime-400 font-black text-black">CREA</button></form>
      <form action={joinGroup} className="rounded-3xl bg-zinc-900 p-5"><h2 className="flex items-center gap-2 font-black"><KeyRound className="text-amber-300" size={18}/>Entra con codice</h2><input name="inviteCode" required placeholder="CODICE" className="mt-3 h-12 w-full rounded-2xl bg-zinc-950 px-4 font-mono uppercase outline-none focus:ring-1 focus:ring-amber-300"/><button className="mt-3 h-12 w-full rounded-2xl bg-zinc-800 font-black">ENTRA</button></form>
    </div>
  </div></main>;
}

function Avatar({ username, avatarUrl }: { username: string; avatarUrl: string | null }) { return <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-lime-400 text-black">{avatarUrl ? <img src={avatarUrl} alt={username} className="h-full w-full object-cover"/> : <div className="flex h-full w-full items-center justify-center font-black">{username[0]?.toUpperCase()}</div>}</div>; }
