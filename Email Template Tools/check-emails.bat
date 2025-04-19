@echo off
setlocal enabledelayedexpansion

:menu
cls
echo ===== Email Template Tools =====
echo 1: Check email templates for issues
echo 2: Generate email template previews
echo 3: Run both tools
echo 4: Exit
echo ================================

set /p choice=Enter your choice (1-4):

echo Starting Email Template Tools...
:: Dependencies already installed

if "%choice%"=="1" goto check
if "%choice%"=="2" goto preview
if "%choice%"=="3" goto both
if "%choice%"=="4" goto end

echo Invalid choice. Please try again.
goto menu

:check
echo.
echo Running email template checker...
node "%~dp0email-template-checker.js"
goto end

:preview
echo.
echo Generating email template previews...
node "%~dp0email-template-previewer.js"

echo.
echo Opening preview in browser...
start "" "%~dp0email-previews\index.html"
goto end

:both
echo.
echo Running email template checker...
node "%~dp0email-template-checker.js"

echo.
echo Generating email template previews...
node "%~dp0email-template-previewer.js"

echo.
echo Opening preview in browser...
start "" "%~dp0email-previews\index.html"
goto end

:end
echo.
echo Press any key to exit...
pause > nul
