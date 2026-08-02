$files = Get-ChildItem -Path src -Recurse -Include "*.tsx","*.ts" -File
$count = 0
$mapping = @{
    '@/firebase' = '@/lib/firebase'
    '@/RankingEngine' = '@/lib/RankingEngine'
    '@/AISearchEngine' = '@/lib/AISearchEngine'
    '@/NotificationEngine' = '@/lib/NotificationEngine'
    '@/types' = '@/types'
    '@/botConstants' = '@/bot/botConstants'
    '@/botFilters' = '@/search/bot/botFilters'
    '@/BotSteps' = '@/search/bot/BotSteps'
    '@/OptionButton' = '@/search/bot/OptionButton'
    '@/MessageBubble' = '@/search/bot/MessageBubble'
    '@/AdminAdvancedPanel' = '@/admin/dashboard/AdminAdvancedPanel'
    '@/AdminUserModal' = '@/AdminUserModal'
    '@/Navbar' = '@/Navbar'
    '@/NotificationsPopover' = '@/NotificationsPopover'
    '@/ProfileCompleteness' = '@/ProfileCompleteness'
    '@/SearchBar' = '@/search/SearchBar'
    '@/App' = '@/App'
}

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $originalContent = $content

    foreach ($old in $mapping.Keys) {
        $new = $mapping[$old]
        $content = $content -replace [regex]::Escape($old) + '(?![/\w])', $new
    }

    if ($content -ne $originalContent) {
        $backup = "$($file.FullName).backup"
        if (!(Test-Path $backup)) {
            Copy-Item $file.FullName $backup
        }

        [System.IO.File]::WriteAllText(
            $file.FullName,
            $content,
            (New-Object System.Text.UTF8Encoding($false))
        )

        $count++
        Write-Host "✅ Updated: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 Total files updated: $count" -ForegroundColor Cyan
