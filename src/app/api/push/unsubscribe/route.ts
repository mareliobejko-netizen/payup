import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
export async function POST(req:Request){
 const user=await getCurrentUser(); if(!user) return NextResponse.json({error:"Unauthorized"},{status:401});
 const {endpoint}=await req.json(); if(endpoint) await db.delete(pushSubscriptions).where(and(eq(pushSubscriptions.userId,user.id),eq(pushSubscriptions.endpoint,endpoint)));
 return NextResponse.json({ok:true});
}
