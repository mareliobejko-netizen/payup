import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users, groups, groupMembers } from "./schema";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL mancante");

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function seed() {
  console.log("🌱 Creazione dati demo...");

  for (const [username, email] of [
    ["Elio", "elio@payup.local"],
    ["Marco", "marco@payup.local"],
    ["Luca", "luca@payup.local"],
    ["Andrea", "andrea@payup.local"],
  ]) {
    await db.insert(users).values({ username, email }).onConflictDoNothing();
  }

  const allUsers = await db.select().from(users);
  const creator = allUsers.find((u) => u.email === "elio@payup.local");
  if (!creator) throw new Error("Impossibile trovare Elio");

  await db.insert(groups).values({
    name: "The Losers Club",
    inviteCode: "PAYUP01",
    createdBy: creator.id,
    verificationVotes: 3,
  }).onConflictDoNothing();

  const allGroups = await db.select().from(groups);
  const group = allGroups.find((g) => g.inviteCode === "PAYUP01");
  if (!group) throw new Error("Gruppo non trovato");

  for (const user of allUsers) {
    await db.insert(groupMembers).values({
      groupId: group.id,
      userId: user.id,
      role: user.email === "elio@payup.local" ? "admin" : "member",
    }).onConflictDoNothing();
  }

  console.log("✅ Seed completato");
  console.log(`👥 Gruppo: ${group.name}`);
  console.log(`🔑 Codice: ${group.inviteCode}`);
}

seed().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
