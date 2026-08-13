"use server";

import { compare } from "bcryptjs";
import { or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";

function loginError(message: string, next?: string): never {
  const suffix = next ? `&next=${encodeURIComponent(next)}` : "";
  redirect(`/login?error=${encodeURIComponent(message)}${suffix}`);
}

export async function loginAction(formData: FormData) {
  const identifier = formData.get("identifier")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString() ?? "";
  const next = formData.get("next")?.toString();
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;

  if (!identifier || !password) {
    loginError("Inserisci username o email e password.", safeNext);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(
      or(
        sql`lower(${users.email}) = ${identifier}`,
        sql`lower(${users.username}) = ${identifier}`
      )
    )
    .limit(1);

  if (!user?.passwordHash || !(await compare(password, user.passwordHash))) {
    loginError("Username/email o password non corretti.", safeNext);
  }

  await createSession(user.id);
  redirect(safeNext ?? "/");
}
