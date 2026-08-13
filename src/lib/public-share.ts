import { and, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { groups, penalties, proofLikes, proofs, users } from "@/db/schema";

export async function getPublicPost(id: string) {
  const [post] = await db.select({proofId:proofs.id,mediaUrl:proofs.mediaUrl,mediaType:proofs.mediaType,caption:proofs.caption,publishedAt:proofs.publishedAt,username:users.username,avatarUrl:users.avatarUrl,groupName:groups.name,inviteCode:groups.inviteCode,penaltyTitle:penalties.title,penaltyId:penalties.id,likes:sql<number>`count(${proofLikes.id})`}).from(proofs).innerJoin(penalties,eq(proofs.penaltyId,penalties.id)).innerJoin(users,eq(proofs.uploadedBy,users.id)).innerJoin(groups,eq(penalties.groupId,groups.id)).leftJoin(proofLikes,eq(proofLikes.proofId,proofs.id)).where(and(eq(proofs.id,id),eq(proofs.isPublic,true),eq(proofs.isHidden,false),eq(penalties.status,"completed"),isNotNull(proofs.publishedAt))).groupBy(proofs.id,users.username,users.avatarUrl,groups.name,groups.inviteCode,penalties.title,penalties.id).limit(1);
  return post ?? null;
}

export async function getPublicChallenge(id: string) {
  const [item] = await db.select({id:penalties.id,title:penalties.title,description:penalties.description,category:penalties.category,amountCents:penalties.amountCents,dueAt:penalties.dueAt,status:penalties.status,createdAt:penalties.createdAt,publicSharedAt:penalties.publicSharedAt,username:users.username,avatarUrl:users.avatarUrl,groupName:groups.name,inviteCode:groups.inviteCode}).from(penalties).innerJoin(users,eq(penalties.assignedTo,users.id)).innerJoin(groups,eq(penalties.groupId,groups.id)).where(and(eq(penalties.id,id),eq(penalties.publicShare,true))).limit(1);
  return item ?? null;
}

export async function getInviteByCode(code: string) {
  const [group] = await db.select({name:groups.name,inviteCode:groups.inviteCode}).from(groups).where(eq(groups.inviteCode,code.toUpperCase())).limit(1);
  return group ?? null;
}
