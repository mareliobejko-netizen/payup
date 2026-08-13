import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL mancante");
const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("🚀 PayUp v0.7 migration...");
  await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS wall_enabled boolean NOT NULL DEFAULT true`;
  await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS default_proof_public boolean NOT NULL DEFAULT false`;
  await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS enabled_categories text NOT NULL DEFAULT 'money,drink,food,challenge,other'`;
  await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS season_started_at timestamptz NOT NULL DEFAULT now()`;
  await sql`CREATE TABLE IF NOT EXISTS push_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint text NOT NULL UNIQUE,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    type varchar(50) NOT NULL,
    message text NOT NULL,
    href text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  console.log("✅ PayUp v0.7 database aggiornato");
}
main().catch((e)=>{console.error(e);process.exit(1)});
