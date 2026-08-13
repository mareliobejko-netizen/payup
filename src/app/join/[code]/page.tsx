import Link from "next/link";
import { eq } from "drizzle-orm";
import { KeyRound, LogIn, Skull, UserPlus, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { groups } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { joinFromLink } from "./actions";

type Props={params:Promise<{code:string}>;searchParams:Promise<{error?:string}>};
export default async function JoinPage({params,searchParams}:Props){
  const {code}=await params; const {error}=await searchParams; const normalized=decodeURIComponent(code).toUpperCase();
  const [group]=await db.select({name:groups.name,inviteCode:groups.inviteCode}).from(groups).where(eq(groups.inviteCode, normalized)).limit(1);
  if(!group) notFound(); const user=await getCurrentUser(); const next=`/join/${encodeURIComponent(group.inviteCode)}`;
  return <main className="min-h-screen bg-zinc-950 px-5 py-12 text-white"><div className="mx-auto max-w-md text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-400 text-black"><UsersRound size={36}/></div><p className="mt-5 text-xs font-black uppercase tracking-[.3em] text-lime-400">Invito PayUp</p><h1 className="mt-2 text-4xl font-black">Entra in {group.name}</h1><p className="mt-3 text-zinc-500">Sei stato invitato nel gruppo. Codice <span className="font-mono font-black text-white">{group.inviteCode}</span></p>{error&&<p className="mt-5 rounded-2xl bg-red-500/10 p-3 text-sm font-bold text-red-300">{error}</p>}{user?<form action={joinFromLink} className="mt-8"><input type="hidden" name="code" value={group.inviteCode}/><button className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 font-black text-black"><KeyRound size={19}/>ENTRA NEL GRUPPO</button></form>:<div className="mt-8 grid gap-3"><Link href={`/register?next=${encodeURIComponent(next)}`} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-lime-400 font-black text-black"><UserPlus size={19}/>REGISTRATI E ENTRA</Link><Link href={`/login?next=${encodeURIComponent(next)}`} className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-zinc-900 font-black"><LogIn size={18}/>ACCEDI</Link></div>}<Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-zinc-500"><Skull size={16}/>Cos&apos;è PayUp?</Link></div></main>
}
