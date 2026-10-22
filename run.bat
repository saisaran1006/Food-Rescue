@echo off
title FoodRescue Platform Launcher
color 0A

echo ===================================================
echo     Launching FoodRescue Full-Stack Platform...
echo ===================================================

:: Ensure tools PATH is present in current session
set "PATH=C:\Users\saisa\tools\node;C:\Users\saisa\tools\php;%PATH%"

:: 1. Start PHP Backend server in a separate background window
echo [1/3] Starting PHP Backend API on http://127.0.0.1:8000 ...
start "FoodRescue Backend (PHP)" cmd /k "set PATH=C:\Users\saisa\tools\node;C:\Users\saisa\tools\php;%%PATH%% && cd /d "%~dp0" && php -S 127.0.0.1:8000 backend/router.php"

:: Wait 2 seconds for backend to initialize
timeout /t 2 /nobreak >nul

:: 2. Launch default web browser to the frontend
echo [2/3] Opening browser at http://localhost:5173 ...
start http://localhost:5173

:: 3. Start React Frontend Vite Dev Server
echo [3/3] Starting React Frontend on http://localhost:5173 ...
cd /d "%~dp0frontend"
npm run dev -- --host

pause
