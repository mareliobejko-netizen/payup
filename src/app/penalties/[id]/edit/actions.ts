"use server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { groupMembers, penalties } from "@/db/schema";
import { requireUser } from "@/lib/auth";

async function canManage(penaltyId:string,userId:string){
 const [p]=await db.select({id:penalties.id,groupId:penalties.groupId,createdBy:penalties.createdBy,status:penalties.status}).from(penalties).where(eq(penalties.id,penaltyId)).limit(1); if(!p)return null;
 const [m]=await db.select({role:groupMembers.role}).from(groupMembers).where(and(eq(groupMembers.groupId,p.groupId),eq(groupMembers.userId,userId))).limit(1); if(!m)return null;
 return {...p,allowed:p.createdBy===userId||m.role==="admin"};
}
export async function updatePenalty(formData:FormData){const user=await requireUser();const id=formData.get("id")?.toString()??"";const access=await canManage(id,user.id);if(!access?.allowed)throw new Error("Non puoi modificare questa penitenza");if(access.status==="completed")throw new Error("Una penitenza completata non si modifica");const title=formData.get("title")?.toString().trim()??"";if(!title)throw new Error("Titolo obbligatorio");const description=formData.get("description")?.toString().trim()||null;const category=formData.get("category")?.toString()||"challenge";const amount=formData.get("amount")?.toString();let amountCents:null|number=null;if(amount?.trim()){const n=Number(amount.replace(",","."));if(!Number.isNaN(n)&&n>=0)amountCents=Math.round(n*100)}const dueRaw=formData.get("dueAt")?.toString();const due=new Date(dueRaw||"");await db.update(penalties).set({title:title.slice(0,200),description,category,amountCents,dueAt:dueRaw&&!Number.isNaN(due.getTime())?due:null}).where(eq(penalties.id,id));revalidatePath("/");revalidatePath(`/penalties/${id}`);redirect(`/penalties/${id}`)}
export async function deletePenalty(formData:FormData){const user=await requireUser();const id=formData.get("id")?.toString()??"";const access=await canManage(id,user.id);if(!access?.allowed)throw new Error("Non puoi cancellare questa penitenza");await db.delete(penalties).where(eq(penalties.id,id));revalidatePath("/");revalidatePath("/ranking");redirect("/")}
