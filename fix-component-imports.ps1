$files = Get-ChildItem -Path src -Recurse -Include "*.tsx","*.ts" -File
$count = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $originalContent = $content

    # Admin components - nested in dashboard subdirectory
    $content = $content -replace 'from [''"]@/AdminAdvancedPanel[''"]', "from '@/admin/dashboard/AdminAdvancedPanel'"
    $content = $content -replace 'from [''"]@/AdminUserModal[''"]', "from '@/admin/dashboard/AdminUserModal'"
    
    # Admin root level components
    $content = $content -replace 'from [''"]@/AdminUserAnalytics[''"]', "from '@/admin/AdminUserAnalytics'"
    $content = $content -replace 'from [''"]@/AdminGusVerifier[''"]', "from '@/admin/AdminGusVerifier'"
    $content = $content -replace 'from [''"]@/AdminAntiSpam[''"]', "from '@/admin/AdminAntiSpam'"
    $content = $content -replace 'from [''"]@/AdminAuditLogger[''"]', "from '@/admin/AdminAuditLogger'"
    $content = $content -replace 'from [''"]@/AdminSecurityRadar[''"]', "from '@/admin/AdminSecurityRadar'"
    $content = $content -replace 'from [''"]@/AdminModerationQueue[''"]', "from '@/admin/AdminModerationQueue'"
    $content = $content -replace 'from [''"]@/AdminSystemTelemetry[''"]', "from '@/admin/AdminSystemTelemetry'"
    $content = $content -replace 'from [''"]@/AdminNotificationCenter[''"]', "from '@/admin/AdminNotificationCenter'"
    
    # Client/Company dashboard imports
    $content = $content -replace 'from [''"]@/ClientDashboard[''"]', "from '@/components/client/ClientDashboard'"
    $content = $content -replace 'from [''"]@/CompanyDashboard[''"]', "from '@/components/company/CompanyDashboard'"
    $content = $content -replace 'from [''"]@/CompanyBookingsManager[''"]', "from '@/components/booking/CompanyBookingsManager'"

    # Root level component imports
    $content = $content -replace 'from [''"]@/Navbar[''"]', "from '@/components/Navbar'"
    $content = $content -replace 'from [''"]@/NotificationsPopover[''"]', "from '@/components/NotificationsPopover'"
    $content = $content -replace 'from [''"]@/ProfileCompleteness[''"]', "from '@/components/ProfileCompleteness'"
    $content = $content -replace 'from [''"]@/DarkModeToggle[''"]', "from '@/components/DarkModeToggle'"

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
