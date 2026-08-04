# ============================================================
# deploy.ps1 - Vite React FTP Deployment
# ============================================================

$ErrorActionPreference = "Stop"

# FTP CONFIG
$ftpHost = "ftp.searchpoint.pl"
$ftpUser = "searchpoint_pl@searchpoint.pl"   # ← prawidłowy login (zgodny z poprzednimi wersjami)
$ftpPass = "m3mCku6V"

# katalog strony na FTP
$remoteDir = "searchpoint_pl"   # ← katalog, do którego chcesz wrzucić pliki
$localDir = Join-Path $PSScriptRoot "dist"   # lokalny folder build



# ============================================================
# BUILD
# ============================================================

Write-Host "🏗 Building React app..." -ForegroundColor Cyan

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}


if (!(Test-Path $localDir)) {
    Write-Host "❌ dist folder missing" -ForegroundColor Red
    exit 1
}


# ============================================================
# FTP HELPERS
# ============================================================

function Invoke-FtpRequest($uri, $method) {

    $request = [System.Net.FtpWebRequest]::Create($uri)
    $request.Proxy = $null

    $request.Credentials =
        New-Object System.Net.NetworkCredential(
            $ftpUser,
            $ftpPass
        )

    $request.Method = $method

    # IMPORTANT FOR HOME.PL
    $request.UsePassive = $true
    $request.UseBinary = $true
    $request.KeepAlive = $false

    $request.Timeout = 120000
    $request.ReadWriteTimeout = 120000

    return $request
}



function Create-FtpDirectory($path) {

    try {

        $uri = "ftp://$ftpHost/$path"

        $req = Invoke-FtpRequest `
            $uri `
            ([System.Net.WebRequestMethods+Ftp]::MakeDirectory)

        $resp = $req.GetResponse()
        $resp.Close()

    }
    catch {
        # folder already exists
    }
}



function Upload-File($localFile,$remoteFile) {


    $uri = "ftp://$ftpHost/$remoteFile"


    # create folders
    $folder =
        Split-Path $remoteFile -Parent


    if ($folder) {

        $parts = $folder.Split("/")

        $current = ""

        foreach ($p in $parts) {

            if ($p) {

                $current += "/$p"

                Create-FtpDirectory $current
            }
        }
    }


    Write-Host "⬆ $remoteFile"


    $req = Invoke-FtpRequest `
        $uri `
        ([System.Net.WebRequestMethods+Ftp]::UploadFile)



    $bytes =
        [System.IO.File]::ReadAllBytes($localFile)


    $req.ContentLength = $bytes.Length


    $stream =
        $req.GetRequestStream()


    $stream.Write(
        $bytes,
        0,
        $bytes.Length
    )


    $stream.Close()


    $resp =
        $req.GetResponse()

    $resp.Close()
}



# ============================================================
# CLEAN REMOTE
# ============================================================

Write-Host "🔌 Connecting FTP..." -ForegroundColor Cyan


# ============================================================
# UPLOAD DIST
# ============================================================


Write-Host "📦 Uploading dist..." -ForegroundColor Cyan


$files =
    Get-ChildItem `
        $localDir `
        -Recurse `
        -File



foreach ($file in $files) {


    $relative =
        $file.FullName.Substring(
            $localDir.Length + 1
        )


    $relative =
        $relative.Replace("\","/")


    $remote =
        "$remoteDir/$relative"



    Upload-File `
        $file.FullName `
        $remote
}



# ============================================================
# VERIFY
# ============================================================


Write-Host ""
Write-Host "🔎 Checking index.html..."


if (!(Test-Path "$localDir/index.html")) {

    Write-Host "❌ Missing index.html" -ForegroundColor Red
    exit 1
}


Write-Host ""
Write-Host "================================="
Write-Host "🚀 DEPLOY COMPLETE"
Write-Host "=================================""