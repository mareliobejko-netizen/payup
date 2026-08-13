# PayUp v0.7 — PWA + Push + Seasons + Roles

## Dopo aver estratto lo ZIP
1. Mantieni il tuo `.env.local`.
2. `npm install`
3. `npm run db:v07-migrate`
4. `npm run push:keys`
5. Copia le 3 variabili VAPID generate in `.env.local` e nelle Environment Variables di Vercel.
6. `npm run dev`

## Nuove variabili
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (es. `mailto:tuamail@example.com`)

## Cosa cambia
- PWA installabile, icone, splash/standalone e fallback offline.
- Push notifications con Service Worker + Web Push/VAPID.
- Profilo pubblico con badge, statistiche e prova più popolare.
- Ranking Totale / Questo mese / Stagione.
- Nuova stagione avviabile dagli admin senza cancellare lo storico.
- Activity log del gruppo.
- Ruoli: admin / moderatore / membro.
- Impostazioni gruppo: soglia voti, categorie, The Wall, privacy default.
- Skeleton, error UI, safe-area e swipe tra le tab principali.

## Ruoli
- Admin: tutto + impostazioni + ruoli + nuova stagione.
- Moderatore: può rimuovere membri normali.
- Membro: uso normale dell'app.

## Nota iPhone
Per installare: Condividi → Aggiungi alla schermata Home. Le push richiedono HTTPS e, su iPhone, l'app installata come web app nelle versioni moderne di iOS.
