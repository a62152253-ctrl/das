$files = Get-ChildItem -Path src -Recurse -Include "*.tsx","*.ts" -File
$count = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $originalContent = $content

    # Fix @/common/ imports - should be @/components/common/
    $content = $content -replace 'from [''"]@/common/', "from '@/components/common/"

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
