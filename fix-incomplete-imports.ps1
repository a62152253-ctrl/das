$files = Get-ChildItem -Path src -Recurse -Include "*.tsx","*.ts" -File
$count = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $originalContent = $content

    # Fix incomplete imports - these need proper paths
    # Types imports
    $content = $content -replace 'from [''"]@/[''"]$', "from '@/types'" -creplace "(?m)^import \{ (Company|Service|Ad|Promotion|Booking|Review|Statistics|AuthView|Message|Conversation|Notification|FavoriteCompany|UserHistoryItem)[^}]* from '@/$", "import { `$1 from '@/types"
    
    # Try simpler approach - just scan and replace line by line
    $lines = $content -split "`n"
    $newLines = @()
    
    foreach ($line in $lines) {
        if ($line -match 'import .* from [''"]@/[''"]') {
            # Determine what kind of import this is
            if ($line -match 'from.*@/.*cn') {
                $line = $line -replace 'from [''"]@/[''"]', "from '@/lib/utils'"
            } elseif ($line -match 'from.*@/.*useToast|ToastType|toast') {
                $line = $line -replace 'from [''"]@/[''"]', "from '@/lib/useToast'"
            } elseif ($line -match 'from.*@/.*Company|Service|Ad|Promotion|Booking|Review|Statistics|AuthView|Message|Conversation|Notification|FavoriteCompany|UserHistoryItem') {
                $line = $line -replace 'from [''"]@/[''"]', "from '@/types'"
            } elseif ($line -match 'from.*@/.*getFirebaseDb|initFirebase') {
                $line = $line -replace 'from [''"]@/[''"]', "from '@/lib/firebase'"
            }
        }
        $newLines += $line
    }
    
    $content = $newLines -join "`n"

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
