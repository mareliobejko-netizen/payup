"use server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { groupMembers, penalties, users } from "@/db/schema";
import { requirePayupContext } from "@/lib/auth";
import { notify } from "@/lib/notifications";
export async function createPenalty(formData:FormData){
 const {user,group}=await requirePayupContext(); const assignedTo=formData.get("assignedTo")?.toString(); const title=formData.get("title")?.toString().trim(); const description=formData.get("description")?.toString().trim(); const amount=formData.get("amount")?.toString(); const category=formData.get("category")?.toString()||"challenge"; const dueRaw=formData.get("dueAt")?.toString();
 if(!assignedTo||!title) throw new Error("Giocatore e penitenza sono obbligatori");
 const [member]=await db.select({id:groupMembers.id}).from(groupMembers).where(and(eq(groupMembers.groupId,group.groupId),eq(groupMembers.userId,assignedTo))).limit(1); if(!member) throw new Error("Il giocatore non fa parte del gruppo");
 let amountCents:null|number=null;if(amount?.trim()){const n=Number(amount.replace(",","."));if(!Number.isNaN(n)&&n>=0)amountCents=Math.round(n*100)}
 const dueAt=dueRaw?new Date(dueRaw):null;
 const [created]=await db.insert(penalties).values({groupId:group.groupId,assignedTo,createdBy:user.id,title:title.slice(0,200),description:description||null,amountCents,category,dueAt:dueAt&&!Number.isNaN(dueAt.getTime())?dueAt:null,status:"pending"}).returning({id:penalties.id});
 const [creator]=await db.select({username:users.username}).from(users).where(eq(users.id,user.id)).limit(1);
 if(assignedTo!==user.id) await notify({userId:assignedTo,groupId:group.groupId,type:"penalty_assigned",title:"Nuova penitenza 💀",message:`${creator?.username??"Qualcuno"} ti ha assegnato: ${title}`,href:`/penalties/${created.id}`});
 revalidatePath("/");revalidatePath("/notifications");redirect("/");
}
