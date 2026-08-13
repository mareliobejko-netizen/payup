import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { Crown, Flame, Home, Medal, Plus, Skull, Trophy, User } from "lucide-react";
import { db } from "@/db";
import { groupMembers, penalties, users } from "@/db/schema";
import { requirePayupContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const { group } = await requirePayupContext();
  const ranking = await db.select({ id: users.id, username: users.username, penaltiesCount: sql<number>`count(${penalties.id})`, completedCount: sql<number>`count(case when ${penalties.status} = 'completed' then 1 end)`, moneyCents: sql<number>`coalesce(sum(${penalties.amountCents}), 0)` })
    .from(groupMembers).innerJoin(users, eq(groupMembers.userId, users.id)).leftJoin(penalties, sql`${penalties.assignedTo} = ${users.id} and ${penalties.groupId} = ${group.groupId}`)
    .where(eq(groupMembers.groupId, group.groupId)).groupBy(users.id).orderBy(desc(sql`count(${penalties.id})`));

  return <main className="min-h-screen bg-zinc-950 text-white"><div className="mx-auto min-h-screen max-w-md border-x border-white/5 pb-28">
    <header className="px-5 pb-6 pt-5"><p className="text-xs font-black uppercase tracking-[.3em] text-amber-300">{group.name}</p><h1 className="mt-1 text-3xl font-black">🏆 Hall of Shame</h1><p className="mt-2 text-sm text-zinc-500">Più penitenze ricevi, più in alto finisci. Purtroppo.</p></header>
    <div className="space-y-3 px-5">{ranking.map((player, index) => <div key={player.id} className={`flex items-center gap-4 rounded-3xl border p-4 ${index===0 ? "border-amber-300/30 bg-amber-300/10" : "border-white/5 bg-zinc-900"}`}><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-xl font-black">{index===0 ? "🥇" : index===1 ? "🥈" : index===2 ? "🥉" : `#${index+1}`}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate font-black">{player.username}</p>{index===0 && <Crown size={16} className="text-amber-300"/>}</div><p className="mt-1 text-xs font-bold text-zinc-500">{titleFor(index, Number(player.penaltiesCount))}</p><div className="mt-2 flex gap-3 text-xs"><span className="text-red-400">💀 {Number(player.penaltiesCount)}</span><span className="text-lime-400">✅ {Number(player.completedCount)}</span>{Number(player.moneyCents)>0 && <span className="text-emerald-400">💸 {(Number(player.moneyCents)/100).toFixed(2)}€</span>}</div></div></div>)}</div>
    <BottomNav/>
  </div></main>;
}
function titleFor(index:number,count:number){ if(!count) return "😇 Ancora innocente"; if(index===0) return "🤡 PERDE SEMPRE"; if(index===1) return "💀 Disastro controllato"; if(index===2) return "😬 Ci prova"; return "🎯 Nel mirino"; }
function BottomNav(){return <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-white/10 bg-zinc-950/95 px-2 pb-5 pt-3"><Nav href="/" icon={<Home size={20}/>} label="Home"/><Nav href="/feed" icon={<Flame size={20}/>} label="The Wall"/><Link href="/add" className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-black"><Plus size={26}/></Link><Link href="/ranking" className="flex min-w-14 flex-col items-center gap-1 text-[10px] font-bold text-lime-400"><Trophy size={20}/>Ranking</Link><Nav href="/profile" icon={<User size={20}/>} label="Profilo"/></nav>}
function Nav({href,icon,label}:{href:string;icon:React.ReactNode;label:string}){return <Link href={href} className="flex min-w-14 flex-col items-center gap-1 text-[10px] font-bold text-zinc-500">{icon}{label}</Link>}
