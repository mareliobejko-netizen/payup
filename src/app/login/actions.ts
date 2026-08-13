"use server";

import { compare } from "bcryptjs";
import { or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { checkLoginLimit, clearLoginFailures, registerLoginFailure } from "@/lib/rate-limit";

function loginError(message: string, next?: string): never {
  const suffix = next ? `&next=${encodeURIComponent(next)}` : "";
  redirect(`/login?error=${encodeURIComponent(message)}${suffix}`);
}

export async function loginAction(formData: FormData) {
  const identifier = formData.get("identifier")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString() ?? "";
  const next = formData.get("next")?.toString();
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;

  if (!identifier || !password) loginError("Inserisci username o email e password.", safeNext);

  const limit = await checkLoginLimit(identifier);
  if (!limit.allowed) loginError(`Troppi tentativi. Riprova tra circa ${limit.retryMinutes} minuti.`, safeNext);

  const [user] = await db.select().from(users).where(or(sql`lower(${users.email}) = ${identifier}`, sql`lower(${users.username}) = ${identifier}`)).limit(1);
  if (!user?.passwordHash || !(await compare(password, user.passwordHash))) {
    await registerLoginFailure(limit.key);
    loginError("Username/email o password non corretti.", safeNext);
  }

  if (user.bannedUntil && user.bannedUntil > new Date()) {
    const until = new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(user.bannedUntil);
    loginError(`Account sospeso fino al ${until}.${user.banReason ? ` Motivo: ${user.banReason}` : ""}`, safeNext);
  }

  await clearLoginFailures(limit.key);
  await createSession(user.id);
  redirect(safeNext ?? "/");
}
