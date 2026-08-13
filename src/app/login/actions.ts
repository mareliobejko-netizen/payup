"use server";

import { compare } from "bcryptjs";
import { or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";

function loginError(message: string): never {
  redirect(`/login?error=${encodeURIComponent(message)}`);
}

export async function loginAction(formData: FormData) {
  const identifier = formData.get("identifier")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString() ?? "";

  if (!identifier || !password) {
    loginError("Inserisci username o email e password.");
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
    loginError("Username/email o password non corretti.");
  }

  await createSession(user.id);
  redirect("/");
}
