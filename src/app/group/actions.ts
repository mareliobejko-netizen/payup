"use server";

import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { groupMembers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  createGroup as createGroupFromOnboarding,
  joinGroup as joinGroupFromOnboarding,
} from "@/app/onboarding/actions";

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
  const [membership] = await db.select({ id: groupMembers.id }).from(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id))).limit(1);
  if (!membership) throw new Error("Non fai parte di questo gruppo");
  const store = await cookies();
  store.set("payup_group_id", groupId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  redirect("/");
}
