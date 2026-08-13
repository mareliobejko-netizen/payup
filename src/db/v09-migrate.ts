import "dotenv/config";
import { neon } from "@neondatabase/serverless";
if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL mancante");
const sql=neon(process.env.DATABASE_URL);
async function main(){
 console.log("🚀 PayUp v0.9 migration...");
 await sql`ALTER TABLE proofs ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false`;
 await sql`ALTER TABLE proofs ADD COLUMN IF NOT EXISTS hidden_at timestamptz`;
 await sql`ALTER TABLE proofs ADD COLUMN IF NOT EXISTS hidden_by uuid REFERENCES users(id) ON DELETE SET NULL`;
 console.log("✅ PayUp v0.9 database aggiornato");
}
main().catch(e=>{console.error(e);process.exit(1)});
