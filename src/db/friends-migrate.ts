import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL mancante");

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("🛠️ Aggiornamento PayUp Friends...");

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text`;
  await sql`ALTER TABLE proofs ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false`;
  await sql`ALTER TABLE proofs ADD COLUMN IF NOT EXISTS published_at timestamptz`;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash varchar(64) NOT NULL UNIQUE,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS proof_likes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      proof_id uuid NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT proof_likes_proof_user_unique UNIQUE (proof_id, user_id)
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at)`;
  await sql`CREATE INDEX IF NOT EXISTS proofs_public_idx ON proofs(is_public, published_at)`;
  await sql`CREATE INDEX IF NOT EXISTS proof_likes_proof_id_idx ON proof_likes(proof_id)`;

  console.log("✅ Database aggiornato senza cancellare penitenze o gruppi esistenti.");
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
