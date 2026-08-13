PAYUP v0.6 — LANDING + INVITI + PENITENZE + NOTIFICHE

NOVITA
- Landing page pubblica per utenti non loggati.
- The Wall consultabile anche senza account; like solo dopo login.
- Link invito diretto /join/CODICE + QR code + copia/condividi.
- Selettore gruppi migliorato e gestione admin già completa.
- Immagini delle prove cliccabili e ingrandibili a schermo intero.
- Categorie penitenza: Soldi, Bere, Cibo, Challenge, Altro.
- Scadenza facoltativa con evidenza quando è superata.
- Preset rapidi e Ruota della Sfiga.
- Modifica e cancellazione penitenza per creatore/admin (non dopo completamento).
- Notifiche interne: assegnazione, prova caricata, prova approvata, manca 1 voto, prova bocciata.

DOPO AVER ESTRATTO
1. Conserva/rimetti .env.local con DATABASE_URL e BLOB_READ_WRITE_TOKEN.
2. npm install
3. npm run db:v06-migrate
4. rimuovi .next se esiste
5. npm run dev

NOTA QR
Il QR viene renderizzato tramite QuickChart a partire dal link invito. Il codice/link restano comunque copiabili anche se il servizio QR esterno non risponde.
