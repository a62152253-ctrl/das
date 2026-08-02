# fix-imports.ps1 – replace relative imports with '@/…' alias
# --------------------------------------------------------------

$projectRoot = "C:\Users\Andrzej\Downloads\stwurz-auth"
$componentsRoot = Join-Path $projectRoot "src\components"

if (-not (Test-Path $componentsRoot)) {
    Write-Host "❌ Components folder not found: $componentsRoot" -ForegroundColor Red
    exit 1
}

Write-Host "🔎 Scanning TS/TSX files..." -ForegroundColor Cyan

$files = Get-ChildItem -Path $componentsRoot -Recurse -File -Include *.ts,*.tsx

foreach ($file in $files) {
    # Read whole file as a single string
    $lines = Get-Content -Raw -Encoding UTF8 $file.FullName

    # Replace relative import prefixes with '@/'
    $updated = $lines -replace "import[^\"']*?(\"|')(?:\.\.\/)+", '$1$2@/'

    if ($updated -ne $lines) {
        $backup = "$($file.FullName).backup"
        if (-not (Test-Path $backup)) { Copy-Item $file.FullName $backup }

        [System.IO.File]::WriteAllText(
            $file.FullName,
            $updated,
            (New-Object System.Text.UTF8Encoding($false))
        )
        Write-Host "✅ Updated: $($file.FullName.Substring($projectRoot.Length + 1))" -ForegroundColor Green
    } else {
        Write-Host "✔ OK: $($file.Name)" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "🎉 DONE - imports migrated to @/" -ForegroundColor Green