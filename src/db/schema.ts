import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  inviteCode: varchar("invite_code", { length: 20 }).notNull().unique(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  verificationVotes: integer("verification_votes").default(3).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const groupMembers = pgTable(
  "group_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    role: varchar("role", { length: 20 }).default("member").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique().on(table.groupId, table.userId)]
);

export const penalties = pgTable("penalties", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  assignedTo: uuid("assigned_to").references(() => users.id).notNull(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  amountCents: integer("amount_cents"),
  status: varchar("status", { length: 30 }).default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const proofs = pgTable("proofs", {
  id: uuid("id").defaultRandom().primaryKey(),
  penaltyId: uuid("penalty_id").references(() => penalties.id, { onDelete: "cascade" }).notNull(),
  uploadedBy: uuid("uploaded_by").references(() => users.id).notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: varchar("media_type", { length: 20 }).default("image"),
  caption: text("caption"),
  isPublic: boolean("is_public").default(false).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    proofId: uuid("proof_id").references(() => proofs.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    confirmed: boolean("confirmed").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique().on(table.proofId, table.userId)]
);

export const proofLikes = pgTable(
  "proof_likes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    proofId: uuid("proof_id").references(() => proofs.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique().on(table.proofId, table.userId)]
);
