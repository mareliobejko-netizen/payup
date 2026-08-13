"use server";
import { createHash } from "crypto";
import { hash } from "bcryptjs";
import { eq, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
const h=(x:string)=>createHash("sha256").update(x.trim().toUpperCase()).digest("hex");
export async function resetPasswordAction(formData:FormData){
 const identifier=formData.get('identifier')?.toString().trim().toLowerCase()??'';const code=formData.get('code')?.toString().trim().toUpperCase()??'';const password=formData.get('password')?.toString()??'';const confirm=formData.get('confirm')?.toString()??'';
 const fail=(m:string):never=>redirect(`/reset-password?identifier=${encodeURIComponent(identifier)}&code=${encodeURIComponent(code)}&error=${encodeURIComponent(m)}`);
 if(password.length<6)fail('La nuova password deve avere almeno 6 caratteri.');if(password!==confirm)fail('Le password non coincidono.');
 const [u]=await db.select().from(users).where(or(sql`lower(${users.email})=${identifier}`,sql`lower(${users.username})=${identifier}`)).limit(1);
 if(!u?.recoveryCodeHash||u.recoveryCodeHash!==h(code))fail('Codice di recupero non valido.');
 await db.update(users).set({passwordHash:await hash(password,12),recoveryCodeHash:null,recoveryCodeCreatedAt:null}).where(eq(users.id,u.id));
 await db.delete(sessions).where(eq(sessions.userId,u.id));redirect('/login?success='+encodeURIComponent('Password reimpostata. Accedi con quella nuova.'));
}
