import webpush from "web-push";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

function configured(){
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);
}
function setup(){
  if(!configured()) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  return true;
}
export async function sendPushToUser(userId:string,payload:{title:string;body?:string;url?:string}){
  if(!setup()) return;
  const subs=await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId,userId));
  await Promise.allSettled(subs.map(async s=>{
    try{
      await webpush.sendNotification({endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}},JSON.stringify(payload));
    }catch(e:any){
      if(e?.statusCode===404||e?.statusCode===410) await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id,s.id));
      else console.error("Push error",e);
    }
  }));
}
