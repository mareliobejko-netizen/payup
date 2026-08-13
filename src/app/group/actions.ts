"use server";

import { randomBytes } from "crypto";
import { and, eq, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { groupMembers, groups } from "@/db/schema";
import { getMemberships, requireUser } from "@/lib/auth";
import {
  createGroup as createGroupFromOnboarding,
  joinGroup as joinGroupFromOnboarding,
} from "@/app/onboarding/actions";

function groupRedirect(type: "success" | "error", message: string): never {
  redirect(`/group?${type}=${encodeURIComponent(message)}`);
}

async function getAdminMembership(groupId: string, userId: string) {
  const [membership] = await db
    .select({ role: groupMembers.role })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .limit(1);
  return membership?.role === "admin";
}

async function uniqueInviteCode() {
  for (let i = 0; i < 10; i++) {
    const code = randomBytes(4).toString("hex").toUpperCase();
    const [exists] = await db.select({ id: groups.id }).from(groups).where(eq(groups.inviteCode, code)).limit(1);
    if (!exists) return code;
  }
  throw new Error("Impossibile generare un nuovo codice");
}

export async function createGroup(formData: FormData) {
  return createGroupFromOnboarding(formData);
}

export async function joinGroup(formData: FormData) {
  return joinGroupFromOnboarding(formData);
}

export async function switchGroup(formData: FormData) {
  const user = await requireUser();
  const groupId = formData.get("groupId")?.toString();
  if (!groupId) return;

  const [membership] = await db.select({ id: groupMembers.id }).from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id))).limit(1);
  if (!membership) groupRedirect("error", "Non fai parte di questo gruppo.");

  const store = await cookies();
  store.set("payup_group_id", groupId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  redirect("/");
}

export async function renameGroupAction(formData: FormData) {
  const user = await requireUser();
  const groupId = formData.get("groupId")?.toString() ?? "";
  const name = formData.get("name")?.toString().trim() ?? "";
  if (name.length < 2 || name.length > 100) groupRedirect("error", "Il nome del gruppo deve avere da 2 a 100 caratteri.");
  if (!(await getAdminMembership(groupId, user.id))) groupRedirect("error", "Solo un admin può rinominare il gruppo.");
  await db.update(groups).set({ name }).where(eq(groups.id, groupId));
  revalidatePath("/group"); revalidatePath("/"); revalidatePath("/ranking");
  groupRedirect("success", "Nome gruppo aggiornato.");
}

export async function regenerateInviteCodeAction(formData: FormData) {
  const user = await requireUser();
  const groupId = formData.get("groupId")?.toString() ?? "";
  if (!(await getAdminMembership(groupId, user.id))) groupRedirect("error", "Solo un admin può rigenerare il codice invito.");
  const inviteCode = await uniqueInviteCode();
  await db.update(groups).set({ inviteCode }).where(eq(groups.id, groupId));
  revalidatePath("/group");
  groupRedirect("success", `Nuovo codice invito: ${inviteCode}`);
}

export async function removeMemberAction(formData: FormData) {
  const user = await requireUser();
  const groupId = formData.get("groupId")?.toString() ?? "";
  const memberUserId = formData.get("userId")?.toString() ?? "";
  if (!(await getAdminMembership(groupId, user.id))) groupRedirect("error", "Solo un admin può rimuovere membri.");
  if (memberUserId === user.id) groupRedirect("error", "Per uscire dal gruppo usa il pulsante Esci dal gruppo.");

  const [group] = await db.select({ createdBy: groups.createdBy }).from(groups).where(eq(groups.id, groupId)).limit(1);
  if (!group) groupRedirect("error", "Gruppo non trovato.");
  if (group.createdBy === memberUserId) groupRedirect("error", "Il creatore del gruppo non può essere rimosso.");

  await db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, memberUserId)));
  revalidatePath("/group"); revalidatePath("/ranking");
  groupRedirect("success", "Membro rimosso dal gruppo.");
}

export async function leaveGroupAction(formData: FormData) {
  const user = await requireUser();
  const groupId = formData.get("groupId")?.toString() ?? "";
  const [group] = await db.select({ createdBy: groups.createdBy }).from(groups).where(eq(groups.id, groupId)).limit(1);
  if (!group) groupRedirect("error", "Gruppo non trovato.");
  if (group.createdBy === user.id) groupRedirect("error", "Il creatore non può uscire dal gruppo. Per ora deve restare amministratore.");

  await db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)));

  const memberships = await getMemberships(user.id);
  const store = await cookies();
  const nextGroup = memberships.find((m) => m.groupId !== groupId);
  if (nextGroup) store.set("payup_group_id", nextGroup.groupId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  else store.delete("payup_group_id");

  redirect(nextGroup ? "/" : "/onboarding");
}
