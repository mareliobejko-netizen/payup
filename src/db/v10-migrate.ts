import "dotenv/config";
import { neon } from "@neondatabase/serverless";
if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL mancante");
const sql=neon(process.env.DATABASE_URL);
async function main(){
 console.log("🚀 PayUp v1.0 share & moderation migration...");
 await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_until timestamptz`;
 await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason text`;
 await sql`ALTER TABLE penalties ADD COLUMN IF NOT EXISTS public_share boolean NOT NULL DEFAULT false`;
 await sql`ALTER TABLE penalties ADD COLUMN IF NOT EXISTS public_shared_at timestamptz`;
 await sql`CREATE TABLE IF NOT EXISTS moderation_notes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), target_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, admin_user_id uuid REFERENCES users(id) ON DELETE SET NULL, note text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`;
 console.log("✅ PayUp v1.0 database aggiornato");
}
main().catch(e=>{console.error(e);process.exit(1)});
