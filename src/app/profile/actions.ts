"use server";

import { compare, hash } from "bcryptjs";
import { and, eq, ne, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { deleteCurrentSession, requireUser } from "@/lib/auth";

function profileRedirect(type: "success" | "error", message: string): never {
  redirect(`/profile?${type}=${encodeURIComponent(message)}`);
}

export async function updateUsernameAction(formData: FormData) {
  const user = await requireUser();
  const username = formData.get("username")?.toString().trim() ?? "";

  if (username.length < 3 || username.length > 30) {
    profileRedirect("error", "Lo username deve avere da 3 a 30 caratteri.");
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    profileRedirect("error", "Nello username usa solo lettere, numeri, punto, trattino o underscore.");
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        sql`lower(${users.username}) = ${username.toLowerCase()}`,
        ne(users.id, user.id)
      )
    )
    .limit(1);

  if (existing) {
    profileRedirect("error", "Questo username è già utilizzato.");
  }

  await db.update(users).set({ username }).where(eq(users.id, user.id));
  revalidatePath("/profile");
  revalidatePath("/");
  profileRedirect("success", "Username aggiornato.");
}

export async function updatePasswordAction(formData: FormData) {
  const user = await requireUser();
  const currentPassword = formData.get("currentPassword")?.toString() ?? "";
  const newPassword = formData.get("newPassword")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

  if (!user.passwordHash || !(await compare(currentPassword, user.passwordHash))) {
    profileRedirect("error", "La password attuale non è corretta.");
  }

  if (newPassword.length < 6) {
    profileRedirect("error", "La nuova password deve avere almeno 6 caratteri.");
  }

  if (newPassword !== confirmPassword) {
    profileRedirect("error", "Le due nuove password non coincidono.");
  }

  if (await compare(newPassword, user.passwordHash)) {
    profileRedirect("error", "La nuova password deve essere diversa da quella attuale.");
  }

  const passwordHash = await hash(newPassword, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));
  revalidatePath("/profile");
  profileRedirect("success", "Password aggiornata correttamente.");
}


export async function updateAvatarAction(avatarUrl: string) {
  const user = await requireUser();
  if (!avatarUrl || !avatarUrl.startsWith("https://")) {
    profileRedirect("error", "URL avatar non valida.");
  }

  await db.update(users).set({ avatarUrl }).where(eq(users.id, user.id));
  revalidatePath("/profile");
  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/ranking");
}

export async function logoutAction() {
  await deleteCurrentSession();
  redirect("/login");
}
