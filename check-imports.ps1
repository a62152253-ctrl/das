param(
    [string]$Root=".",
    [string]$Report="import-report.txt"
)

$extensions=@("ts","tsx","js","jsx")
$ignoreFolders=@("node_modules",".git","dist","build",".next","coverage","out","storybook-static",".cache",".turbo")
$ignoreFiles=@("*.d.ts","*.map","*.min.js")
$issues=[System.Collections.Generic.HashSet[string]]::new()

function Is-IgnoredFolder($Path){
    foreach($f in $ignoreFolders){
        if($Path -match "[\\/]" + [regex]::Escape($f) + "[\\/]"){return $true}
    }
    return $false
}

function Is-IgnoredFile($Name){
    foreach($f in $ignoreFiles){
        if($Name -like $f){return $true}
    }
    return $false
}

function Add-Issue($Text){
    $issues.Add($Text)|Out-Null
}

function Resolve-ImportPath($Path){
    foreach($v in @("",".ts",".tsx",".js",".jsx","\index.ts","\index.tsx","\index.js","\index.jsx")){
        if(Test-Path ($Path+$v)){return $true}
    }
    return $false
}

Write-Host "=== React TS Import Checker ==="
Write-Host "Root: $Root"

$files=Get-ChildItem $Root -Recurse -File|Where-Object{
    $ext=$_.Extension.TrimStart('.').ToLower()
    ($extensions -contains $ext) -and
    (-not(Is-IgnoredFolder $_.FullName)) -and
    (-not(Is-IgnoredFile $_.Name))
}

foreach($file in $files){
    $folder=Split-Path $file.FullName
    $lineNumber=0

    foreach($line in Get-Content $file.FullName){
        $lineNumber++

        foreach($m in [regex]::Matches($line,'(?:from\s+|import\s*\()\s*["'']([^"'']+)["'']')){
            $import=$m.Groups[1].Value

            if($import.StartsWith(".")){
                $target=[IO.Path]::GetFullPath((Join-Path $folder $import))

                if(-not(Resolve-ImportPath $target)){
                    Add-Issue "BRAK | $($file.Name):$lineNumber | $import"
                }

                if($import -match "^\./.+/\.\./"){
                    Add-Issue "PATH | $($file.Name):$lineNumber | $import"
                }

                $depth=([regex]::Matches($import,"\.\./")).Count
                if($depth -gt 6){
                    Add-Issue "DEPTH($depth) | $($file.Name):$lineNumber | $import"
                }
            }
        }

        $req=[regex]::Match($line,'require\((['"'])(.+?)\1\)')
        if($req.Success -and $req.Groups[1].Value.StartsWith('.')){
            $r=$req.Groups[1].Value
            if(-not(Resolve-ImportPath ([IO.Path]::GetFullPath((Join-Path $folder $r))))){
                Add-Issue "REQUIRE | $($file.Name):$lineNumber | $r"
            }
        }
    }
}

if($issues.Count){
    $issues|Out-File $Report -Encoding UTF8
    Write-Host "Problemy: $($issues.Count)"
    Write-Host "Raport: $Report"
}else{
    "OK - brak problemow"|Out-File $Report -Encoding UTF8
    Write-Host "OK"
}