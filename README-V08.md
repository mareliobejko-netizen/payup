# PayUp v0.8 — Reliability, UX & Social

## Nuovo
- Rate limit login: 5 tentativi / 15 minuti.
- Codice di recupero password generabile dal Profilo.
- Gestione sessioni/dispositivi collegati e revoca remota.
- Cambio password: disconnette automaticamente le altre sessioni.
- Compressione automatica immagini lato browser (WebP quando conviene).
- Limite video 80 MB e upload diretto a Blob.
- Toast globali e conferme prima di cancellazioni/uscite/rimozioni.
- The Wall: Nuove, Top, Trending 24h, Trending 7 giorni.
- Ricerca utenti pubblica.
- Segnalazione post pubblici.
- Profilo pubblico con like medi, badge e prova più popolare.
- Supporto opzionale a Vercel Private Blob per foto private del gruppo.

## Migrazione
```powershell
npm install
npm run db:v08-migrate
```

## Storage privato opzionale
Crea un secondo Vercel Blob store impostato su **Private** e aggiungi:

```env
PRIVATE_BLOB_READ_WRITE_TOKEN="token_del_blob_privato"
NEXT_PUBLIC_PRIVATE_PROOFS="true"
```

Le foto private fino a 4 MB vengono caricate nel private store e servite tramite `/api/private-media`, che verifica sessione e appartenenza al gruppo.

### Limite attuale
I video privati non vengono ancora trasferiti nel Private Blob: restano nello store pubblico ma non sono esposti nell'interfaccia pubblica. Per privacy forte anche sui video servirà passare a client upload/signed URL sul private store.
