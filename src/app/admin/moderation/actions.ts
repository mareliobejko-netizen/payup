"use server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { moderationNotes, proofReports, proofs, sessions, users } from "@/db/schema";
import { requirePayUpAdmin } from "@/lib/auth";

function back(message:string,path="/admin/moderation"):never{
  revalidatePath('/admin/moderation');revalidatePath('/feed');
  redirect(`${path}?success=${encodeURIComponent(message)}`)
}
export async function hideProofAction(formData:FormData){const admin=await requirePayUpAdmin();const proofId=formData.get('proofId')?.toString()??'';await db.update(proofs).set({isHidden:true,hiddenAt:new Date(),hiddenBy:admin.id}).where(eq(proofs.id,proofId));await db.update(proofReports).set({status:'resolved'}).where(eq(proofReports.proofId,proofId));back('Post nascosto da The Wall.')}
export async function restoreProofAction(formData:FormData){await requirePayUpAdmin();const proofId=formData.get('proofId')?.toString()??'';await db.update(proofs).set({isHidden:false,hiddenAt:null,hiddenBy:null}).where(eq(proofs.id,proofId));back('Post ripristinato.')}
export async function dismissReportsAction(formData:FormData){await requirePayUpAdmin();const proofId=formData.get('proofId')?.toString()??'';await db.update(proofReports).set({status:'dismissed'}).where(eq(proofReports.proofId,proofId));back('Segnalazioni archiviate.')}

export async function banUserAction(formData: FormData) {
  await requirePayUpAdmin();
  const userId = formData.get("userId")?.toString() ?? "";
  const hours = Math.max(1, Math.min(24 * 30, Number(formData.get("hours") ?? 24)));
  const reason = formData.get("reason")?.toString().trim().slice(0, 500) || "Violazione delle regole di The Wall";
  const until = new Date(Date.now() + hours * 60 * 60 * 1000);
  await db.update(users).set({ bannedUntil: until, banReason: reason }).where(eq(users.id, userId));
  await db.delete(sessions).where(eq(sessions.userId, userId));
  back(`Utente sospeso fino al ${new Intl.DateTimeFormat("it-IT",{dateStyle:"medium",timeStyle:"short"}).format(until)}.`, `/admin/moderation/user/${userId}`);
}

export async function unbanUserAction(formData: FormData) {
  await requirePayUpAdmin();
  const userId = formData.get("userId")?.toString() ?? "";
  await db.update(users).set({ bannedUntil: null, banReason: null }).where(eq(users.id, userId));
  back("Sospensione rimossa.", `/admin/moderation/user/${userId}`);
}

export async function addModerationNoteAction(formData: FormData) {
  const admin = await requirePayUpAdmin();
  const userId = formData.get("userId")?.toString() ?? "";
  const note = formData.get("note")?.toString().trim() ?? "";
  if (note.length < 2) back("Nota troppo corta.", `/admin/moderation/user/${userId}`);
  await db.insert(moderationNotes).values({ targetUserId: userId, adminUserId: admin.id, note: note.slice(0, 1500) });
  back("Nota admin salvata.", `/admin/moderation/user/${userId}`);
}
