import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, Bell, Check, CheckCheck } from "lucide-react";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { markAllNotificationsRead, markNotificationRead } from "./actions";
export const dynamic="force-dynamic";
export default async function NotificationsPage(){
 const user=await requireUser(); const items=await db.select().from(notifications).where(eq(notifications.userId,user.id)).orderBy(desc(notifications.createdAt)).limit(100);
 return <main className="min-h-screen bg-zinc-950 text-white"><div className="mx-auto min-h-screen max-w-md border-x border-white/5 px-5 py-5"><header className="flex items-center gap-3"><Link href="/" className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900"><ArrowLeft size={20}/></Link><div className="flex-1"><p className="text-xs font-black uppercase tracking-[.25em] text-lime-400">PayUp</p><h1 className="text-xl font-black">Notifiche</h1></div>{items.some(x=>!x.isRead)&&<form action={markAllNotificationsRead}><button title="Segna tutte lette" className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-lime-400"><CheckCheck size={19}/></button></form>}</header>
 <div className="mt-7 space-y-3">{items.length===0?<div className="rounded-3xl border border-dashed border-white/10 p-10 text-center"><Bell className="mx-auto text-zinc-600"/><p className="mt-3 font-black">Nessuna notifica</p></div>:items.map(n=><div key={n.id} className={`rounded-3xl border p-4 ${n.isRead?"border-white/5 bg-zinc-900/60":"border-lime-400/20 bg-lime-400/5"}`}><div className="flex gap-3"><div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${n.isRead?"bg-zinc-700":"bg-lime-400"}`}/><div className="min-w-0 flex-1"><p className="font-black">{n.title}</p>{n.message&&<p className="mt-1 text-sm leading-5 text-zinc-400">{n.message}</p>}<p className="mt-2 text-xs text-zinc-600">{new Intl.DateTimeFormat("it-IT",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(n.createdAt)}</p><div className="mt-3 flex gap-2">{n.href&&<Link href={n.href} className="rounded-xl bg-lime-400 px-3 py-2 text-xs font-black text-black">APRI</Link>}{!n.isRead&&<form action={markNotificationRead}><input type="hidden" name="id" value={n.id}/><button className="flex items-center gap-1 rounded-xl bg-zinc-800 px-3 py-2 text-xs font-black"><Check size={14}/>LETTA</button></form>}</div></div></div></div>)}</div></div></main>
}
