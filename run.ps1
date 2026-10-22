# FoodRescue Platform Launcher (PowerShell)
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "===================================================" -ForegroundColor Green
Write-Host "   Launching FoodRescue Full-Stack Platform...    " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Ensure node and php runtimes are in PATH
$env:PATH = "C:\Users\saisa\tools\node;C:\Users\saisa\tools\php;" + $env:PATH

# 1. Start PHP Backend in a new window
Write-Host "[1/3] Starting PHP Backend on http://127.0.0.1:8000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Users\saisa\tools\node;C:\Users\saisa\tools\php;' + `$env:PATH; Set-Location '$projectDir'; Write-Host 'FoodRescue PHP Backend running on port 8000...' -ForegroundColor Green; php -S 127.0.0.1:8000 backend/router.php"

# Wait 2 seconds
Start-Sleep -Seconds 2

# 2. Open Web Browser
Write-Host "[2/3] Opening browser at http://localhost:5173 ..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

# 3. Start Frontend in this window
Write-Host "[3/3] Starting React Frontend on http://localhost:5173 ..." -ForegroundColor Cyan
Set-Location "$projectDir\frontend"
npm run dev -- --host
