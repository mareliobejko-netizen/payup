import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { groupMembers, users } from "@/db/schema";
import { requirePayupContext } from "@/lib/auth";
import PenaltyForm from "./penalty-form";
export const dynamic="force-dynamic";
export default async function AddPenaltyPage(){const {group}=await requirePayupContext(); const members=await db.select({id:users.id,username:users.username,avatarUrl:users.avatarUrl}).from(groupMembers).innerJoin(users,eq(groupMembers.userId,users.id)).where(eq(groupMembers.groupId,group.groupId)); return <main className="min-h-screen bg-zinc-950 text-white"><div className="mx-auto min-h-screen max-w-md border-x border-white/5 pb-10"><header className="flex items-center gap-4 border-b border-white/5 px-5 py-5"><Link href="/" className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900"><ArrowLeft size={20}/></Link><div><p className="text-xs font-bold uppercase tracking-[.25em] text-lime-400">{group.name}</p><h1 className="text-xl font-black">Nuova sconfitta 💀</h1></div></header><PenaltyForm members={members}/></div></main>}
