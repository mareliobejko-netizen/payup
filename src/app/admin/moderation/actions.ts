"use server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { proofReports, proofs } from "@/db/schema";
import { requirePayUpAdmin } from "@/lib/auth";
function back(message:string){revalidatePath('/admin/moderation');revalidatePath('/feed');redirect(`/admin/moderation?success=${encodeURIComponent(message)}`)}
export async function hideProofAction(formData:FormData){const admin=await requirePayUpAdmin();const proofId=formData.get('proofId')?.toString()??'';await db.update(proofs).set({isHidden:true,hiddenAt:new Date(),hiddenBy:admin.id}).where(eq(proofs.id,proofId));await db.update(proofReports).set({status:'resolved'}).where(eq(proofReports.proofId,proofId));back('Post nascosto da The Wall.')}
export async function restoreProofAction(formData:FormData){await requirePayUpAdmin();const proofId=formData.get('proofId')?.toString()??'';await db.update(proofs).set({isHidden:false,hiddenAt:null,hiddenBy:null}).where(eq(proofs.id,proofId));back('Post ripristinato.')}
export async function dismissReportsAction(formData:FormData){await requirePayUpAdmin();const proofId=formData.get('proofId')?.toString()??'';await db.update(proofReports).set({status:'dismissed'}).where(eq(proofReports.proofId,proofId));back('Segnalazioni archiviate.')}
