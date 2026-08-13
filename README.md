# PayUp

PayUp è una web app mobile-first per gruppi di amici: chi perde riceve una penitenza, carica una prova e il gruppo decide se l'ha fatta davvero.

## Stack

- Next.js 16 + TypeScript
- Tailwind CSS
- Neon PostgreSQL + Drizzle ORM
- Vercel Blob per foto/video/avatar
- Autenticazione semplice PayUp con username/email + password hashata

## Funzioni attuali

- Login e registrazione senza provider esterni
- Gruppi multipli con codice invito
- Cambio gruppo attivo
- Creazione penitenze
- Upload foto/video come prova
- Voto `CONFERMO / FAKE`
- Blocco autovoto e doppio voto
- Chiusura automatica della penitenza
- The Wall con prove pubbliche approvate e like
- Profilo con cambio username/password
- Avatar profilo
- Hall of Shame con ranking, affidabilità e titoli scherzosi
- Gestione gruppo: rinomina, rigenera codice, rimuovi membri, esci dal gruppo

## Setup

1. Copia `.env.example` in `.env.local`.
2. Imposta:

```env
DATABASE_URL="..."
BLOB_READ_WRITE_TOKEN="..."
```

3. Installa le dipendenze:

```bash
npm install
```

4. Se il database è già stato migrato alla versione Friends non serve una nuova migrazione per gli avatar/ranking/gruppi. Per una nuova installazione:

```bash
npm run db:migrate
npm run db:friends-migrate
```

5. Avvia:

```bash
npm run dev
```

## Versione 0.3

Questa versione aggiunge avatar, ranking evoluto e gestione completa dei gruppi senza modifiche distruttive al database.

## v0.4 - The Wall 2.0 + Camera

- The Wall: tabs Recenti / Popolari
- Public user profiles with public proof and received-like counts
- Direct public post pages with share button
- Proof capture: gallery, take photo, or record video on supported mobile browsers
- Public/private proof choice remains unchanged: public posts appear only after group approval

## v0.5 - Public shared posts
- Shared `/post/[id]` links are viewable without login.
- Public user profiles `/u/[username]` are viewable without login.
- Logged-out visitors see a registration CTA.
- Likes still require an account.
- Public post metadata improves link previews for image proofs.
