# Script to replace hardcoded rose colors with theme variables
Write-Host "Starting to update rose colors to theme variables..."

# Define the replacements
$replacements = @(
    # Background colors
    @{
        Pattern = 'bg-\[\#800020\]'
        Replacement = 'bg-brand'
    },
    @{
        Pattern = 'hover:bg-rose-800'
        Replacement = 'hover:bg-brand-dark'
    },
    @{
        Pattern = 'bg-rose-50'
        Replacement = 'bg-brand/10'
    },
    @{
        Pattern = 'bg-rose-100'
        Replacement = 'bg-brand/20'
    },
    
    # Text colors
    @{
        Pattern = 'text-\[\#800020\]'
        Replacement = 'text-brand'
    },
    @{
        Pattern = 'hover:text-rose-800'
        Replacement = 'hover:text-brand-dark'
    },
    @{
        Pattern = 'text-rose-100'
        Replacement = 'text-brand-lighter'
    },
    @{
        Pattern = 'text-rose-800'
        Replacement = 'text-brand-dark'
    },
    @{
        Pattern = 'hover:text-rose-700'
        Replacement = 'hover:text-brand-dark'
    },
    
    # Border colors
    @{
        Pattern = 'border-\[\#800020\]'
        Replacement = 'border-brand'
    },
    
    # Focus ring
    @{
        Pattern = 'focus:ring-\[\#800020\]/30'
        Replacement = 'focus:ring-brand/30'
    }
)

# Get all TypeScript and React files
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" | Where-Object { $_.FullName -notlike "*node_modules*" }

$totalReplacements = 0
$filesModified = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    $fileModified = $false
    
    foreach ($replacement in $replacements) {
        $pattern = $replacement.Pattern
        $newValue = $replacement.Replacement
        
        # Check if the pattern exists in the file
        if ($content -match $pattern) {
            $replacementCount = 0
            $content = $content -replace $pattern, $newValue
            $replacementCount = ($originalContent | Select-String -Pattern $pattern -AllMatches).Matches.Count
            $totalReplacements += $replacementCount
            $fileModified = $true
            
            Write-Host "  - Replaced $replacementCount occurrences of '$pattern' with '$newValue' in $($file.Name)"
        }
    }
    
    # Only write to the file if changes were made
    if ($fileModified) {
        Set-Content -Path $file.FullName -Value $content
        $filesModified++
    }
}

Write-Host "Completed updating rose colors to theme variables."
Write-Host "Modified $filesModified files with a total of $totalReplacements replacements."
