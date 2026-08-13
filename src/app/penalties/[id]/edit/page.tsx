import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { groupMembers, penalties } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import EditPenaltyForm from "./edit-form";
type Props={params:Promise<{id:string}>};
export default async function Page({params}:Props){const {id}=await params;const user=await requireUser();const [p]=await db.select().from(penalties).where(eq(penalties.id,id)).limit(1);if(!p)notFound();const [m]=await db.select({role:groupMembers.role}).from(groupMembers).where(and(eq(groupMembers.groupId,p.groupId),eq(groupMembers.userId,user.id))).limit(1);if(!m||(p.createdBy!==user.id&&m.role!=="admin")||p.status==="completed")notFound();return <main className="min-h-screen bg-zinc-950 text-white"><div className="mx-auto max-w-md px-5 py-5"><div className="flex items-center gap-3"><Link href={`/penalties/${id}`} className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900"><ArrowLeft size={20}/></Link><div><p className="text-xs font-black uppercase tracking-[.25em] text-lime-400">PayUp</p><h1 className="text-xl font-black">Modifica penitenza</h1></div></div><div className="mt-7"><EditPenaltyForm penalty={p}/></div></div></main>}
