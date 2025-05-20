@echo off
setlocal

REM Get the directory of the batch script
set "ScriptDir=%~dp0"

REM Construct paths for frontend and backend, removing trailing backslash from ScriptDir if present
set "FrontEndPath=%ScriptDir%frontend"
set "BackEndPath=%ScriptDir%backend"

echo Starting development environment from: %ScriptDir%
echo -------------------------------------------------

echo Launching Frontend Dev Server (npm run dev) in new window...
start "Frontend Dev Server" cmd /k "cd /d "%FrontEndPath%" && echo Starting Frontend (npm run dev)... && npm run dev"

REM Optional: Add a small delay if needed, though 'start' is non-blocking
REM timeout /t 2 /nobreak >nul

echo Launching Backend Server (npm run dev) in new window...
start "Backend Server" cmd /k "cd /d "%BackEndPath%" && echo Starting Backend Server (npm run dev)... && npm run dev"

echo -------------------------------------------------
echo All processes launched in separate command prompt windows.
echo Check each window for output and status.

endlocal