"use server";
import { createHash, randomBytes } from "crypto";
import { compare, hash } from "bcryptjs";
import { and, eq, ne, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { deleteCurrentSession, getCurrentSessionHash, requireUser } from "@/lib/auth";

function profileRedirect(type:"success"|"error",message:string,extra=""):never{redirect(`/profile?${type}=${encodeURIComponent(message)}${extra}`)}
const recoveryHash=(x:string)=>createHash("sha256").update(x.trim().toUpperCase()).digest("hex");

export async function updateUsernameAction(formData:FormData){const user=await requireUser();const username=formData.get("username")?.toString().trim()??"";if(username.length<3||username.length>30)profileRedirect("error","Lo username deve avere da 3 a 30 caratteri.");if(!/^[a-zA-Z0-9_.-]+$/.test(username))profileRedirect("error","Nello username usa solo lettere, numeri, punto, trattino o underscore.");const [existing]=await db.select({id:users.id}).from(users).where(and(sql`lower(${users.username})=${username.toLowerCase()}`,ne(users.id,user.id))).limit(1);if(existing)profileRedirect("error","Questo username è già utilizzato.");await db.update(users).set({username}).where(eq(users.id,user.id));revalidatePath("/profile");revalidatePath("/");profileRedirect("success","Username aggiornato.")}

export async function updatePasswordAction(formData:FormData){const user=await requireUser();const current=formData.get("currentPassword")?.toString()??"";const next=formData.get("newPassword")?.toString()??"";const confirm=formData.get("confirmPassword")?.toString()??"";if(!user.passwordHash||!(await compare(current,user.passwordHash)))profileRedirect("error","La password attuale non è corretta.");if(next.length<6)profileRedirect("error","La nuova password deve avere almeno 6 caratteri.");if(next!==confirm)profileRedirect("error","Le due nuove password non coincidono.");if(await compare(next,user.passwordHash))profileRedirect("error","La nuova password deve essere diversa da quella attuale.");await db.update(users).set({passwordHash:await hash(next,12)}).where(eq(users.id,user.id));const currentHash=await getCurrentSessionHash();if(currentHash) await db.delete(sessions).where(and(eq(sessions.userId,user.id),ne(sessions.tokenHash,currentHash)));revalidatePath("/profile");profileRedirect("success","Password aggiornata. Le altre sessioni sono state disconnesse.")}

export async function generateRecoveryCodeAction(){const user=await requireUser();const code=randomBytes(5).toString("hex").toUpperCase();await db.update(users).set({recoveryCodeHash:recoveryHash(code),recoveryCodeCreatedAt:new Date()}).where(eq(users.id,user.id));profileRedirect("success","Nuovo codice di recupero generato.",`&recovery=${encodeURIComponent(code)}`)}

export async function revokeSessionAction(formData:FormData){const user=await requireUser();const id=formData.get("sessionId")?.toString()??"";const current=await getCurrentSessionHash();const [s]=await db.select({tokenHash:sessions.tokenHash}).from(sessions).where(and(eq(sessions.id,id),eq(sessions.userId,user.id))).limit(1);if(!s)profileRedirect("error","Sessione non trovata.");if(s.tokenHash===current)profileRedirect("error","Per chiudere questa sessione usa ESCI.");await db.delete(sessions).where(eq(sessions.id,id));revalidatePath('/profile');profileRedirect('success','Dispositivo disconnesso.')}

export async function revokeOtherSessionsAction(){const user=await requireUser();const current=await getCurrentSessionHash();if(current)await db.delete(sessions).where(and(eq(sessions.userId,user.id),ne(sessions.tokenHash,current)));revalidatePath('/profile');profileRedirect('success','Tutte le altre sessioni sono state chiuse.')}

export async function updateAvatarAction(avatarUrl:string){const user=await requireUser();if(!avatarUrl||!avatarUrl.startsWith("https://"))profileRedirect("error","URL avatar non valida.");await db.update(users).set({avatarUrl}).where(eq(users.id,user.id));revalidatePath("/profile");revalidatePath("/");revalidatePath("/feed");revalidatePath("/ranking")}
export async function logoutAction(){await deleteCurrentSession();redirect("/login")}
