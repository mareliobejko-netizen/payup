"use server";

import { randomBytes } from "crypto";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { groupMembers, groups } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

async function createUniqueInviteCode() {
  for (let i = 0; i < 8; i++) {
    const code = randomBytes(4).toString("hex").toUpperCase();
    const [exists] = await db.select({ id: groups.id }).from(groups).where(eq(groups.inviteCode, code)).limit(1);
    if (!exists) return code;
  }
  throw new Error("Impossibile creare un codice invito. Riprova.");
}

async function setActiveGroup(groupId: string) {
  const store = await cookies();
  store.set("payup_group_id", groupId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
}

export async function createGroup(formData: FormData) {
  const user = await requireUser();
  const name = formData.get("name")?.toString().trim();
  if (!name || name.length < 2) throw new Error("Inserisci un nome gruppo valido");
  const inviteCode = await createUniqueInviteCode();
  const [group] = await db.insert(groups).values({ name: name.slice(0, 100), inviteCode, createdBy: user.id, verificationVotes: 3 }).returning();
  await db.insert(groupMembers).values({ groupId: group.id, userId: user.id, role: "admin" });
  await logActivity({groupId:group.id,actorUserId:user.id,type:"group_created",message:`${user.username} ha creato il gruppo`});
  await setActiveGroup(group.id);
  redirect("/");
}

export async function joinGroup(formData: FormData) {
  const user = await requireUser();
  const code = formData.get("inviteCode")?.toString().trim().toUpperCase();
  if (!code) throw new Error("Inserisci il codice invito");
  const [group] = await db.select().from(groups).where(eq(groups.inviteCode, code)).limit(1);
  if (!group) throw new Error("Codice invito non valido");
  const [existing] = await db.select({ id: groupMembers.id }).from(groupMembers).where(and(eq(groupMembers.groupId, group.id), eq(groupMembers.userId, user.id))).limit(1);
  if (!existing) { await db.insert(groupMembers).values({ groupId: group.id, userId: user.id, role: "member" }); await logActivity({groupId:group.id,actorUserId:user.id,type:"member_joined",message:`${user.username} è entrato nel gruppo`}); }
  await setActiveGroup(group.id);
  redirect("/");
}
