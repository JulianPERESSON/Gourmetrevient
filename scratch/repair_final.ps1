# Final Remediation Script - ASCII Safe
$files = Get-ChildItem -Path . -Include *.js, *.html, *.css -Recurse

function Fix-Content($content) {
    # Programmatic targets to avoids corruption of THIS script
    $c3 = [char]0xC3
    $e2 = [char]0xE2
    
    # French Accents
    $content = $content.Replace("$c3$([char]0xA9)", [string][char]0xE9)  # é
    $content = $content.Replace("$c3$([char]0xA8)", [string][char]0xE8)  # è
    $content = $content.Replace("$c3$([char]0xA0)", [string][char]0xE0)  # à
    $content = $content.Replace("$c3$([char]0xA2)", [string][char]0xE2)  # â
    $content = $content.Replace("$c3$([char]0xB4)", [string][char]0xF4)  # ô
    $content = $content.Replace("$c3$([char]0xBB)", [string][char]0xFB)  # û
    $content = $content.Replace("$c3$([char]0xAE)", [string][char]0xEE)  # î
    $content = $content.Replace("$c3$([char]0xAA)", [string][char]0xEA)  # ê
    $content = $content.Replace("$c3$([char]0xA7)", [string][char]0xE7)  # ç
    $content = $content.Replace("$c3$([char]0x89)", [string][char]0xC9)  # É
    
    # Symbols
    $content = $content.Replace("$e2$([char]0x82)$([char]0xAC)", [string][char]0x20AC) # €
    $content = $content.Replace("$e2$([char]0x9C)$([char]0x85)", [string][char]0x2705) # ✅
    $content = $content.Replace("$e2$([char]0x9A)$([char]0xA0)", [string][char]0x26A0) # ⚠️
    
    return $content
}

foreach ($file in $files) {
    try {
        # Try reading as UTF-8
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $newContent = Fix-Content $content
        
        # Always rewrite to ensure UTF8 with BOM (system-default on Windows often helps browsers)
        # Using [System.Text.Encoding]::UTF8 includes the BOM by default in .NET
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Processed and Enforced UTF8-BOM: $($file.Name)"
    } catch {
        Write-Warning "Skip $($file.Name): $($_.Exception.Message)"
    }
}
Write-Host "Global Repair Complete."
