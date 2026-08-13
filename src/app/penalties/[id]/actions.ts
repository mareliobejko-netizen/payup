"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { groupMembers, penalties, proofs, users } from "@/db/schema";
import { notify } from "@/lib/notifications";
import { requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function submitProof({ penaltyId, mediaUrl, mediaType, caption, isPublic }: { penaltyId: string; mediaUrl: string; mediaType: "image" | "video"; caption?: string; isPublic?: boolean; }) {
  const currentUser = await requireUser();
  if (!penaltyId || !mediaUrl) throw new Error("Dati prova mancanti");

  const [penalty] = await db.select().from(penalties).where(eq(penalties.id, penaltyId)).limit(1);
  if (!penalty) throw new Error("Penitenza non trovata");
  if (penalty.status !== "pending") throw new Error("Questa penitenza non è più in attesa di una prova");
  if (currentUser.id !== penalty.assignedTo) throw new Error("Solo chi ha ricevuto la penitenza può caricare la prova");

  const [membership] = await db.select({ id: groupMembers.id }).from(groupMembers).where(and(eq(groupMembers.groupId, penalty.groupId), eq(groupMembers.userId, currentUser.id))).limit(1);
  if (!membership) throw new Error("Non fai parte di questo gruppo");

  const [existingProof] = await db.select({ id: proofs.id }).from(proofs).where(eq(proofs.penaltyId, penaltyId)).limit(1);
  if (existingProof) throw new Error("Esiste già una prova per questa penitenza");

  await db.insert(proofs).values({ penaltyId, uploadedBy: currentUser.id, mediaUrl, mediaType, caption: caption?.trim() || null, isPublic: Boolean(isPublic) });
  await db.update(penalties).set({ status: "verifying" }).where(eq(penalties.id, penaltyId));

  await logActivity({groupId:penalty.groupId,actorUserId:currentUser.id,type:"proof_uploaded",message:`${currentUser.username} ha caricato una prova: ${penalty.title}`,href:`/penalties/${penaltyId}`});
  const members = await db.select({ userId: groupMembers.userId }).from(groupMembers).where(eq(groupMembers.groupId, penalty.groupId));
  const [who] = await db.select({ username: users.username }).from(users).where(eq(users.id, currentUser.id)).limit(1);
  await Promise.all(members.filter((m) => m.userId !== currentUser.id).map((m) => notify({ userId: m.userId, groupId: penalty.groupId, type: "proof_uploaded", title: "C’è una prova da giudicare 📸", message: `${who?.username ?? "Qualcuno"} dice di aver completato “${penalty.title}”. Confermi?`, href: `/penalties/${penaltyId}` })));

  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/notifications");
  revalidatePath(`/penalties/${penaltyId}`);
  redirect("/");
}
