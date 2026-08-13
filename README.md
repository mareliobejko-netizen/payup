# PayUp

App mobile-first per gestire penitenze tra amici, verificarle con prove e voti e condividere facoltativamente le prove approvate su **The Wall**.

## Funzioni incluse

- Login/register semplice con username, email e password
- Password hash bcrypt + sessioni tramite cookie HttpOnly
- Più gruppi per ogni utente
- Creazione gruppo e ingresso tramite codice invito
- Selettore del gruppo attivo
- Penitenze separate per gruppo
- Prove foto/video tramite Vercel Blob
- Votazione `CONFERMO` / `FAKE`
- Blocco autovoto e doppio voto
- Soglia configurabile di voti per completare una prova
- Ranking **Hall of Shame** per gruppo
- **The Wall**: feed pubblico delle sole prove approvate e rese pubbliche
- Like ai post pubblici

## Stack

- Next.js 16 + TypeScript
- Tailwind CSS 4
- Neon PostgreSQL
- Drizzle ORM
- Vercel Blob
- bcryptjs

## Variabili ambiente

Crea `.env` e `.env.local` con:

```env
DATABASE_URL="postgresql://..."
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

Non servono chiavi Clerk.

## Aggiornamento dal repository PayUp precedente

Conserva i tuoi `.env` / `.env.local`, poi usa questa nuova cartella completa e lancia:

```powershell
npm install
npm run db:friends-migrate
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

`db:friends-migrate` aggiunge in modo non distruttivo:

- `users.password_hash`
- tabella `sessions`
- `proofs.is_public`
- `proofs.published_at`
- tabella `proof_likes`
- indici necessari

Le vecchie penitenze, prove, gruppi e utenti non vengono cancellati.

## Rotte principali

- `/login`
- `/register`
- `/onboarding`
- `/` Home del gruppo attivo
- `/group` gestione e cambio gruppo
- `/add` nuova penitenza
- `/penalties/[id]` dettaglio e prova
- `/ranking` Hall of Shame
- `/feed` The Wall
- `/profile`

## Nota privacy media

In questa versione Vercel Blob usa URL pubblici. Una prova marcata "Solo nel gruppo" non compare in The Wall, ma il file è ancora accessibile a chi possiede l'URL diretto. Per privacy forte va introdotto storage privato/proxy autenticato.
