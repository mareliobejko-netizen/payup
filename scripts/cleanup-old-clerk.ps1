# Safe cleanup for old PayUp versions that used Clerk.
# The current project does not depend on Clerk.
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "PayUp cache cleaned. Current source no longer requires Clerk." -ForegroundColor Green
