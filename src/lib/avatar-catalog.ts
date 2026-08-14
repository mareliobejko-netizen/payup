import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { avatars, penalties, proofLikes, proofs, userAvatarUnlocks, users } from "@/db/schema";

export type ManagedAvatar = typeof avatars.$inferSelect;

export const AVATAR_TYPE_LABELS: Record<string,string> = {
  base: "Base",
  seasonal: "Stagionale",
  unlockable: "Sbloccabile",
};

export const UNLOCK_LABELS: Record<string,string> = {
  season_wins: "Stagioni vinte",
  trending_count: "Volte Trending",
  completed_penalties: "Penitenze completate",
  spent_euros: "€ pagati in penitenze",
};

function mdNow(date = new Date()) {
  return `${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export function isSeasonalAvailable(avatar: ManagedAvatar, date = new Date()) {
  if (avatar.type !== "seasonal") return true;
  if (!avatar.seasonalStart || !avatar.seasonalEnd) return false;
  const now = mdNow(date);
  const start = avatar.seasonalStart;
  const end = avatar.seasonalEnd;
  return start <= end ? now >= start && now <= end : now >= start || now <= end;
}

export async function getAvatarCatalog() {
  return db.select().from(avatars).orderBy(asc(avatars.sortOrder), asc(avatars.createdAt));
}

export async function getRegistrationAvatars() {
  const all = await getAvatarCatalog();
  return all.filter((a) => a.active && (a.type === "base" || (a.type === "seasonal" && isSeasonalAvailable(a))));
}

async function requirementProgress(userId: string, avatar: ManagedAvatar) {
  switch (avatar.unlockType) {
    case "completed_penalties": {
      const [r] = await db.select({v:sql<number>`count(*)`}).from(penalties).where(and(eq(penalties.assignedTo,userId),eq(penalties.status,"completed")));
      return Number(r?.v ?? 0);
    }
    case "spent_euros": {
      const [r] = await db.select({v:sql<number>`coalesce(sum(${penalties.amountCents}),0)`}).from(penalties).where(and(eq(penalties.assignedTo,userId),eq(penalties.status,"completed")));
      return Number(r?.v ?? 0) / 100;
    }
    case "trending_count": {
      const rows = await db.select({id:proofs.id, likes:sql<number>`count(${proofLikes.id})`})
        .from(proofs).leftJoin(proofLikes,eq(proofLikes.proofId,proofs.id))
        .where(and(eq(proofs.uploadedBy,userId),eq(proofs.isPublic,true),eq(proofs.isHidden,false)))
        .groupBy(proofs.id);
      return rows.filter((r)=>Number(r.likes)>=5).length;
    }
    case "season_wins":
      return 0; // viene sbloccato manualmente dall'admin finché non archiviamo i vincitori di stagione.
    default:
      return 0;
  }
}

export async function getAvatarOptionsForUser(userId: string) {
  const all = (await getAvatarCatalog()).filter(a=>a.active);
  const unlockedRows = await db.select({avatarId:userAvatarUnlocks.avatarId}).from(userAvatarUnlocks).where(eq(userAvatarUnlocks.userId,userId));
  const unlocked = new Set(unlockedRows.map(x=>x.avatarId));
  const result=[] as Array<ManagedAvatar & {available:boolean;progress:number;required:number;reason?:string}>;
  for (const avatar of all) {
    let available = avatar.type === "base" || (avatar.type === "seasonal" && isSeasonalAvailable(avatar));
    const required = Number(avatar.unlockValue ?? 0);
    let progress = 0;
    if (avatar.type === "unlockable") {
      if (avatar.keepAfterUnlock && unlocked.has(avatar.id)) available = true;
      else {
        progress = await requirementProgress(userId, avatar);
        available = required > 0 && progress >= required;
      }
    }
    result.push({...avatar,available,progress,required});
  }
  return result;
}

export async function unlockAvatarIfEligible(userId:string, avatarId:string) {
  const [avatar]=await db.select().from(avatars).where(eq(avatars.id,avatarId)).limit(1);
  if(!avatar||!avatar.active) return {ok:false,reason:"Avatar non disponibile."};
  if(avatar.type==='base') return {ok:true,avatar};
  if(avatar.type==='seasonal') return isSeasonalAvailable(avatar)?{ok:true,avatar}:{ok:false,reason:"Questo avatar stagionale non è disponibile oggi."};
  const [grant]=await db.select({id:userAvatarUnlocks.id}).from(userAvatarUnlocks).where(and(eq(userAvatarUnlocks.userId,userId),eq(userAvatarUnlocks.avatarId,avatar.id))).limit(1);
  if(grant&&avatar.keepAfterUnlock) return {ok:true,avatar};
  const progress=await requirementProgress(userId,avatar); const required=Number(avatar.unlockValue??0);
  if(required<=0||progress<required) return {ok:false,reason:`Avatar ancora bloccato (${progress}/${required}).`};
  if(avatar.keepAfterUnlock) await db.insert(userAvatarUnlocks).values({userId,avatarId:avatar.id}).onConflictDoNothing();
  return {ok:true,avatar};
}

export async function isRegistrationAvatarAllowed(imageUrl:string) {
  const available=await getRegistrationAvatars();
  return available.some(a=>a.imageUrl===imageUrl);
}
