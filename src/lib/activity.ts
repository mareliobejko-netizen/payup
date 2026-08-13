import { db } from "@/db";
import { activityLogs } from "@/db/schema";
export async function logActivity(input:{groupId:string;actorUserId?:string|null;type:string;message:string;href?:string|null}){
  await db.insert(activityLogs).values({groupId:input.groupId,actorUserId:input.actorUserId??null,type:input.type,message:input.message,href:input.href??null});
}
