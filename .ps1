$ScriptDir = $PSScriptRoot

$FrontEndPath = Join-Path -Path $ScriptDir -ChildPath "frontend"
$BackEndPath = Join-Path -Path $ScriptDir -ChildPath "backend"

Write-Host "Starting development environment from: $ScriptDir"
Write-Host "-------------------------------------------------"

Write-Host "Launching Frontend Dev Server (npm run dev) in new window..."
$feArgs = "-NoExit -Command `"Set-Location '$FrontEndPath'; Write-Host 'Starting Frontend (npm run dev)...'; npm run dev`""
Start-Process powershell.exe -ArgumentList $feArgs -WorkingDirectory $FrontEndPath

Start-Sleep -Seconds 2

Write-Host "Launching Backend Server (npm run dev) in new window..."
$beArgs = "-NoExit -Command `"Set-Location '$BackEndPath'; Write-Host 'Starting Backend Server (npm run dev)...'; npm run dev`""
Start-Process powershell.exe -ArgumentList $beArgs -WorkingDirectory $BackEndPath

Write-Host "-------------------------------------------------"
Write-Host "All processes launched in separate PowerShell windows."
Write-Host "Check each window for output and status."