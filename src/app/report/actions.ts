"use server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { penalties, proofReports, proofs } from "@/db/schema";
import { requireUser } from "@/lib/auth";
export async function reportProofAction(formData:FormData){
 const user=await requireUser(); const proofId=formData.get('proofId')?.toString()??''; const reason=formData.get('reason')?.toString()??'other'; const note=formData.get('note')?.toString().trim().slice(0,500)||null; const back=formData.get('back')?.toString()||'/feed';
 if(!['spam','offensive','privacy','dangerous','other'].includes(reason)) redirect(`${back}?error=${encodeURIComponent('Motivo non valido')}`);
 const [p]=await db.select({id:proofs.id,isPublic:proofs.isPublic,status:penalties.status}).from(proofs).innerJoin(penalties,eq(proofs.penaltyId,penalties.id)).where(eq(proofs.id,proofId)).limit(1);
 if(!p||!p.isPublic||p.status!=='completed') redirect(`${back}?error=${encodeURIComponent('Post non disponibile')}`);
 const [existing]=await db.select({id:proofReports.id}).from(proofReports).where(and(eq(proofReports.proofId,proofId),eq(proofReports.reportedBy,user.id))).limit(1);
 if(!existing) await db.insert(proofReports).values({proofId,reportedBy:user.id,reason,note});
 redirect(`${back}?success=${encodeURIComponent('Segnalazione inviata. Grazie.')}`);
}
