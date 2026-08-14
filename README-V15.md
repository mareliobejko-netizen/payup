# PayUp v1.5 — Avatar CMS

## Novità
- Pannello globale `/admin/avatars` per gestire il catalogo avatar senza modificare il codice.
- Tipi: Base, Stagionale, Sbloccabile.
- Date stagionali ricorrenti in formato `MM-GG`.
- Requisiti: stagioni vinte, volte Trending, penitenze completate, euro pagati.
- Attiva/disattiva, riordina e conta quanti utenti usano ogni avatar.
- Upload nuovi avatar su Vercel Blob.
- Sblocco manuale da admin per avatar speciali.
- Registrazione e Profilo leggono il catalogo dal database.

## Preset inclusi
- Ferragosto Drink: 08-01 → 08-31
- Halloween: 10-01 → 11-02
- Natale: 12-01 → 01-06
- Champion Skull: 1 stagione vinta (manuale finché non viene archiviato il vincitore di stagione)
- Fire Skull: 5 contenuti Trending (al momento: post pubblici con almeno 5 like)
- Money Skull: 100 € pagati in penitenze

## Migrazione
```powershell
npm install
npm run db:v15-avatar-cms
npm run dev
```

L'admin globale è definito tramite `PAYUP_ADMIN_EMAILS` come per la moderazione The Wall.
