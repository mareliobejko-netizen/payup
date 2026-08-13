"use server";

import { hash } from "bcryptjs";
import { or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";

function registerError(message: string, next?: string): never {
  const suffix = next ? `&next=${encodeURIComponent(next)}` : "";
  redirect(`/register?error=${encodeURIComponent(message)}${suffix}`);
}

export async function registerAction(formData: FormData) {
  const username = formData.get("username")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";
  const next = formData.get("next")?.toString();
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;

  if (!username || username.length < 3 || username.length > 30) {
    registerError("Lo username deve avere da 3 a 30 caratteri.", safeNext);
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    registerError("Nello username usa solo lettere, numeri, punto, trattino o underscore.", safeNext);
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    registerError("Inserisci un indirizzo email valido.", safeNext);
  }
  if (password.length < 6) {
    registerError("La password deve avere almeno 6 caratteri.", safeNext);
  }
  if (password !== confirmPassword) {
    registerError("Le due password non coincidono.", safeNext);
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      or(
        sql`lower(${users.email}) = ${email}`,
        sql`lower(${users.username}) = ${username.toLowerCase()}`
      )
    )
    .limit(1);

  if (existing) {
    registerError("Username o email già utilizzati.", safeNext);
  }

  const passwordHash = await hash(password, 12);
  const [user] = await db.insert(users).values({ username, email, passwordHash }).returning();
  await createSession(user.id);
  redirect(safeNext ?? "/onboarding");
}
