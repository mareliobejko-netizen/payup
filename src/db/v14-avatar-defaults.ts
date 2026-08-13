import "dotenv/config";
import { isNull } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";

async function run() {
  console.log("💀 PayUp Avatar Pack: assegno il teschio base ai profili senza avatar...");
  const updated = await db.update(users).set({ avatarUrl: "/avatars/classic.svg" }).where(isNull(users.avatarUrl)).returning({ id: users.id });
  console.log(`✅ ${updated.length} profili aggiornati.`);
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
