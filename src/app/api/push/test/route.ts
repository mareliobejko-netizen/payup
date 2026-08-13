import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sendPushToUser } from "@/lib/push";
export async function POST(){const user=await getCurrentUser();if(!user)return NextResponse.json({error:'Non autenticato'},{status:401});await sendPushToUser(user.id,{title:'PayUp funziona 🔔',body:'Test riuscito: le notifiche push sono attive su questo dispositivo.',url:'/notifications'});return NextResponse.json({ok:true})}
