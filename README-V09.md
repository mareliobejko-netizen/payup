# PayUp v0.9 – Beta polish

## Novità
- favicon/PWA/iPhone con teschio PayUp coerente
- moderazione globale The Wall con report, nascondi/ripristina/archivia
- profilo privato con statistiche e attività recente
- test push dal Profilo + testi push rifiniti per Android/iPhone
- onboarding iniziale più chiaro
- micro-animazioni, focus accessibile, empty states rifiniti

## Migrazione
`npm run db:v09-migrate`

## Admin The Wall
Aggiungi nel `.env.local` e su Vercel:
`PAYUP_ADMIN_EMAILS=tuamail@example.com`
Poi apri Profilo → Moderazione The Wall.
