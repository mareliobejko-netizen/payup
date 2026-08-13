import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL mancante");
const sql = neon(process.env.DATABASE_URL);

async function run() {
  console.log("🚀 PayUp v0.6 migration...");
  await sql`ALTER TABLE penalties ADD COLUMN IF NOT EXISTS category varchar(30) NOT NULL DEFAULT 'challenge'`;
  await sql`ALTER TABLE penalties ADD COLUMN IF NOT EXISTS due_at timestamptz`;
  await sql`CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    type varchar(40) NOT NULL,
    title varchar(180) NOT NULL,
    message text,
    href text,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON notifications(user_id, created_at DESC)`;
  console.log("✅ PayUp v0.6 database aggiornato");
}
run().catch((e) => { console.error(e); process.exit(1); });
