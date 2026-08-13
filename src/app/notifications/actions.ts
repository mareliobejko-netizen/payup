"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
export async function markAllNotificationsRead(){const user=await requireUser();await db.update(notifications).set({isRead:true}).where(and(eq(notifications.userId,user.id),eq(notifications.isRead,false)));revalidatePath("/notifications");revalidatePath("/")}
export async function markNotificationRead(formData:FormData){const user=await requireUser();const id=formData.get("id")?.toString()??"";await db.update(notifications).set({isRead:true}).where(and(eq(notifications.id,id),eq(notifications.userId,user.id)));revalidatePath("/notifications");revalidatePath("/")}
