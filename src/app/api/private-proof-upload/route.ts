import { put } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { groupMembers, penalties } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
export async function POST(req:NextRequest){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:'Non autenticato'},{status:401});
 const token=process.env.PRIVATE_BLOB_READ_WRITE_TOKEN;if(!token)return NextResponse.json({error:'Storage privato non configurato'},{status:503});
 const penaltyId=req.nextUrl.searchParams.get('penaltyId')??'';const filename=req.nextUrl.searchParams.get('filename')??`proof-${Date.now()}.webp`;
 const [p]=await db.select({assignedTo:penalties.assignedTo,groupId:penalties.groupId,status:penalties.status}).from(penalties).where(eq(penalties.id,penaltyId)).limit(1);
 if(!p||p.assignedTo!==user.id||p.status!=='pending')return NextResponse.json({error:'Upload non autorizzato'},{status:403});
 const [m]=await db.select({id:groupMembers.id}).from(groupMembers).where(and(eq(groupMembers.groupId,p.groupId),eq(groupMembers.userId,user.id))).limit(1);if(!m)return NextResponse.json({error:'Non autorizzato'},{status:403});
 const contentLength=Number(req.headers.get('content-length')||0);if(contentLength>4*1024*1024)return NextResponse.json({error:'Per le prove private usa una foto sotto 4 MB. I video privati verranno aggiunti in una versione successiva.'},{status:413});
 if(!req.body)return NextResponse.json({error:'File mancante'},{status:400});
 try{const blob=await put(`private-proofs/${penaltyId}/${filename}`,req.body,{access:'private',addRandomSuffix:true,contentType:req.headers.get('content-type')||undefined,token});return NextResponse.json({url:blob.url});}catch(e){console.error(e);return NextResponse.json({error:'Upload privato fallito'},{status:500})}
}
