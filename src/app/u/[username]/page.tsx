import Link from "next/link";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { ArrowLeft, Heart, Images, Skull, UserPlus } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { penalties, proofLikes, proofs, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

type Props = { params: Promise<{ username: string }> };

export default async function PublicProfilePage({ params }: Props) {
  const currentUser = await getCurrentUser();
  const { username } = await params;
  const decoded = decodeURIComponent(username);
  const [person] = await db
    .select({ id: users.id, username: users.username, avatarUrl: users.avatarUrl, createdAt: users.createdAt })
    .from(users)
    .where(sql`lower(${users.username}) = ${decoded.toLowerCase()}`)
    .limit(1);
  if (!person) notFound();

  const publicCondition = and(
    eq(proofs.uploadedBy, person.id),
    eq(proofs.isPublic, true),
    eq(penalties.status, "completed"),
    isNotNull(proofs.publishedAt),
  );
  const [stats] = await db
    .select({ posts: sql<number>`count(distinct ${proofs.id})`, likes: sql<number>`count(${proofLikes.id})` })
    .from(proofs)
    .innerJoin(penalties, eq(proofs.penaltyId, penalties.id))
    .leftJoin(proofLikes, eq(proofLikes.proofId, proofs.id))
    .where(publicCondition);
  const posts = await db
    .select({ id: proofs.id, mediaUrl: proofs.mediaUrl, mediaType: proofs.mediaType, title: penalties.title, likes: sql<number>`count(${proofLikes.id})`, publishedAt: proofs.publishedAt })
    .from(proofs)
    .innerJoin(penalties, eq(proofs.penaltyId, penalties.id))
    .leftJoin(proofLikes, eq(proofLikes.proofId, proofs.id))
    .where(publicCondition)
    .groupBy(proofs.id, penalties.title)
    .orderBy(desc(proofs.publishedAt));

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 pb-10">
        <header className="flex items-center gap-4 border-b border-white/5 px-5 py-5">
          <Link href={currentUser ? "/feed" : "/register"} className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900"><ArrowLeft size={20} /></Link>
          <div className="flex-1"><p className="text-xs font-black uppercase tracking-[.25em] text-fuchsia-400">The Wall</p><h1 className="font-black">Profilo pubblico</h1></div>
          {!currentUser && <Link href="/register" className="rounded-full bg-lime-400 px-3 py-2 text-xs font-black text-black">Registrati</Link>}
        </header>

        <section className="px-5 py-7 text-center">
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-fuchsia-400 text-black">
            {person.avatarUrl ? <img src={person.avatarUrl} alt={person.username} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-3xl font-black">{person.username[0]?.toUpperCase()}</div>}
          </div>
          <h2 className="mt-4 text-2xl font-black">@{person.username}</h2>
          <p className="mt-1 text-xs text-zinc-500">Qui compaiono solo contenuti che ha scelto di rendere pubblici.</p>
          <div className="mt-5 grid grid-cols-2 gap-3"><Stat icon={<Images size={18} />} value={Number(stats?.posts ?? 0)} label="Prove pubbliche" /><Stat icon={<Heart size={18} />} value={Number(stats?.likes ?? 0)} label="Like ricevuti" /></div>
        </section>

        <section className="px-5">
          <div className="mb-4 flex items-center gap-2"><Skull size={18} className="text-fuchsia-400" /><h3 className="font-black">Le sue prove</h3></div>
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">Nessuna prova pubblica.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`} className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                  {post.mediaType === "video" ? <div className="relative aspect-square"><video src={post.mediaUrl} muted playsInline className="h-full w-full object-cover" /><span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-black">🎥</span></div> : <img src={post.mediaUrl} alt={post.title} className="aspect-square w-full object-cover" />}
                  <div className="p-3"><p className="line-clamp-2 text-xs font-bold">{post.title}</p><p className="mt-2 text-xs font-black text-pink-400">❤️ {Number(post.likes)}</p></div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {!currentUser && (
          <section className="mx-5 mt-8 rounded-3xl border border-lime-400/20 bg-lime-400/5 p-5 text-center">
            <h3 className="text-lg font-black">Vuoi creare la Hall of Shame del tuo gruppo?</h3>
            <p className="mt-2 text-sm text-zinc-500">Registrati gratis e invita i tuoi amici con un codice.</p>
            <Link href="/register" className="mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl bg-lime-400 font-black text-black"><UserPlus size={18} /> CREA ACCOUNT</Link>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return <div className="rounded-2xl bg-zinc-900 p-4"><div className="flex items-center justify-center gap-2 text-fuchsia-400">{icon}<span className="text-xl font-black text-white">{value}</span></div><p className="mt-1 text-xs font-bold text-zinc-500">{label}</p></div>;
}
