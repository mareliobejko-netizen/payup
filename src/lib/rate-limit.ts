import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { authAttempts } from "@/db/schema";

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const hash = (value:string)=>createHash("sha256").update(value.toLowerCase().trim()).digest("hex");

export async function checkLoginLimit(identifier:string) {
  const key = hash(identifier);
  const [row] = await db.select().from(authAttempts).where(eq(authAttempts.identifierHash,key)).limit(1);
  const now = Date.now();
  if (!row) return { allowed:true, key };
  if (row.blockedUntil && row.blockedUntil.getTime() > now) {
    return { allowed:false, key, retryMinutes: Math.max(1, Math.ceil((row.blockedUntil.getTime()-now)/60000)) };
  }
  if (now - row.windowStartedAt.getTime() > WINDOW_MS) {
    await db.update(authAttempts).set({attempts:0,windowStartedAt:new Date(),blockedUntil:null,updatedAt:new Date()}).where(eq(authAttempts.identifierHash,key));
  }
  return { allowed:true, key };
}

export async function registerLoginFailure(key:string) {
  const [row] = await db.select().from(authAttempts).where(eq(authAttempts.identifierHash,key)).limit(1);
  const now = new Date();
  if (!row) {
    await db.insert(authAttempts).values({identifierHash:key,attempts:1,windowStartedAt:now,updatedAt:now});
    return;
  }
  const freshWindow = Date.now() - row.windowStartedAt.getTime() <= WINDOW_MS;
  const attempts = freshWindow ? row.attempts + 1 : 1;
  await db.update(authAttempts).set({
    attempts,
    windowStartedAt:freshWindow?row.windowStartedAt:now,
    blockedUntil: attempts >= MAX_ATTEMPTS ? new Date(Date.now()+BLOCK_MS) : null,
    updatedAt:now,
  }).where(eq(authAttempts.identifierHash,key));
}

export async function clearLoginFailures(key:string) {
  await db.delete(authAttempts).where(eq(authAttempts.identifierHash,key));
}
