$files = Get-ChildItem -Path . -Include *.js, *.html, *.css -Recurse

function Fix-Content($content) {
    # 100% ASCII script to avoid shell corruption
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
    $content = $content.Replace("$c3$([char]0xA7)", [string][char]0xE7)  # ç
    $content = $content.Replace("$c3$([char]0xAA)", [string][char]0xEA)  # ê
    $content = $content.Replace("$c3$([char]0x89)", [string][char]0xC9)  # É
    $content = $content.Replace("$c3$([char]0x88)", [string][char]0xC8)  # È
    $content = $content.Replace("$c3$([char]0x80)", [string][char]0xC0)  # À
    $content = $content.Replace("$c3$([char]0x82)", [string][char]0xC2)  # Â
    
    # Symbols
    # € (0xE2 0x82 0xAC)
    $content = $content.Replace("$e2$([char]0x82)$([char]0xAC)", [string][char]0x20AC)
    # — (0xE2 0x80 0x94)
    $content = $content.Replace("$e2$([char]0x80)$([char]0x94)", [string][char]0x2014)
    # – (0xE2 0x80 0x93)
    $content = $content.Replace("$e2$([char]0x80)$([char]0x93)", [string][char]0x2013)
    # ✅ (0xE2 0x9C 0x85)
    $content = $content.Replace("$e2$([char]0x9C)$([char]0x85)", [string][char]0x2705)
    # ⚠️ (0xE2 0x9A 0xA0)
    $content = $content.Replace("$e2$([char]0x9A)$([char]0xA0)", [string][char]0x26A0)

    return $content
}

foreach ($file in $files) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $newContent = Fix-Content $content
        
        if ($content -ne $newContent) {
            $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
            [System.IO.File]::WriteAllText($file.FullName, $newContent, $utf8NoBom)
            Write-Host "Restored: $($file.Name)"
        }
    } catch {
        Write-Warning "Error in $($file.Name): $($_.Exception.Message)"
    }
}
Write-Host "Restoration Complete."
