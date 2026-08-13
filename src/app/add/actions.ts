"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { groupMembers, penalties } from "@/db/schema";
import { requirePayupContext } from "@/lib/auth";

export async function createPenalty(formData: FormData) {
  const { user, group } = await requirePayupContext();
  const assignedTo = formData.get("assignedTo")?.toString();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const amount = formData.get("amount")?.toString();

  if (!assignedTo || !title) throw new Error("Giocatore e penitenza sono obbligatori");

  const [member] = await db.select({ id: groupMembers.id }).from(groupMembers)
    .where(and(eq(groupMembers.groupId, group.groupId), eq(groupMembers.userId, assignedTo))).limit(1);
  if (!member) throw new Error("Il giocatore non fa parte del gruppo attivo");

  let amountCents: number | null = null;
  if (amount?.trim()) {
    const parsed = Number(amount.replace(",", "."));
    if (!Number.isNaN(parsed) && parsed >= 0) amountCents = Math.round(parsed * 100);
  }

  await db.insert(penalties).values({
    groupId: group.groupId,
    assignedTo,
    createdBy: user.id,
    title: title.slice(0, 200),
    description: description || null,
    amountCents,
    status: "pending",
  });

  revalidatePath("/");
  redirect("/");
}
