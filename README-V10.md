# PayUp v1.0 Beta — Share & Moderation

## Novità
- Moderazione avanzata: sospensioni 24h / 7g / 30g, note admin, storico segnalazioni per utente.
- Link gruppo con anteprima Open Graph per WhatsApp/Telegram.
- Post The Wall con card Open Graph PayUp dedicata.
- Ogni penitenza può diventare pubblica quando viene condivisa, tramite `/challenge/[id]`.
- Pagina pubblica challenge con CTA per unirsi al gruppo.
- Story Card 9:16 per penitenze e post The Wall, condivisibile via share sheet o scaricabile.
- Possibilità di rendere nuovamente privata una penitenza condivisa.

## Migrazione
```powershell
npm install
npm run db:v10-migrate
```

## Avvio
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

## Note social preview
Le anteprime WhatsApp/Telegram vengono generate con le API Open Graph di Next.js. In produzione il link deve essere raggiungibile pubblicamente dal crawler della piattaforma.
