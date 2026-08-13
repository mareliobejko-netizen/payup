# PayUp v1.4 – Avatar Pack

## Novità
- 10 avatar teschio base disponibili a tutti.
- Scelta avatar durante la registrazione.
- Cambio avatar dal Profilo senza upload.
- Resta disponibile il caricamento di una foto personale.
- Badge dinamici sugli avatar: Admin, Moderatore, Trending, Loser, Uomo di parola, Sponsor.
- Struttura pronta per avatar stagionali, achievement e Season Winner.

## Aggiornamento profili esistenti
Non serve una migrazione schema. Per assegnare il teschio classico agli utenti che non hanno ancora avatar:

```powershell
npm install
npm run db:v14-avatar-defaults
```

## Avatar base
- Classico
- Capelli
- Cappello
- Occhiali
- Cuffie
- Baffi
- Pappagallo
- Gatto
- Felpa
- Corona
