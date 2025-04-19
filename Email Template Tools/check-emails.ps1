# Email Template Tools PowerShell Script

# Function to show menu and get user choice
function Show-Menu {
    Clear-Host
    Write-Host "===== Email Template Tools =====" -ForegroundColor Cyan
    Write-Host "1: Check email templates for issues"
    Write-Host "2: Generate email template previews"
    Write-Host "3: Run both tools"
    Write-Host "4: Exit"
    Write-Host "================================" -ForegroundColor Cyan

    $choice = Read-Host "Enter your choice (1-4)"
    return $choice
}

# Skip dependency installation
Write-Host "Starting Email Template Tools..." -ForegroundColor Cyan
# Dependencies already installed

# Show menu and process user choice
$choice = Show-Menu

switch ($choice) {
    "1" {
        Write-Host "`nRunning email template checker..." -ForegroundColor Cyan
        node "$PSScriptRoot\email-template-checker.js"
    }
    "2" {
        Write-Host "`nGenerating email template previews..." -ForegroundColor Cyan
        node "$PSScriptRoot\email-template-previewer.js"

        # Open the preview index in the default browser
        $previewPath = Join-Path -Path $PSScriptRoot -ChildPath "email-previews\index.html"
        if (Test-Path $previewPath) {
            Write-Host "`nOpening preview in browser..." -ForegroundColor Cyan
            Start-Process $previewPath
        }
    }
    "3" {
        Write-Host "`nRunning email template checker..." -ForegroundColor Cyan
        node "$PSScriptRoot\email-template-checker.js"

        Write-Host "`nGenerating email template previews..." -ForegroundColor Cyan
        node "$PSScriptRoot\email-template-previewer.js"

        # Open the preview index in the default browser
        $previewPath = Join-Path -Path $PSScriptRoot -ChildPath "email-previews\index.html"
        if (Test-Path $previewPath) {
            Write-Host "`nOpening preview in browser..." -ForegroundColor Cyan
            Start-Process $previewPath
        }
    }
    "4" {
        Write-Host "Exiting..." -ForegroundColor Cyan
        exit
    }
    default {
        Write-Host "Invalid choice. Please try again." -ForegroundColor Red
    }
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
