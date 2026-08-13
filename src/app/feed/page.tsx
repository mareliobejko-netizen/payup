import Link from "next/link";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { Flame, Heart, Home, Plus, Skull, Trophy, User } from "lucide-react";
import { db } from "@/db";
import { groups, penalties, proofLikes, proofs, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { toggleLike } from "./actions";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const currentUser = await requireUser();
  const posts = await db.select({ proofId: proofs.id, mediaUrl: proofs.mediaUrl, mediaType: proofs.mediaType, caption: proofs.caption, publishedAt: proofs.publishedAt, username: users.username, avatarUrl: users.avatarUrl, groupName: groups.name, penaltyTitle: penalties.title, likes: sql<number>`count(${proofLikes.id})` })
    .from(proofs)
    .innerJoin(penalties, eq(proofs.penaltyId, penalties.id))
    .innerJoin(users, eq(proofs.uploadedBy, users.id))
    .innerJoin(groups, eq(penalties.groupId, groups.id))
    .leftJoin(proofLikes, eq(proofLikes.proofId, proofs.id))
    .where(and(eq(proofs.isPublic, true), eq(penalties.status, "completed"), isNotNull(proofs.publishedAt)))
    .groupBy(proofs.id, users.username, users.avatarUrl, groups.name, penalties.title)
    .orderBy(desc(proofs.publishedAt));

  const myLikes = await db.select({ proofId: proofLikes.proofId }).from(proofLikes).where(eq(proofLikes.userId, currentUser.id));
  const liked = new Set(myLikes.map((x) => x.proofId));

  return <main className="min-h-screen bg-zinc-950 text-white"><div className="mx-auto min-h-screen max-w-md border-x border-white/5 pb-28">
    <header className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/95 px-5 py-5 backdrop-blur"><p className="text-xs font-black uppercase tracking-[.3em] text-fuchsia-400">The Wall</p><h1 className="mt-1 text-3xl font-black">🔥 Per te</h1><p className="mt-1 text-xs text-zinc-500">Le prove pubbliche approvate dalla community dei gruppi.</p></header>
    <div className="space-y-5 px-5 py-6">{posts.length === 0 ? <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center"><p className="text-5xl">🧱</p><h2 className="mt-4 text-xl font-black">The Wall è vuoto</h2><p className="mt-2 text-sm text-zinc-500">Quando qualcuno rende pubblica una prova approvata, apparirà qui.</p></div> : posts.map((post) => <article key={post.proofId} className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
      <div className="p-4"><div className="flex items-center gap-3"><Avatar username={post.username} avatarUrl={post.avatarUrl}/><div className="flex-1"><p className="font-black">@{post.username}</p><p className="text-xs text-zinc-500">{post.groupName}</p></div><span className="rounded-full bg-lime-400/10 px-3 py-1 text-[10px] font-black text-lime-300">✓ APPROVATA</span></div><p className="mt-4 rounded-2xl bg-zinc-800/70 p-3 text-sm font-semibold">💀 {post.penaltyTitle}</p></div>
      {post.mediaType === "video" ? <video src={post.mediaUrl} controls className="aspect-[4/3] w-full object-cover"/> : <img src={post.mediaUrl} alt="Prova pubblica" className="aspect-[4/3] w-full object-cover"/>}
      <div className="p-4">{post.caption && <p className="mb-4 text-sm text-zinc-300">“{post.caption}”</p>}<form action={toggleLike}><input type="hidden" name="proofId" value={post.proofId}/><button className={`flex items-center gap-2 rounded-full px-4 py-2 font-black ${liked.has(post.proofId) ? "bg-pink-500 text-white" : "bg-zinc-800 text-zinc-300"}`}><Heart size={18} fill={liked.has(post.proofId) ? "currentColor" : "none"}/>{Number(post.likes)}</button></form></div>
    </article>)}</div>
    <BottomNav active="feed"/>
  </div></main>;
}


function Avatar({username,avatarUrl}:{username:string;avatarUrl:string|null}){return <div className="h-11 w-11 overflow-hidden rounded-full bg-fuchsia-400 text-black">{avatarUrl?<img src={avatarUrl} alt={username} className="h-full w-full object-cover"/>:<div className="flex h-full w-full items-center justify-center font-black">{username[0]?.toUpperCase()}</div>}</div>}
function BottomNav({ active }: { active: string }) { return <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-white/10 bg-zinc-950/95 px-2 pb-5 pt-3 backdrop-blur"><Nav href="/" icon={<Home size={20}/>} label="Home" active={active==="home"}/><Nav href="/feed" icon={<Flame size={20}/>} label="The Wall" active={active==="feed"}/><Link href="/add" className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-black"><Plus size={26}/></Link><Nav href="/ranking" icon={<Trophy size={20}/>} label="Ranking" active={active==="ranking"}/><Nav href="/profile" icon={<User size={20}/>} label="Profilo" active={active==="profile"}/></nav>; }
function Nav({ href, icon, label, active }: { href:string; icon:React.ReactNode; label:string; active:boolean }) { return <Link href={href} className={`flex min-w-14 flex-col items-center gap-1 text-[10px] font-bold ${active ? "text-lime-400" : "text-zinc-500"}`}>{icon}{label}</Link>; }
