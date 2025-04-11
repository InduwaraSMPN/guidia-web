# PowerShell script to replace gray color classes with theme variables

# Define the mappings for text colors
$textMappings = @{
    'text-gray-400' = 'text-muted-foreground'
    'text-gray-500' = 'text-muted-foreground'
    'text-gray-600' = 'text-muted-foreground'
    'text-gray-700' = 'text-foreground'
    'text-gray-800' = 'text-foreground'
    'text-gray-900' = 'text-foreground'
}

# Define the mappings for background colors
$bgMappings = @{
    'bg-gray-50' = 'bg-secondary'
    'bg-gray-100' = 'bg-secondary-light'
    'bg-gray-200' = 'bg-secondary-dark'
    'bg-gray-300' = 'bg-secondary-dark'
    'bg-gray-400' = 'bg-secondary-dark'
    'bg-gray-500' = 'bg-muted'
}

# Define the mappings for border colors
$borderMappings = @{
    'border-gray-100' = 'border-border'
    'border-gray-200' = 'border-border'
    'border-gray-300' = 'border-border'
    'border-gray-400' = 'border-border'
    'border-gray-500' = 'border-border'
}

# Define the mappings for hover states
$hoverMappings = @{
    'hover:bg-gray-50' = 'hover:bg-secondary'
    'hover:bg-gray-100' = 'hover:bg-secondary-light'
    'hover:bg-gray-200' = 'hover:bg-secondary-dark'
    'hover:text-gray-200' = 'hover:text-muted-foreground'
    'hover:text-gray-500' = 'hover:text-muted-foreground'
    'hover:text-gray-600' = 'hover:text-foreground'
    'hover:text-gray-700' = 'hover:text-foreground'
    'hover:text-gray-800' = 'hover:text-foreground'
    'hover:border-gray-300' = 'hover:border-border'
}

# Combine all mappings
$allMappings = @{}
$textMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }
$bgMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }
$borderMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }
$hoverMappings.GetEnumerator() | ForEach-Object { $allMappings[$_.Key] = $_.Value }

# Get all TypeScript and React files
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts", "*.jsx", "*.js" | Where-Object { $_.FullName -notlike "*node_modules*" }

$totalReplacements = 0
$filesChanged = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $replacementsInFile = 0
    
    # Apply all mappings
    foreach ($mapping in $allMappings.GetEnumerator()) {
        $oldPattern = $mapping.Key
        $newPattern = $mapping.Value
        
        # Count occurrences before replacement
        $occurrences = [regex]::Matches($content, [regex]::Escape($oldPattern)).Count
        
        if ($occurrences -gt 0) {
            # Replace the pattern
            $content = $content -replace [regex]::Escape($oldPattern), $newPattern
            $replacementsInFile += $occurrences
            
            Write-Host "  - Replaced $occurrences occurrences of '$oldPattern' with '$newPattern'"
        }
    }
    
    # Only write to the file if changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content
        $filesChanged++
        $totalReplacements += $replacementsInFile
        Write-Host "Updated $($file.FullName) - Made $replacementsInFile replacements" -ForegroundColor Green
    }
}

Write-Host "`nTotal files changed: $filesChanged" -ForegroundColor Cyan
Write-Host "Total replacements made: $totalReplacements" -ForegroundColor Cyan
Write-Host "Script completed successfully!" -ForegroundColor Green
