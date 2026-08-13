"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { groupMembers, groups, penalties, proofs, votes } from "@/db/schema";
import { notify } from "@/lib/notifications";
import { requireUser } from "@/lib/auth";

export async function voteOnProof(formData: FormData) {
  const currentUser = await requireUser();
  const proofId = formData.get("proofId")?.toString();
  const voteValue = formData.get("vote")?.toString();
  if (!proofId || !["confirm", "fake"].includes(voteValue ?? "")) throw new Error("Voto non valido");

  const [proof] = await db.select({ id: proofs.id, uploadedBy: proofs.uploadedBy, penaltyId: proofs.penaltyId, penaltyStatus: penalties.status, groupId: penalties.groupId, requiredVotes: groups.verificationVotes, isPublic: proofs.isPublic })
    .from(proofs).innerJoin(penalties, eq(proofs.penaltyId, penalties.id)).innerJoin(groups, eq(penalties.groupId, groups.id)).where(eq(proofs.id, proofId)).limit(1);

  if (!proof) throw new Error("Prova non trovata");
  if (proof.penaltyStatus !== "verifying") throw new Error("Questa prova non è più votabile");
  if (proof.uploadedBy === currentUser.id) throw new Error("Non puoi votare la tua stessa prova");

  const [membership] = await db.select({ id: groupMembers.id }).from(groupMembers).where(and(eq(groupMembers.groupId, proof.groupId), eq(groupMembers.userId, currentUser.id))).limit(1);
  if (!membership) throw new Error("Non fai parte di questo gruppo");

  const [existingVote] = await db.select({ id: votes.id }).from(votes).where(and(eq(votes.proofId, proofId), eq(votes.userId, currentUser.id))).limit(1);
  if (existingVote) throw new Error("Hai già votato questa prova");

  await db.insert(votes).values({ proofId, userId: currentUser.id, confirmed: voteValue === "confirm" });
  const allVotes = await db.select({ confirmed: votes.confirmed }).from(votes).where(eq(votes.proofId, proofId));
  const confirmations = allVotes.filter((v) => v.confirmed).length;
  const fakeVotes = allVotes.filter((v) => !v.confirmed).length;
  const requiredVotes = proof.requiredVotes || 3;

  if (confirmations >= requiredVotes) {
    const now = new Date();
    await db.update(penalties).set({ status: "completed", completedAt: now }).where(eq(penalties.id, proof.penaltyId));
    if (proof.isPublic) await db.update(proofs).set({ publishedAt: now }).where(eq(proofs.id, proofId));
    await notify({ userId: proof.uploadedBy, groupId: proof.groupId, type: "proof_approved", title: "Prova approvata ✅", message: "Il gruppo ha confermato: FATTO PER DAVVERO.", href: `/penalties/${proof.penaltyId}` });
  } else if (confirmations === requiredVotes - 1) {
    await notify({ userId: proof.uploadedBy, groupId: proof.groupId, type: "one_vote_left", title: "Manca solo 1 voto 👀", message: "La tua prova è a un solo CONFERMO dal completamento.", href: `/penalties/${proof.penaltyId}` });
  } else if (fakeVotes >= requiredVotes) {
    await db.delete(proofs).where(eq(proofs.id, proofId));
    await db.update(penalties).set({ status: "pending", completedAt: null }).where(eq(penalties.id, proof.penaltyId));
    await notify({ userId: proof.uploadedBy, groupId: proof.groupId, type: "proof_rejected", title: "Prova bocciata 🤡", message: "Il gruppo ha votato FAKE. La penitenza torna da fare.", href: `/penalties/${proof.penaltyId}` });
  }

  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/ranking");
  revalidatePath("/notifications");
  revalidatePath(`/penalties/${proof.penaltyId}`);
}
