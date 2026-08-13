import Link from "next/link";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { Flame, Heart, Home, Plus, Trophy, User } from "lucide-react";
import { db } from "@/db";
import { groups, penalties, proofLikes, proofs, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import ProofMedia from "@/components/proof-media";
import { toggleLike } from "./actions";
import ShareButton from "./share-button";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ sort?: string }> };

export default async function FeedPage({ searchParams }: Props) {
  const currentUser = await getCurrentUser();
  const params = await searchParams;
  const sort = params.sort === "popular" ? "popular" : "recent";
  const likeCount = sql<number>`count(${proofLikes.id})`;

  const query = db.select({
    proofId: proofs.id,
    mediaUrl: proofs.mediaUrl,
    mediaType: proofs.mediaType,
    caption: proofs.caption,
    publishedAt: proofs.publishedAt,
    userId: users.id,
    username: users.username,
    avatarUrl: users.avatarUrl,
    groupName: groups.name,
    penaltyTitle: penalties.title,
    likes: likeCount,
  })
    .from(proofs)
    .innerJoin(penalties, eq(proofs.penaltyId, penalties.id))
    .innerJoin(users, eq(proofs.uploadedBy, users.id))
    .innerJoin(groups, eq(penalties.groupId, groups.id))
    .leftJoin(proofLikes, eq(proofLikes.proofId, proofs.id))
    .where(and(eq(proofs.isPublic, true), eq(groups.wallEnabled, true), eq(penalties.status, "completed"), isNotNull(proofs.publishedAt)))
    .groupBy(proofs.id, users.id, users.username, users.avatarUrl, groups.name, penalties.title);

  const posts = sort === "popular"
    ? await query.orderBy(desc(likeCount), desc(proofs.publishedAt))
    : await query.orderBy(desc(proofs.publishedAt));

  const myLikes = currentUser ? await db.select({ proofId: proofLikes.proofId }).from(proofLikes).where(eq(proofLikes.userId, currentUser.id)) : [];
  const liked = new Set(myLikes.map((x) => x.proofId));

  return <main className="min-h-screen bg-zinc-950 text-white"><div className="mx-auto min-h-screen max-w-md border-x border-white/5 pb-28">
    <header className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/95 px-5 pb-4 pt-5 backdrop-blur"><p className="text-xs font-black uppercase tracking-[.3em] text-fuchsia-400">The Wall</p><h1 className="mt-1 text-3xl font-black">🔥 Per te</h1><p className="mt-1 text-xs text-zinc-500">Solo prove pubbliche già approvate dai rispettivi gruppi.</p><div className="mt-4 grid grid-cols-2 rounded-2xl bg-zinc-900 p-1"><Link href="/feed?sort=recent" className={`rounded-xl px-4 py-2 text-center text-sm font-black ${sort === "recent" ? "bg-white text-black" : "text-zinc-500"}`}>🆕 Recenti</Link><Link href="/feed?sort=popular" className={`rounded-xl px-4 py-2 text-center text-sm font-black ${sort === "popular" ? "bg-fuchsia-400 text-black" : "text-zinc-500"}`}>🔥 Popolari</Link></div></header>

    <div className="space-y-5 px-5 py-6">{posts.length === 0 ? <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center"><p className="text-5xl">🧱</p><h2 className="mt-4 text-xl font-black">The Wall è vuoto</h2><p className="mt-2 text-sm text-zinc-500">Quando qualcuno rende pubblica una prova approvata, apparirà qui.</p></div> : posts.map((post) => <article id={`post-${post.proofId}`} key={post.proofId} className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
      <div className="p-4"><div className="flex items-center gap-3"><Link href={`/u/${encodeURIComponent(post.username)}`}><Avatar username={post.username} avatarUrl={post.avatarUrl}/></Link><div className="min-w-0 flex-1"><Link href={`/u/${encodeURIComponent(post.username)}`} className="font-black hover:underline">@{post.username}</Link><p className="truncate text-xs text-zinc-500">{post.groupName}</p></div><span className="rounded-full bg-lime-400/10 px-3 py-1 text-[10px] font-black text-lime-300">✓ APPROVATA</span></div><p className="mt-4 rounded-2xl bg-zinc-800/70 p-3 text-sm font-semibold">💀 {post.penaltyTitle}</p></div>
      <ProofMedia src={post.mediaUrl} type={post.mediaType} alt="Prova pubblica"/>
      <div className="p-4">{post.caption && <p className="mb-4 text-sm text-zinc-300">“{post.caption}”</p>}<div className="flex items-center justify-between gap-3">{currentUser ? <form action={toggleLike}><input type="hidden" name="proofId" value={post.proofId}/><button className={`flex items-center gap-2 rounded-full px-4 py-2 font-black ${liked.has(post.proofId) ? "bg-pink-500 text-white" : "bg-zinc-800 text-zinc-300"}`}><Heart size={18} fill={liked.has(post.proofId) ? "currentColor" : "none"}/>{Number(post.likes)}</button></form> : <Link href={`/register?next=${encodeURIComponent(`/post/${post.proofId}`)}`} className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 font-black text-zinc-300"><Heart size={18}/>{Number(post.likes)}</Link>}<ShareButton path={`/post/${post.proofId}`}/></div></div>
    </article>)}</div>
    {currentUser ? <BottomNav active="feed"/> : <div className="sticky bottom-4 mx-5 flex gap-2 rounded-2xl border border-white/10 bg-zinc-950/95 p-2 backdrop-blur"><Link href="/register" className="flex-1 rounded-xl bg-lime-400 px-4 py-3 text-center text-sm font-black text-black">REGISTRATI</Link><Link href="/login" className="rounded-xl bg-zinc-800 px-4 py-3 text-sm font-black">ACCEDI</Link></div>}
  </div></main>;
}

function Avatar({username,avatarUrl}:{username:string;avatarUrl:string|null}){return <div className="h-11 w-11 overflow-hidden rounded-full bg-fuchsia-400 text-black">{avatarUrl?<img src={avatarUrl} alt={username} className="h-full w-full object-cover"/>:<div className="flex h-full w-full items-center justify-center font-black">{username[0]?.toUpperCase()}</div>}</div>}
function BottomNav({ active }: { active: string }) { return <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-white/10 bg-zinc-950/95 px-2 pb-5 pt-3 backdrop-blur"><Nav href="/" icon={<Home size={20}/>} label="Home" active={active==="home"}/><Nav href="/feed" icon={<Flame size={20}/>} label="The Wall" active={active==="feed"}/><Link href="/add" className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-black"><Plus size={26}/></Link><Nav href="/ranking" icon={<Trophy size={20}/>} label="Ranking" active={active==="ranking"}/><Nav href="/profile" icon={<User size={20}/>} label="Profilo" active={active==="profile"}/></nav>; }
function Nav({ href, icon, label, active }: { href:string; icon:React.ReactNode; label:string; active:boolean }) { return <Link href={href} className={`flex min-w-14 flex-col items-center gap-1 text-[10px] font-bold ${active ? "text-lime-400" : "text-zinc-500"}`}>{icon}{label}</Link>; }
