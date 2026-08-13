import type { Metadata } from "next";
import Link from "next/link";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { ArrowLeft, Heart, LogIn, Skull, UserPlus } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { groups, penalties, proofLikes, proofs, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { toggleLike } from "@/app/feed/actions";
import ShareButton from "@/app/feed/share-button";

type Props = { params: Promise<{ id: string }> };

async function getPublicPost(id: string) {
  const [post] = await db
    .select({
      proofId: proofs.id,
      mediaUrl: proofs.mediaUrl,
      mediaType: proofs.mediaType,
      caption: proofs.caption,
      publishedAt: proofs.publishedAt,
      username: users.username,
      avatarUrl: users.avatarUrl,
      groupName: groups.name,
      penaltyTitle: penalties.title,
      likes: sql<number>`count(${proofLikes.id})`,
    })
    .from(proofs)
    .innerJoin(penalties, eq(proofs.penaltyId, penalties.id))
    .innerJoin(users, eq(proofs.uploadedBy, users.id))
    .innerJoin(groups, eq(penalties.groupId, groups.id))
    .leftJoin(proofLikes, eq(proofLikes.proofId, proofs.id))
    .where(
      and(
        eq(proofs.id, id),
        eq(proofs.isPublic, true),
        eq(penalties.status, "completed"),
        isNotNull(proofs.publishedAt),
      ),
    )
    .groupBy(proofs.id, users.username, users.avatarUrl, groups.name, penalties.title)
    .limit(1);

  return post ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPublicPost(id);

  if (!post) {
    return { title: "Post non disponibile · PayUp" };
  }

  const title = `${post.username} ha completato una penitenza · PayUp`;
  const description = `💀 ${post.penaltyTitle} — guarda la prova verificata su PayUp.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: post.mediaType === "image" ? [{ url: post.mediaUrl, alt: post.penaltyTitle }] : undefined,
    },
    twitter: {
      card: post.mediaType === "image" ? "summary_large_image" : "summary",
      title,
      description,
      images: post.mediaType === "image" ? [post.mediaUrl] : undefined,
    },
  };
}

export default async function PublicPostPage({ params }: Props) {
  const currentUser = await getCurrentUser();
  const { id } = await params;
  const post = await getPublicPost(id);
  if (!post) notFound();

  const [myLike] = currentUser
    ? await db
        .select({ id: proofLikes.id })
        .from(proofLikes)
        .where(and(eq(proofLikes.proofId, id), eq(proofLikes.userId, currentUser.id)))
        .limit(1)
    : [];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 pb-10">
        <header className="flex items-center gap-4 border-b border-white/5 px-5 py-5">
          <Link
            href={currentUser ? "/feed" : "/register"}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-[.25em] text-fuchsia-400">The Wall</p>
            <h1 className="font-black">Post pubblico</h1>
          </div>
          {!currentUser && (
            <Link href="/login" className="rounded-full bg-zinc-900 px-3 py-2 text-xs font-black text-zinc-300">
              Accedi
            </Link>
          )}
        </header>

        <article className="mx-5 my-6 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Link href={`/u/${encodeURIComponent(post.username)}`} className="h-12 w-12 overflow-hidden rounded-full bg-fuchsia-400 text-black">
                {post.avatarUrl ? (
                  <img src={post.avatarUrl} alt={post.username} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-black">{post.username[0]?.toUpperCase()}</div>
                )}
              </Link>
              <div className="flex-1">
                <Link href={`/u/${encodeURIComponent(post.username)}`} className="font-black">@{post.username}</Link>
                <p className="text-xs text-zinc-500">{post.groupName}</p>
              </div>
              <span className="rounded-full bg-lime-400/10 px-3 py-1 text-[10px] font-black text-lime-300">✓ APPROVATA</span>
            </div>
            <p className="mt-4 rounded-2xl bg-zinc-800/70 p-4 font-semibold">💀 {post.penaltyTitle}</p>
          </div>

          {post.mediaType === "video" ? (
            <video src={post.mediaUrl} controls autoPlay={false} playsInline className="aspect-[4/3] w-full object-cover" />
          ) : (
            <img src={post.mediaUrl} alt="Prova" className="aspect-[4/3] w-full object-cover" />
          )}

          <div className="p-4">
            {post.caption && <p className="mb-4 text-sm text-zinc-300">“{post.caption}”</p>}
            <div className="flex items-center justify-between gap-3">
              {currentUser ? (
                <form action={toggleLike}>
                  <input type="hidden" name="proofId" value={post.proofId} />
                  <button className={`flex items-center gap-2 rounded-full px-4 py-2 font-black ${myLike ? "bg-pink-500" : "bg-zinc-800"}`}>
                    <Heart size={18} fill={myLike ? "currentColor" : "none"} />
                    {Number(post.likes)}
                  </button>
                </form>
              ) : (
                <Link href="/register" className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 font-black">
                  <Heart size={18} />
                  {Number(post.likes)}
                </Link>
              )}
              <ShareButton path={`/post/${post.proofId}`} />
            </div>
          </div>
        </article>

        {!currentUser && (
          <section className="mx-5 overflow-hidden rounded-3xl border border-lime-400/20 bg-gradient-to-br from-lime-400/10 to-zinc-900 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400 text-black">
              <Skull size={27} />
            </div>
            <p className="mt-4 text-xs font-black uppercase tracking-[.25em] text-lime-400">PayUp</p>
            <h2 className="mt-2 text-2xl font-black">Anche nel tuo gruppo qualcuno perde sempre? 😈</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Crea il vostro gruppo, assegna penitenze, carica le prove e fate decidere agli amici se sono state completate davvero.
            </p>
            <div className="mt-5 grid gap-3">
              <Link href="/register" className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-lime-400 font-black text-black">
                <UserPlus size={19} /> CREA IL TUO ACCOUNT
              </Link>
              <Link href="/login" className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-800 font-black text-zinc-200">
                <LogIn size={18} /> HO GIÀ UN ACCOUNT
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
