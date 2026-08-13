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
  recoveryCodeHash: varchar("recovery_code_hash", { length: 64 }),
  recoveryCodeCreatedAt: timestamp("recovery_code_created_at", { withTimezone: true }),
  bannedUntil: timestamp("banned_until", { withTimezone: true }),
  banReason: text("ban_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  userAgent: text("user_agent"),
  deviceName: varchar("device_name", { length: 120 }),
  ipHash: varchar("ip_hash", { length: 64 }),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  inviteCode: varchar("invite_code", { length: 20 }).notNull().unique(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  verificationVotes: integer("verification_votes").default(3).notNull(),
  wallEnabled: boolean("wall_enabled").default(true).notNull(),
  defaultProofPublic: boolean("default_proof_public").default(false).notNull(),
  enabledCategories: text("enabled_categories").default("money,drink,food,challenge,other").notNull(),
  seasonStartedAt: timestamp("season_started_at", { withTimezone: true }).defaultNow().notNull(),
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
  category: varchar("category", { length: 30 }).default("challenge").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  status: varchar("status", { length: 30 }).default("pending").notNull(),
  publicShare: boolean("public_share").default(false).notNull(),
  publicSharedAt: timestamp("public_shared_at", { withTimezone: true }),
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
  isHidden: boolean("is_hidden").default(false).notNull(),
  hiddenAt: timestamp("hidden_at", { withTimezone: true }),
  hiddenBy: uuid("hidden_by").references(() => users.id, { onDelete: "set null" }),
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


export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 40 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  message: text("message"),
  href: text("href"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});


export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  type: varchar("type", { length: 50 }).notNull(),
  message: text("message").notNull(),
  href: text("href"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});


export const authAttempts = pgTable("auth_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  identifierHash: varchar("identifier_hash", { length: 64 }).notNull().unique(),
  attempts: integer("attempts").default(0).notNull(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true }).defaultNow().notNull(),
  blockedUntil: timestamp("blocked_until", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const proofReports = pgTable(
  "proof_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    proofId: uuid("proof_id").references(() => proofs.id, { onDelete: "cascade" }).notNull(),
    reportedBy: uuid("reported_by").references(() => users.id, { onDelete: "cascade" }).notNull(),
    reason: varchar("reason", { length: 40 }).notNull(),
    note: text("note"),
    status: varchar("status", { length: 20 }).default("open").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique().on(table.proofId, table.reportedBy)]
);


export const moderationNotes = pgTable("moderation_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  targetUserId: uuid("target_user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  adminUserId: uuid("admin_user_id").references(() => users.id, { onDelete: "set null" }),
  note: text("note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
