import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { Crown, Flame, Home, Plus, Skull, Sparkles, Trophy, User } from "lucide-react";
import { db } from "@/db";
import { groupMembers, penalties, users } from "@/db/schema";
import { requirePayupContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const { group } = await requirePayupContext();
  const ranking = await db.select({
    id: users.id,
    username: users.username,
    avatarUrl: users.avatarUrl,
    penaltiesCount: sql<number>`count(${penalties.id})`,
    completedCount: sql<number>`count(case when ${penalties.status} = 'completed' then 1 end)`,
    pendingCount: sql<number>`count(case when ${penalties.status} = 'pending' then 1 end)`,
    moneyCents: sql<number>`coalesce(sum(${penalties.amountCents}), 0)`,
  })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .leftJoin(penalties, sql`${penalties.assignedTo} = ${users.id} and ${penalties.groupId} = ${group.groupId}`)
    .where(eq(groupMembers.groupId, group.groupId))
    .groupBy(users.id)
    .orderBy(desc(sql`count(${penalties.id})`));

  const biggestLoser = ranking[0];
  const mostReliable = [...ranking].sort((a,b) => reliability(b)-reliability(a))[0];
  const biggestSpender = [...ranking].sort((a,b) => Number(b.moneyCents)-Number(a.moneyCents))[0];

  return <main className="min-h-screen bg-zinc-950 text-white"><div className="mx-auto min-h-screen max-w-md border-x border-white/5 pb-28">
    <header className="px-5 pb-6 pt-5"><p className="text-xs font-black uppercase tracking-[.3em] text-amber-300">{group.name}</p><h1 className="mt-1 text-3xl font-black">🏆 Hall of Shame</h1><p className="mt-2 text-sm text-zinc-500">La gloria al contrario: qui vince chi perde di più.</p></header>

    <div className="grid grid-cols-3 gap-2 px-5">
      <Highlight emoji="🤡" label="Perde sempre" value={biggestLoser?.username ?? "—"}/>
      <Highlight emoji="🫡" label="Uomo di parola" value={mostReliable?.username ?? "—"}/>
      <Highlight emoji="💸" label="Paperone al contrario" value={biggestSpender && Number(biggestSpender.moneyCents)>0 ? biggestSpender.username : "—"}/>
    </div>

    <div className="mt-7 space-y-3 px-5">{ranking.map((player, index) => {
      const count = Number(player.penaltiesCount);
      const completed = Number(player.completedCount);
      const pending = Number(player.pendingCount);
      const money = Number(player.moneyCents);
      const ratio = count ? Math.round((completed / count) * 100) : 0;
      return <div key={player.id} className={`rounded-3xl border p-4 ${index===0 ? "border-amber-300/30 bg-amber-300/10" : "border-white/5 bg-zinc-900"}`}>
        <div className="flex items-center gap-4">
          <div className="relative"><Avatar username={player.username} avatarUrl={player.avatarUrl}/><div className="absolute -bottom-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-950 px-1 text-xs font-black">{index===0?"🥇":index===1?"🥈":index===2?"🥉":`#${index+1}`}</div></div>
          <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-lg font-black">{player.username}</p>{index===0&&<Crown size={16} className="text-amber-300"/>}</div><p className="mt-1 text-xs font-bold text-zinc-500">{titleFor(index,count,ratio)}</p></div>
          <div className="text-right"><p className="text-2xl font-black text-red-400">{count}</p><p className="text-[10px] font-bold uppercase text-zinc-600">penitenze</p></div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><Mini value={`✅ ${completed}`} label="Fatte"/><Mini value={`⏳ ${pending}`} label="Aperte"/><Mini value={`💸 ${(money/100).toFixed(2)}€`} label="Pagati"/></div>
        {count>0&&<div className="mt-3"><div className="mb-1 flex justify-between text-[10px] font-bold uppercase text-zinc-600"><span>Affidabilità</span><span>{ratio}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-lime-400" style={{width:`${ratio}%`}}/></div></div>}
      </div>;
    })}</div>
    <BottomNav/>
  </div></main>;
}

function reliability(player:{penaltiesCount:number;completedCount:number}){ const total=Number(player.penaltiesCount); return total ? Number(player.completedCount)/total : 0; }
function titleFor(index:number,count:number,ratio:number){ if(!count) return "😇 Ancora innocente"; if(index===0) return "🤡 DISASTRO UMANO"; if(ratio===100&&count>=2) return "🫡 UOMO DI PAROLA"; if(index===1) return "💀 Disastro controllato"; if(index===2) return "😬 Ci prova"; if(count>=5) return "🎯 Cliente abituale"; return "👀 Sotto osservazione"; }
function Avatar({username,avatarUrl}:{username:string;avatarUrl:string|null}){return <div className="h-14 w-14 overflow-hidden rounded-full bg-amber-300 text-black">{avatarUrl?<img src={avatarUrl} alt={username} className="h-full w-full object-cover"/>:<div className="flex h-full w-full items-center justify-center text-xl font-black">{username[0]?.toUpperCase()}</div>}</div>}
function Highlight({emoji,label,value}:{emoji:string;label:string;value:string}){return <div className="rounded-2xl bg-zinc-900 p-3 text-center"><p className="text-2xl">{emoji}</p><p className="mt-2 truncate text-xs font-black">{value}</p><p className="mt-1 text-[9px] font-bold uppercase leading-3 text-zinc-600">{label}</p></div>}
function Mini({value,label}:{value:string;label:string}){return <div className="rounded-xl bg-zinc-950 p-2"><p className="font-black">{value}</p><p className="mt-1 text-[9px] uppercase text-zinc-600">{label}</p></div>}
function BottomNav(){return <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-white/10 bg-zinc-950/95 px-2 pb-5 pt-3"><Nav href="/" icon={<Home size={20}/>} label="Home"/><Nav href="/feed" icon={<Flame size={20}/>} label="The Wall"/><Link href="/add" className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-black"><Plus size={26}/></Link><Link href="/ranking" className="flex min-w-14 flex-col items-center gap-1 text-[10px] font-bold text-lime-400"><Trophy size={20}/>Ranking</Link><Nav href="/profile" icon={<User size={20}/>} label="Profilo"/></nav>}
function Nav({href,icon,label}:{href:string;icon:React.ReactNode;label:string}){return <Link href={href} className="flex min-w-14 flex-col items-center gap-1 text-[10px] font-bold text-zinc-500">{icon}{label}</Link>}
