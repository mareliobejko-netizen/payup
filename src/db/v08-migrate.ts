import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL mancante");
const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("🛡️ PayUp v0.8 migration...");
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_code_hash varchar(64)`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_code_created_at timestamptz`;
  await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_agent text`;
  await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS device_name varchar(120)`;
  await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_hash varchar(64)`;
  await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT now()`;
  await sql`CREATE TABLE IF NOT EXISTS auth_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier_hash varchar(64) NOT NULL UNIQUE,
    attempts integer NOT NULL DEFAULT 0,
    window_started_at timestamptz NOT NULL DEFAULT now(),
    blocked_until timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS proof_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    proof_id uuid NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
    reported_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason varchar(40) NOT NULL,
    note text,
    status varchar(20) NOT NULL DEFAULT 'open',
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(proof_id, reported_by)
  )`;
  console.log("✅ PayUp v0.8 database aggiornato");
}
main().catch((e)=>{console.error(e);process.exit(1)});
