# PowerShell script to replace text-gray-900 with text-adaptive-dark in specified files

$filesToUpdate = @(
    "src\components\admin\AdminsTable.tsx",
    "src\components\admin\ApprovedRegistrationsTable.tsx",
    "src\components\admin\CompaniesTable.tsx",
    "src\components\admin\CounselorsTable.tsx",
    "src\components\admin\DeclinedRegistrationsTable.tsx",
    "src\components\admin\EventsTable.tsx",
    "src\components\admin\NewsTable.tsx",
    "src\components\admin\StudentsTable.tsx",
    "src\components\document\DocumentPreview.tsx",
    "src\components\profile\FilePreview.tsx",
    "src\components\ChatMessage.tsx",
    "src\components\DirectoryCard.tsx",
    "src\components\EventCard.tsx",
    "src\components\JobModal.tsx",
    "src\components\NewsCard.tsx",
    "src\components\NotificationsPopover.tsx",
    "src\components\StudentDocumentCard.tsx",
    "src\features\chat\components\chat-detail.tsx",
    "src\pages\welcome\WelcomeUploadDocument.tsx",
    "src\pages\AdminDashboard.tsx",
    "src\pages\ChatList.tsx",
    "src\pages\ChatPage.tsx",
    "src\pages\CompanyDetailsPage.tsx",
    "src\pages\CompanyJobsPage.tsx",
    "src\pages\CompanyProfilePage.tsx",
    "src\pages\ConversationsList.tsx",
    "src\pages\CounselorProfilePage.tsx",
    "src\pages\JobApplication.tsx",
    "src\pages\JobDetailsPage.tsx",
    "src\pages\JobsPage.tsx",
    "src\pages\StudentProfilePage.tsx",
    "src\pages\ViewJobApplications.tsx"
)

$replacementCount = 0

foreach ($file in $filesToUpdate) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Replace text-gray-900 with text-adaptive-dark
        $newContent = $content -replace 'text-gray-900', 'text-adaptive-dark'
        
        # Only write to the file if changes were made
        if ($newContent -ne $originalContent) {
            Set-Content -Path $file -Value $newContent
            $changedLines = ($originalContent -split "`n").Count - ($newContent -split "`n").Count
            $replacementCount += [regex]::Matches($originalContent, 'text-gray-900').Count
            Write-Host "Updated $file - Replaced 'text-gray-900' with 'text-adaptive-dark'"
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nTotal replacements made: $replacementCount" -ForegroundColor Green
Write-Host "Script completed successfully!" -ForegroundColor Green
