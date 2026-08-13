"use server";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { groupMembers, groups } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export async function joinFromLink(formData: FormData) {
  const user = await requireUser();
  const code = formData.get("code")?.toString().trim().toUpperCase() ?? "";
  const [group] = await db.select({id:groups.id}).from(groups).where(eq(groups.inviteCode, code)).limit(1);
  if (!group) redirect(`/join/${encodeURIComponent(code)}?error=Codice invito non valido`);
  const [existing] = await db.select({id:groupMembers.id}).from(groupMembers).where(and(eq(groupMembers.groupId, group.id), eq(groupMembers.userId, user.id))).limit(1);
  if (!existing) await db.insert(groupMembers).values({groupId:group.id,userId:user.id,role:"member"});
  const store = await cookies();
  store.set("payup_group_id", group.id, {httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*365});
  redirect("/");
}
