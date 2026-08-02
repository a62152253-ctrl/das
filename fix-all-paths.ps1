$files = Get-ChildItem -Path src -Recurse -Include "*.tsx","*.ts" -File
$count = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $originalContent = $content

    # Fix all standalone bare imports that should be in lib/
    $content = $content -replace 'from [''"]@/firebase[''"]', "from '@/lib/firebase'"
    $content = $content -replace 'from [''"]@/RankingEngine[''"]', "from '@/lib/RankingEngine'"
    $content = $content -replace 'from [''"]@/AISearchEngine[''"]', "from '@/lib/AISearchEngine'"
    $content = $content -replace 'from [''"]@/NotificationEngine[''"]', "from '@/lib/NotificationEngine'"
    
    # Fix imports in search-related directories
    $content = $content -replace 'from [''"]@/botConstants[''"]', "from '@/search/bot/botConstants'"
    $content = $content -replace 'from [''"]@/botFilters[''"]', "from '@/search/bot/botFilters'"
    $content = $content -replace 'from [''"]@/BotSteps[''"]', "from '@/search/bot/BotSteps'"
    $content = $content -replace 'from [''"]@/OptionButton[''"]', "from '@/search/bot/OptionButton'"
    $content = $content -replace 'from [''"]@/MessageBubble[''"]', "from '@/search/bot/MessageBubble'"
    $content = $content -replace 'from [''"]@/SearchBar[''"]', "from '@/search/SearchBar'"

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
        Write-Host "Updated: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Total files updated: $count" -ForegroundColor Cyan
