import { db } from "@/db";
import { notifications } from "@/db/schema";

export async function notify(input: {
  userId: string;
  groupId?: string | null;
  type: string;
  title: string;
  message?: string | null;
  href?: string | null;
}) {
  await db.insert(notifications).values({
    userId: input.userId,
    groupId: input.groupId ?? null,
    type: input.type,
    title: input.title,
    message: input.message ?? null,
    href: input.href ?? null,
  });
}
