$ErrorActionPreference = "Stop"
Write-Host "=== PayUp clean setup ===" -ForegroundColor Cyan
if (-not (Test-Path ".env.local")) {
  Write-Host "Manca .env.local. Copia .env.example in .env.local e inserisci DATABASE_URL e BLOB_READ_WRITE_TOKEN." -ForegroundColor Yellow
}
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install
Write-Host "Dipendenze installate." -ForegroundColor Green
Write-Host "Se non hai ancora aggiornato Neon, esegui: npm run db:friends-migrate" -ForegroundColor Yellow
Write-Host "Poi avvia con: npm run dev" -ForegroundColor Green
