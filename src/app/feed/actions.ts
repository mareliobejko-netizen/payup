"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { penalties, proofLikes, proofs } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export async function toggleLike(formData: FormData) {
  const user = await requireUser();
  const proofId = formData.get("proofId")?.toString();
  if (!proofId) throw new Error("Prova non valida");

  const [proof] = await db.select({ id: proofs.id, isPublic: proofs.isPublic, publishedAt: proofs.publishedAt, status: penalties.status })
    .from(proofs).innerJoin(penalties, eq(proofs.penaltyId, penalties.id)).where(eq(proofs.id, proofId)).limit(1);
  if (!proof || !proof.isPublic || !proof.publishedAt || proof.status !== "completed") throw new Error("Questa prova non è pubblica");

  const [existing] = await db.select({ id: proofLikes.id }).from(proofLikes).where(and(eq(proofLikes.proofId, proofId), eq(proofLikes.userId, user.id))).limit(1);
  if (existing) await db.delete(proofLikes).where(eq(proofLikes.id, existing.id));
  else await db.insert(proofLikes).values({ proofId, userId: user.id });
  revalidatePath("/feed");
  revalidatePath(`/post/${proofId}`);
}
