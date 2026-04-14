$path = 'c:\Users\julia\Desktop\cout de revient\app.js'
$content = Get-Content $path -Raw -Encoding UTF8
# Remove BOM if present
$content = $content -replace "^\uFEFF", ""
# Fix the header
$content = $content -replace "/\*\s+={50,}\s+APP\.JS.*?={50,}\s+\*/", "/*`n  =====================================================================`n  APP.JS - GourmetRevient Professional Recipe Cost Calculator`n  Modular Vanilla JavaScript`n  =====================================================================`n*/"
# Fix major corruption patterns (common ones found in view_file)
$content = $content -replace "ÃƒÂ©", "é"
$content = $content -replace "ÃƒÂ¨", "è"
$content = $content -replace "ÃƒÂ ", "à"
$content = $content -replace "ÃƒÂ¢ââ€šÂ¬ââ‚¬Â", "-"
$content = $content -replace "Ã…â€œufs", "Oeufs"

Set-Content -Path $path -Value $content -Encoding UTF8
Write-Host "Repair complete"
