import { createHash, randomBytes } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { groupMembers, groups, sessions, users } from "@/db/schema";

const SESSION_COOKIE = "payup_session";
const ACTIVE_GROUP_COOKIE = "payup_group_id";
const SESSION_DAYS = 30;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function deviceFromUA(ua: string) {
  if (!ua) return "Dispositivo sconosciuto";
  const os = /iPhone|iPad/i.test(ua) ? "iPhone/iPad" : /Android/i.test(ua) ? "Android" : /Windows/i.test(ua) ? "Windows" : /Macintosh|Mac OS X/i.test(ua) ? "Mac" : /Linux/i.test(ua) ? "Linux" : "Dispositivo";
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser";
  return `${os} · ${browser}`;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "";

  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
    userAgent: ua || null,
    deviceName: deviceFromUA(ua),
    ipHash: ip ? hashToken(ip) : null,
    lastSeenAt: new Date(),
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentSessionHash() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token ? hashToken(token) : null;
}

export async function deleteCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  store.delete(SESSION_COOKIE);
  store.delete(ACTIVE_GROUP_COOKIE);
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const [result] = await db
    .select({ user: users, sessionId: sessions.id })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!result) return null;
  void db.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.id, result.sessionId)).catch(()=>{});
  return result.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function getMemberships(userId: string) {
  return db
    .select({
      membershipId: groupMembers.id,
      role: groupMembers.role,
      groupId: groups.id,
      name: groups.name,
      inviteCode: groups.inviteCode,
      verificationVotes: groups.verificationVotes,
      wallEnabled: groups.wallEnabled,
      defaultProofPublic: groups.defaultProofPublic,
      enabledCategories: groups.enabledCategories,
      seasonStartedAt: groups.seasonStartedAt,
      createdAt: groups.createdAt,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, userId));
}

export async function getActiveGroup(userId: string) {
  const memberships = await getMemberships(userId);
  if (!memberships.length) return null;
  const store = await cookies();
  const requested = store.get(ACTIVE_GROUP_COOKIE)?.value;
  return memberships.find((item) => item.groupId === requested) ?? memberships[0];
}

export async function requirePayupContext() {
  const user = await requireUser();
  const group = await getActiveGroup(user.id);
  if (!group) redirect("/onboarding");
  return { user, group };
}

export async function isGroupMember(groupId: string, userId: string) {
  const [membership] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .limit(1);
  return Boolean(membership);
}
