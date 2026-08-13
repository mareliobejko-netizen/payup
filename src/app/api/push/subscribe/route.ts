import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
export async function POST(req:Request){
  const user=await getCurrentUser(); if(!user) return NextResponse.json({error:"Unauthorized"},{status:401});
  const s=await req.json(); if(!s?.endpoint||!s?.keys?.p256dh||!s?.keys?.auth) return NextResponse.json({error:"Invalid subscription"},{status:400});
  const [existing]=await db.select({id:pushSubscriptions.id}).from(pushSubscriptions).where(eq(pushSubscriptions.endpoint,s.endpoint)).limit(1);
  if(existing) await db.update(pushSubscriptions).set({userId:user.id,p256dh:s.keys.p256dh,auth:s.keys.auth}).where(eq(pushSubscriptions.id,existing.id));
  else await db.insert(pushSubscriptions).values({userId:user.id,endpoint:s.endpoint,p256dh:s.keys.p256dh,auth:s.keys.auth});
  return NextResponse.json({ok:true});
}
